import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Edit2, Eye, Plus, Trash2, Upload } from 'lucide-react';
import { useCurrency, type Currency } from '../../context/CurrencyContext';
import type { FlightInventoryRecord } from '../../types/flight';
import { readFlightInventory, writeFlightInventory } from '../../utils/flightStorage';
import { fetchApiFlights, getFlightInventoryEndpoint } from '../../services/flightInventoryApi';

type FlightSortKey = 'airline' | 'flightNumber' | 'origin' | 'departure' | 'cabinClass' | 'price' | 'availability' | 'source' | 'status';

function sellingPrices(flight: FlightInventoryRecord) {
  return flight.offers.flatMap(offer => offer.prices.flatMap(price => price.sellingPrice === undefined ? [] : [{ amount: price.sellingPrice, currency: offer.currency }]));
}

// Each offer has its own currency, so offers are compared only after conversion to NGN.
function lowestSellingNgn(flight: FlightInventoryRecord, rates: Record<Currency, number>) {
  const converted = sellingPrices(flight).flatMap(({ amount, currency }) => {
    if (!currency || !Object.hasOwn(rates, currency)) return [];
    const rate = rates[currency as Currency];
    return Number.isFinite(rate) && rate > 0 ? [amount * rate] : [];
  });
  return converted.length > 0 ? Math.min(...converted) : undefined;
}

function cabinSummary(flight: FlightInventoryRecord) {
  const cabins = Array.from(new Set(flight.offers.flatMap(offer => offer.cabinClass ? [offer.cabinClass] : [])));
  if (cabins.length > 0) return cabins.join(', ');
  return flight.cabinClass || 'Class not provided';
}

function offerSummary(flight: FlightInventoryRecord) {
  if (flight.offers.length === 0) return flight.fareType || 'Fare type not provided';
  const brands = Array.from(new Set(flight.offers.flatMap(offer => offer.fareBrand ? [offer.fareBrand] : [])));
  return `${flight.offers.length} fare ${flight.offers.length === 1 ? 'offer' : 'offers'}${brands.length > 0 ? ` · ${brands.join(', ')}` : ''}`;
}

function priceFrom(flight: FlightInventoryRecord, rates: Record<Currency, number>, convertToNGNAndFormat: (amount: number, sourceCurrency: string) => string) {
  const lowest = lowestSellingNgn(flight, rates);
  if (lowest !== undefined) return `From ${convertToNGNAndFormat(lowest, 'NGN')}`;
  if (sellingPrices(flight).length > 0) return 'Currency or rate unavailable';
  if (flight.sourceType === 'sample' && flight.samplePrices) {
    const samplePrice = Math.min(...Object.values(flight.samplePrices).filter((price): price is number => price !== undefined));
    return Number.isFinite(samplePrice) ? `${convertToNGNAndFormat(samplePrice, 'USD')} · sample` : 'Not provided';
  }
  return 'Not provided';
}

function sourceLabel(flight: FlightInventoryRecord) {
  if (flight.sourceType === 'api') return `API · ${flight.provider || flight.sourceName}`;
  if (flight.sourceType === 'import') return `AIR/CSV · ${flight.sourceName}`;
  return 'Sample data';
}

function statusLabel(flight: FlightInventoryRecord) {
  if (flight.sourceType === 'sample') return 'Sample only';
  if (flight.status === 'verification-required') return 'Supplier check required';
  if (flight.status === 'active') return 'Active';
  if (flight.status === 'inactive') return 'Inactive';
  return 'Not provided';
}

function sortValue(flight: FlightInventoryRecord, key: FlightSortKey, exchangeRates: Record<Currency, number>) {
  if (key === 'airline') return flight.airline;
  if (key === 'flightNumber') return flight.flightNumber;
  if (key === 'origin') return `${flight.origin} ${flight.destination}`;
  if (key === 'departure') return flight.departure;
  if (key === 'cabinClass') return cabinSummary(flight);
  if (key === 'price') {
    const lowest = lowestSellingNgn(flight, exchangeRates);
    if (lowest !== undefined) return lowest;
    if (flight.sourceType === 'sample' && flight.samplePrices) return Math.min(...Object.values(flight.samplePrices).filter((price): price is number => price !== undefined)) * exchangeRates.USD;
    return Number.POSITIVE_INFINITY;
  }
  if (key === 'availability') return flight.availability || '';
  if (key === 'source') return sourceLabel(flight);
  return statusLabel(flight);
}

export default function FlightList() {
  const [flights, setFlights] = useState<FlightInventoryRecord[]>(readFlightInventory);
  const navigate = useNavigate();
  const { convertToNGNAndFormat, exchangeRates } = useCurrency();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<FlightSortKey>('airline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [apiFlights, setApiFlights] = useState<FlightInventoryRecord[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const apiEndpoint = getFlightInventoryEndpoint();

  useEffect(() => {
    if (!apiEndpoint) return;
    let cancelled = false;
    setApiLoading(true);
    fetchApiFlights().then(records => {
      if (cancelled) return;
      setApiFlights(records);
      if (records.length === 0) setApiError('The configured flight endpoint returned no records matching the required flight data contract.');
    }).catch(() => {
      if (!cancelled) setApiError('Could not retrieve flights from the configured API endpoint.');
    }).finally(() => {
      if (!cancelled) setApiLoading(false);
    });
    return () => { cancelled = true; };
  }, [apiEndpoint]);

  const allFlights = useMemo(() => [...apiFlights, ...flights], [apiFlights, flights]);

  const handleDelete = (flight: FlightInventoryRecord) => {
    if (!confirm(`Delete ${flight.airline} ${flight.flightNumber} from local flight inventory?`)) return;
    setFlights(current => {
      const updated = current.filter(record => record.id !== flight.id);
      writeFlightInventory(updated);
      return updated;
    });
  };

  const sortedFlights = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allFlights.filter(flight => !query || `${flight.airline} ${flight.flightNumber} ${flight.origin} ${flight.destination} ${flight.sourceName}`.toLowerCase().includes(query))
      .sort((left, right) => {
        const leftValue = sortValue(left, sortKey, exchangeRates);
        const rightValue = sortValue(right, sortKey, exchangeRates);
        const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [allFlights, exchangeRates, search, sortDirection, sortKey]);

  const totalItems = sortedFlights.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const paginatedFlights = sortedFlights.slice(startIndex, endIndex);

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: FlightSortKey) => {
    if (sortKey === key) setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection('asc'); }
  };

  const sortIcon = (key: FlightSortKey) => sortKey !== key ? <ArrowUpDown size={12} className="text-gray-300" /> : sortDirection === 'asc' ? <ArrowUp size={12} className="text-primary-600" /> : <ArrowDown size={12} className="text-primary-600" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Flights Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {sortedFlights.length} records{apiLoading ? ' · Retrieving API flights…' : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={search} onChange={event => { setSearch(event.target.value); setCurrentPage(1); }} type="search" placeholder="Search flights..." className="w-48 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500" />
          <button type="button" onClick={() => navigate('/flights/import')} aria-label="Manage AIR/CSV imports" title="Manage AIR/CSV imports" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-primary-600">
            <Upload size={17} />
          </button>
          <button
            onClick={() => navigate('/flights/edit/new')}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create New
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><p>{apiEndpoint ? 'API inventory is loaded from the configured endpoint; provider prices and availability are dynamic and must be revalidated before booking. Supplier revalidation is not configured.' : 'API inventory is not connected. Set VITE_FLIGHT_INVENTORY_ENDPOINT to a flight API endpoint. Sample rows are not live inventory; imported records must be verified with a compatible supplier before booking.'}{apiError && <span className="mt-1 block" role="alert">{apiError}</span>}</p></div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('airline')} className="inline-flex items-center gap-1 hover:text-primary-600">Airline / Flight Number {sortIcon('airline')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('origin')} className="inline-flex items-center gap-1 hover:text-primary-600">Route {sortIcon('origin')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('departure')} className="inline-flex items-center gap-1 hover:text-primary-600">Departure {sortIcon('departure')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('cabinClass')} className="inline-flex items-center gap-1 hover:text-primary-600">Cabin Class / Fare Type {sortIcon('cabinClass')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('price')} className="inline-flex items-center gap-1 hover:text-primary-600">Price From {sortIcon('price')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('availability')} className="inline-flex items-center gap-1 hover:text-primary-600">Availability {sortIcon('availability')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('source')} className="inline-flex items-center gap-1 hover:text-primary-600">Source {sortIcon('source')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-primary-600">Status {sortIcon('status')}</button></th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedFlights.length > 0 ? paginatedFlights.map(flight => (
                <tr key={flight.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3"><span className="block font-medium text-gray-900">{flight.airline || 'Airline not provided'}</span><span className="text-xs text-gray-500">{flight.flightNumber}</span></td>
                  <td className="px-4 py-3">{flight.origin} <span className="text-gray-400">→</span> {flight.destination}</td>
                  <td className="px-4 py-3">{flight.departure || 'Not provided'}</td>
                  <td className="px-4 py-3"><span>{cabinSummary(flight)}</span><span className="block text-xs text-gray-500">{offerSummary(flight)}</span></td>
                  <td className="px-4 py-3 font-medium text-gray-900">{priceFrom(flight, exchangeRates, convertToNGNAndFormat)}</td>
                  <td className="px-4 py-3"><span>{flight.sourceType === 'sample' ? 'Not live' : flight.availability || 'Not provided'}</span>{flight.sourceType === 'api' && <span className="block text-xs text-gray-500">{flight.retrievedAt ? `Checked ${new Date(flight.retrievedAt).toLocaleString()}` : 'Dynamic provider data'}</span>}{flight.sourceType === 'import' && <span className="block text-xs text-amber-700">File snapshot · verify</span>}</td>
                  <td className="px-4 py-3"><span className="block max-w-48 truncate" title={sourceLabel(flight)}>{sourceLabel(flight)}</span>{flight.importBatchId && <span className="block text-xs text-gray-500">Batch {flight.importBatchId}</span>}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${flight.status === 'active' ? 'bg-emerald-50 text-emerald-700' : flight.status === 'inactive' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-800'}`}>{statusLabel(flight)}</span></td>
                  <td className="px-4 py-3 text-center"><div className="inline-flex items-center gap-1"><button onClick={() => navigate(`/flights/view/${encodeURIComponent(flight.id)}`, { state: { flight } })} className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600" title="View flight details"><Eye size={14} /> View Details</button>{flight.sourceType !== 'api' && <><button onClick={() => navigate(`/flights/edit/${encodeURIComponent(flight.flightNumber)}`)} aria-label={`Edit ${flight.flightNumber}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600" title="Edit local flight"><Edit2 size={14} /></button><button onClick={() => handleDelete(flight)} aria-label={`Delete ${flight.flightNumber}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600" title="Delete local flight"><Trash2 size={14} /></button></>}</div></td>
                </tr>
              )) : <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">No flights match this search.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer text-sm">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {number}
              </button>
            ))}
            <button onClick={() => setCurrentPage(previous => Math.min(previous + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 h-8 flex items-center justify-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}