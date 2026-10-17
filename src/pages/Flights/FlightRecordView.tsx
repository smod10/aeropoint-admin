import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Plane, RefreshCw, Save, Tag, Undo2 } from 'lucide-react';
import { useCurrency, type Currency } from '../../context/CurrencyContext';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { readFlightInventory, readFlightMarkupRule, writeFlightMarkupRule } from '../../utils/flightStorage';
import { fetchApiFlights, getFlightInventoryEndpoint, getFlightRevalidateEndpoint, revalidateApiFlight } from '../../services/flightInventoryApi';
import type { FareMarkupRule, FareOffer, FarePrice, FlightInventoryRecord } from '../../types/flight';

const NOT_PROVIDED = 'Not provided';

const orNotProvided = (value?: string) => value || NOT_PROVIDED;

function formatDateTime(value?: string) {
  if (!value) return NOT_PROVIDED;
  const date = new Date(value);
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(date.getTime()) ? date.toLocaleString() : value;
}

function toNgn(amount: number | undefined, currency: string | undefined, rates: Record<Currency, number>) {
  if (amount === undefined || !currency || !Object.hasOwn(rates, currency)) return undefined;
  const rate = rates[currency as Currency];
  return Number.isFinite(rate) && rate > 0 ? amount * rate : undefined;
}

// Supplier figures are only converted; markup and the final price are derived separately and never written back to the offer.
function computePrice(price: FarePrice, currency: string | undefined, rule: FareMarkupRule | undefined, rates: Record<Currency, number>) {
  const base = toNgn(price.baseFare ?? price.supplierFare, currency, rates);
  const taxes = toNgn(price.taxesAndFees, currency, rates);
  const supplierTotal = toNgn(price.supplierTotal, currency, rates) ?? (base !== undefined && taxes !== undefined ? base + taxes : undefined);

  let markup: number | undefined;
  let selling: number | undefined;
  if (rule) {
    if (supplierTotal !== undefined) {
      markup = rule.type === 'percent' ? supplierTotal * rule.value / 100 : rule.value;
      selling = supplierTotal + markup;
    }
  } else {
    markup = toNgn(price.markup, currency, rates);
    selling = toNgn(price.sellingPrice, currency, rates) ?? (supplierTotal !== undefined && markup !== undefined ? supplierTotal + markup : undefined);
  }
  return { base, taxes, supplierTotal, markup, selling, ruleBlocked: Boolean(rule) && supplierTotal === undefined };
}

const passengerLabel = (price: FarePrice) => price.passengerCombination ? `Combination: ${price.passengerCombination}` : price.passengerType || NOT_PROVIDED;

const sectionTitle = 'mb-3 flex items-center gap-2 text-base font-semibold text-gray-900';
const labelClass = 'text-xs font-semibold uppercase text-gray-500';
const valueClass = 'mt-1 text-sm font-medium text-gray-900 break-words';

function OfferCard({ flight, offer, index, total, canManageMarkup }: { flight: FlightInventoryRecord; offer: FareOffer; index: number; total: number; canManageMarkup: boolean }) {
  const { convertToNGNAndFormat, exchangeRates } = useCurrency();
  // Markup is stored per offer: different brands and cabins fall under different supplier agreements.
  const markupKey = `${flight.id}::${offer.id}`;
  const [rule, setRule] = useState<FareMarkupRule>();
  const [form, setForm] = useState({ type: 'percent', value: '', note: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const saved = readFlightMarkupRule(markupKey);
    setRule(saved);
    setForm({ type: saved?.type ?? 'percent', value: saved ? String(saved.value) : '', note: saved?.note ?? '' });
    setFormError('');
  }, [markupKey]);

  const formatNgn = (value?: number) => value === undefined ? NOT_PROVIDED : convertToNGNAndFormat(value, 'NGN');
  const title = [offer.cabinClass, offer.fareBrand].filter(Boolean).join(' · ') || 'Fare offer';
  const rows = offer.prices.map(price => ({ price, figures: computePrice(price, offer.currency, rule, exchangeRates) }));
  const hasCombination = offer.prices.some(price => price.passengerCombination);
  const currencyLabel = !offer.currency ? NOT_PROVIDED : Object.hasOwn(exchangeRates, offer.currency) ? `NGN (from ${offer.currency})` : `Rate unavailable (${offer.currency})`;

  const saveMarkup = () => {
    const value = Number(form.value);
    if (!form.value.trim() || !Number.isFinite(value) || value < 0) return setFormError('Enter a markup of zero or more.');
    if (form.type === 'percent' && value > 100) return setFormError('A percentage markup cannot exceed 100%.');
    const next: FareMarkupRule = { type: form.type as FareMarkupRule['type'], value, ...(form.note.trim() ? { note: form.note.trim() } : {}), updatedAt: new Date().toISOString(), updatedBy: getCurrentActorRole() };
    writeFlightMarkupRule(markupKey, next);
    setRule(next);
    setFormError('');
  };

  const removeMarkup = () => {
    writeFlightMarkupRule(markupKey, undefined);
    setRule(undefined);
    setForm({ type: 'percent', value: '', note: '' });
    setFormError('');
  };

  return (
    <article aria-label={`Fare offer ${index + 1}: ${title}`} className="space-y-5 border-y border-gray-200 py-5">
      <h3 className="text-sm font-semibold text-gray-900">Offer {index + 1} of {total} · {title}</h3>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className={labelClass}>Cabin Class</p><p className={valueClass}>{orNotProvided(offer.cabinClass)}</p></div>
        <div><p className={labelClass}>Fare Type / Brand</p><p className={valueClass}>{orNotProvided(offer.fareBrand)}</p></div>
        <div><p className={labelClass}>Fare Basis</p><p className={valueClass}>{orNotProvided(offer.fareBasis)}</p></div>
        <div><p className={labelClass}>Booking Class</p><p className={valueClass}>{orNotProvided(offer.bookingClass)}</p></div>
        <div><p className={labelClass}>Baggage Allowance</p><p className={valueClass}>{orNotProvided(offer.baggage)}</p></div>
        <div><p className={labelClass}>Availability</p><p className={valueClass}>{orNotProvided(offer.availability)}</p></div>
        <div><p className={labelClass}>Offer Valid Until</p><p className={valueClass}>{formatDateTime(offer.validUntil)}</p></div>
        {offer.importBatchId && <div><p className={labelClass}>Import Batch</p><p className={valueClass}>{offer.importBatchId}</p></div>}
        <div className="sm:col-span-2 lg:col-span-4"><p className={labelClass}>Fare Conditions</p><p className="mt-1 whitespace-pre-line text-sm text-gray-900">{orNotProvided(offer.conditions)}</p></div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Fare Pricing</h4>
        {rows.length > 0 ? <>
          <div className="overflow-x-auto border-y border-gray-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-[11px] uppercase text-gray-500"><tr>{['Passenger Type', 'Base Fare', 'Taxes and Fees', 'Supplier Total', 'AeroPoint Markup', 'Final Selling Price', 'Currency'].map(label => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">{rows.map(({ price, figures }, rowIndex) => <tr key={rowIndex}><td className="px-3 py-3 text-gray-900">{passengerLabel(price)}</td><td className="px-3 py-3">{formatNgn(figures.base)}</td><td className="px-3 py-3">{formatNgn(figures.taxes)}</td><td className="px-3 py-3">{formatNgn(figures.supplierTotal)}</td><td className="px-3 py-3">{figures.ruleBlocked ? 'Supplier total required' : formatNgn(figures.markup)}</td><td className="px-3 py-3 font-medium text-gray-900">{formatNgn(figures.selling)}</td><td className="px-3 py-3">{currencyLabel}</td></tr>)}</tbody>
            </table>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-gray-500">
            <li>Amounts are converted to NGN at the admin exchange rate. Supplier figures are shown as supplied; unsupplied values are not estimated.</li>
            <li>Supplier total is shown as supplied; if not supplied it is base fare plus taxes and fees, only when both are provided.</li>
            {hasCombination && <li>Combination rows are the supplier's total for that passenger group, not individual passenger fares.</li>}
          </ul>
        </> : <p className="border-y border-gray-200 py-6 text-center text-sm text-gray-500">No pricing was supplied for this offer.</p>}
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Tag size={15} className="text-primary-600" /> AeroPoint Markup for this offer</h4>
        <p className="mb-3 max-w-3xl text-sm text-gray-600">Final selling price = supplier total + AeroPoint markup. The markup is stored separately and never changes the supplier's fare data.</p>
        {canManageMarkup ? <div className="grid max-w-3xl gap-4 sm:grid-cols-4">
          <label className="text-xs font-semibold text-gray-600">Markup type<select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-800"><option value="percent">Percentage of supplier total</option><option value="fixed">Fixed amount (NGN)</option></select></label>
          <label className="text-xs font-semibold text-gray-600">{form.type === 'percent' ? 'Percentage (%)' : 'Amount (₦)'}<input type="number" min="0" step="0.01" value={form.value} onChange={event => setForm(current => ({ ...current, value: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-800" /></label>
          <label className="text-xs font-semibold text-gray-600 sm:col-span-2">Supplier agreement / note<input type="text" value={form.note} onChange={event => setForm(current => ({ ...current, note: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-800" /></label>
          <div className="flex flex-wrap gap-2 sm:col-span-4"><button type="button" onClick={saveMarkup} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><Save size={15} /> Save markup</button>{rule && <button type="button" onClick={removeMarkup} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Undo2 size={15} /> Remove markup</button>}</div>
          {formError && <p role="alert" className="text-sm text-red-700 sm:col-span-4">{formError}</p>}
        </div> : <p className="text-sm text-gray-600">Only authorised administrators can change markup.</p>}
        {rule ? <p className="mt-3 text-xs text-gray-500">Active rule: {rule.type === 'percent' ? `${rule.value}% of supplier total` : `${convertToNGNAndFormat(rule.value, 'NGN')} fixed`}{rule.note ? ` · ${rule.note}` : ''} · updated {new Date(rule.updatedAt).toLocaleString()} by {rule.updatedBy.replace('_', ' ')}. Stored in this browser.</p> : <p className="mt-3 text-xs text-gray-500">No AeroPoint markup rule is configured for this offer; markup and final price are shown only where supplied.</p>}
      </div>
    </article>
  );
}

export default function FlightRecordView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { convertToNGNAndFormat } = useCurrency();
  const canManageMarkup = canManageTeam(getCurrentActorRole());
  const stateFlight = (location.state as { flight?: FlightInventoryRecord } | null)?.flight;
  const localFlight = useMemo(() => readFlightInventory().find(record => record.id === (id || '')), [id]);
  const [apiFlight, setApiFlight] = useState<FlightInventoryRecord>();
  const [apiLoadError, setApiLoadError] = useState('');
  const [revalidated, setRevalidated] = useState<FlightInventoryRecord>();
  const [revalidating, setRevalidating] = useState(false);
  const [revalidateMessage, setRevalidateMessage] = useState('');
  const apiEndpoint = getFlightInventoryEndpoint();
  const revalidateEndpoint = getFlightRevalidateEndpoint();

  useEffect(() => {
    if (stateFlight || localFlight || !apiEndpoint) return;
    let cancelled = false;
    fetchApiFlights().then(records => {
      const match = records.find(record => record.id === id || record.flightNumber === id);
      if (!cancelled) setApiFlight(match);
    }).catch(() => {
      if (!cancelled) setApiLoadError('The configured API flight record could not be retrieved.');
    });
    return () => { cancelled = true; };
  }, [apiEndpoint, id, localFlight, stateFlight]);

  const flight = revalidated || stateFlight || localFlight || apiFlight;

  if (!flight) return <div className="space-y-4"><button onClick={() => navigate('/flights')} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft size={16} /> Flights Management</button><p role="alert" className="border-y border-gray-200 py-8 text-center text-sm text-gray-600">{apiLoadError || 'Flight record not found.'}</p></div>;

  const isSample = flight.sourceType === 'sample';
  const isApi = flight.sourceType === 'api';
  const lastUpdated = isApi ? flight.retrievedAt : flight.sourceType === 'import' ? flight.importedAt : undefined;
  const cabins = Array.from(new Set(flight.offers.flatMap(offer => offer.cabinClass ? [offer.cabinClass] : [])));

  const pricingStatus = isApi
    ? revalidated ? 'Revalidated with supplier' : 'Supplier API pricing, not revalidated'
    : isSample ? 'Sample data, not live' : 'Imported snapshot, not live';
  const sourceLabel = isApi ? `API provider: ${flight.provider || flight.sourceName}` : isSample ? 'Sample data' : `AIR/CSV import: ${flight.sourceName}`;

  const runRevalidation = async () => {
    setRevalidating(true);
    setRevalidateMessage('');
    try {
      const result = await revalidateApiFlight(flight.id);
      if (!result) setRevalidateMessage('The supplier did not return a valid fare for this flight. It may no longer be available.');
      else {
        setRevalidated({ ...result, retrievedAt: result.retrievedAt || new Date().toISOString() });
        setRevalidateMessage('Fares and availability were revalidated with the supplier.');
      }
    } catch {
      setRevalidateMessage('Supplier revalidation failed. Do not confirm a booking until the fare is revalidated.');
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flights')} aria-label="Back to Flight Management" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><ArrowLeft size={17} /></button>
          <div><h1 className="text-xl font-bold text-gray-900">{flight.airline} · {flight.flightNumber}</h1><p className="mt-1 text-sm text-gray-500">{flight.origin} → {flight.destination}</p></div>
        </div>
        <button type="button" onClick={runRevalidation} disabled={!isApi || !revalidateEndpoint || revalidating} title={!isApi ? 'Only API-sourced fares can be revalidated with a supplier' : !revalidateEndpoint ? 'Supplier revalidation endpoint is not configured' : 'Re-price this flight with the supplier'} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"><RefreshCw size={15} className={revalidating ? 'animate-spin' : ''} /> {revalidating ? 'Revalidating…' : 'Revalidate with supplier'}</button>
      </header>

      <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><div><p className="font-medium">{pricingStatus}</p><p className="mt-0.5">{isApi ? 'Prices and availability are dynamic. Revalidate the chosen fare offer and availability with the supplier before booking.' : isSample ? 'This is legacy sample data, not live inventory or a supplier quote.' : 'Imported fares are file snapshots, not live inventory. Verify the fare and availability with a compatible supplier before confirming a booking.'}{isApi && !revalidateEndpoint && ' Supplier revalidation is not configured (VITE_FLIGHT_REVALIDATE_ENDPOINT).'}</p>{revalidateMessage && <p role="status" className="mt-1 font-medium">{revalidateMessage}</p>}</div></div>

      <section aria-labelledby="flight-details">
        <h2 id="flight-details" className={sectionTitle}><Plane size={17} className="text-primary-600" /> Flight Details</h2>
        <div className="grid gap-5 border-y border-gray-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className={labelClass}>Airline</p><p className={valueClass}>{orNotProvided(flight.airline)}</p></div>
          <div><p className={labelClass}>Flight Number</p><p className={valueClass}>{orNotProvided(flight.flightNumber)}</p></div>
          <div><p className={labelClass}>Origin</p><p className={valueClass}>{orNotProvided(flight.origin)}</p></div>
          <div><p className={labelClass}>Destination</p><p className={valueClass}>{orNotProvided(flight.destination)}</p></div>
          <div><p className={labelClass}>Departure</p><p className={valueClass}>{formatDateTime(flight.departure)}</p></div>
          <div><p className={labelClass}>Arrival</p><p className={valueClass}>{formatDateTime(flight.arrival)}</p></div>
          <div><p className={labelClass}>Cabin Classes Offered</p><p className={valueClass}>{cabins.length > 0 ? cabins.join(', ') : orNotProvided(flight.cabinClass)}</p></div>
          <div><p className={labelClass}>Fare Offers</p><p className={valueClass}>{isSample ? NOT_PROVIDED : flight.offers.length}</p></div>
          <div><p className={labelClass}>Availability</p><p className={valueClass}>{isSample ? 'Not live' : orNotProvided(flight.availability)}</p></div>
          <div><p className={labelClass}>Status</p><p className={valueClass}>{isSample ? 'Sample only' : flight.status === 'verification-required' ? 'Supplier verification required' : flight.status === 'unknown' ? NOT_PROVIDED : flight.status === 'active' ? 'Active' : 'Inactive'}</p></div>
        </div>
      </section>

      <section aria-labelledby="fare-offers">
        <h2 id="fare-offers" className={sectionTitle}>Fare Offers</h2>
        {isSample && flight.samplePrices ? <div className="overflow-x-auto border-y border-gray-200"><table className="w-full max-w-2xl text-left text-sm"><thead className="text-[11px] uppercase text-gray-500"><tr><th className="px-3 py-3 font-semibold">Passenger Type</th><th className="px-3 py-3 font-semibold">Legacy Sample Amount (NGN)</th></tr></thead><tbody className="divide-y divide-gray-100">{Object.entries(flight.samplePrices).map(([passengerType, amount]) => <tr key={passengerType}><td className="px-3 py-3 text-gray-900">{passengerType}</td><td className="px-3 py-3">{convertToNGNAndFormat(amount, 'USD')}</td></tr>)}</tbody></table></div>
          : flight.offers.length > 0 ? <>
            <p className="mb-3 text-sm text-gray-600">This flight has {flight.offers.length} fare {flight.offers.length === 1 ? 'offer' : 'offers'}. Cabin, brand, baggage, conditions and price can differ between offers, so each is shown and priced separately.</p>
            <div className="space-y-6">{flight.offers.map((offer, index) => <OfferCard key={offer.id} flight={flight} offer={offer} index={index} total={flight.offers.length} canManageMarkup={canManageMarkup} />)}</div>
          </> : <p className="border-y border-gray-200 py-8 text-center text-sm text-gray-500">No fare offers were supplied for this record.</p>}
      </section>

      <section aria-labelledby="fare-source">
        <h2 id="fare-source" className={sectionTitle}>Source & Pricing Status</h2>
        <div className="grid gap-5 border-y border-gray-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className={labelClass}>Source</p><p className={valueClass}>{sourceLabel}</p></div>
          <div><p className={labelClass}>Pricing Status</p><p className={valueClass}>{pricingStatus}</p></div>
          <div><p className={labelClass}>Last Updated</p><p className={valueClass}>{lastUpdated ? new Date(lastUpdated).toLocaleString() : NOT_PROVIDED}</p></div>
          {flight.importBatchId && <div><p className={labelClass}>Latest Import Batch</p><p className={valueClass}>{flight.importBatchId}</p></div>}
        </div>
      </section>
    </div>
  );
}
