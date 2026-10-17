import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, History, Upload } from 'lucide-react';
import { useCurrency, type Currency } from '../../context/CurrencyContext';
import { flightDuplicateKey, readFlightImportHistory, readFlightInventory, writeFlightImportHistory, writeFlightInventory } from '../../utils/flightStorage';
import { offerKey, priceKey } from '../../utils/fareOffers';
import type { FareOffer, FarePrice, FlightImportHistoryEntry, FlightInventoryRecord } from '../../types/flight';
import { fetchApiFlights, getFlightInventoryEndpoint } from '../../services/flightInventoryApi';

type MappingKey = 'airline' | 'flightNumber' | 'origin' | 'destination' | 'departure' | 'arrival' | 'cabinClass' | 'fareBrand' | 'availability' | 'passengerType' | 'baseFare' | 'supplierFare' | 'taxesAndFees' | 'supplierTotal' | 'markup' | 'sellingPrice' | 'currency' | 'fareBasis' | 'bookingClass' | 'baggage' | 'conditions';
type CsvRow = string[];
type MappedRow = { line: number; record?: FlightInventoryRecord; errors: string[]; duplicate: boolean };

type MappingField = { key: MappingKey; label: string; required?: boolean; aliases: string[] };

const mappingFields: MappingField[] = [
  { key: 'airline', label: 'Airline', required: true, aliases: ['airline', 'carrier', 'carriername'] },
  { key: 'flightNumber', label: 'Flight number', required: true, aliases: ['flightnumber', 'flightno', 'number'] },
  { key: 'origin', label: 'Origin', required: true, aliases: ['origin', 'from', 'departureairport', 'originairport'] },
  { key: 'destination', label: 'Destination', required: true, aliases: ['destination', 'to', 'arrivalairport', 'destinationairport'] },
  { key: 'departure', label: 'Departure date/time', required: true, aliases: ['departure', 'departuretime', 'departuredate', 'datetime', 'date'] },
  { key: 'arrival', label: 'Arrival date/time', aliases: ['arrival', 'arrivaltime', 'arrivaldate'] },
  { key: 'cabinClass', label: 'Cabin class (offer)', aliases: ['cabinclass', 'class', 'cabin'] },
  { key: 'fareBrand', label: 'Fare type / brand (offer)', aliases: ['farebrand', 'brand', 'brandname', 'faretype', 'type'] },
  { key: 'availability', label: 'Availability (offer)', aliases: ['availability', 'seatsavailable', 'seats'] },
  { key: 'passengerType', label: 'Passenger type', aliases: ['passengertype', 'pax'] },
  { key: 'baseFare', label: 'Base fare', aliases: ['basefare'] },
  { key: 'supplierFare', label: 'Supplier fare', aliases: ['supplierfare', 'fare'] },
  { key: 'taxesAndFees', label: 'Taxes and fees', aliases: ['taxesandfees', 'taxes', 'fees'] },
  { key: 'supplierTotal', label: 'Supplier total', aliases: ['suppliertotal', 'total'] },
  { key: 'markup', label: 'AeroPoint markup', aliases: ['aeropointmarkup', 'markup'] },
  { key: 'sellingPrice', label: 'Final selling price', aliases: ['finalsellingprice', 'sellingprice', 'totalprice'] },
  { key: 'currency', label: 'Currency', aliases: ['currency', 'currencycode'] },
  { key: 'fareBasis', label: 'Fare basis / class', aliases: ['farebasis', 'fareclass'] },
  { key: 'bookingClass', label: 'Booking class', aliases: ['bookingclass', 'rbd'] },
  { key: 'baggage', label: 'Baggage allowance', aliases: ['baggage', 'baggageallowance'] },
  { key: 'conditions', label: 'Fare conditions', aliases: ['conditions', 'farerules', 'farecondition'] },
];

const emptyMapping = Object.fromEntries(mappingFields.map(field => [field.key, ''])) as Record<MappingKey, string>;
const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

function inferMapping(headers: string[]): Record<MappingKey, string> {
  return mappingFields.reduce((mapping, field) => {
    const index = headers.findIndex(header => field.aliases.includes(normalizeHeader(header)));
    mapping[field.key] = index >= 0 ? String(index) : '';
    return mapping;
  }, { ...emptyMapping });
}

function parseOptionalAmount(value: string, label: string, errors: string[]): number | undefined {
  if (!value.trim()) return undefined;
  const normalized = value.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const amount = Number(normalized);
  if (!normalized || !Number.isFinite(amount) || amount < 0) {
    errors.push(`${label} must be a non-negative amount.`);
    return undefined;
  }
  return amount;
}

function formatAmount(amount: number | undefined, currency: string | undefined, convertToNGNAndFormat: (amount: number, sourceCurrency: string) => string) {
  if (amount === undefined) return 'Not provided';
  if (!currency) return 'Source currency not provided';
  return convertToNGNAndFormat(amount, currency);
}

// A row repeats earlier data when its flight, offer and passenger line already exist; a new offer on a known imported flight is not a duplicate.
function isDuplicateLine(record: FlightInventoryRecord, existingByKey: Map<string, FlightInventoryRecord>, seen: Set<string>) {
  const flightKey = flightDuplicateKey(record);
  const existing = existingByKey.get(flightKey);
  const offer = record.offers[0];
  const price = offer?.prices[0];
  const lineKey = offer ? `${flightKey}|${offerKey(offer)}|${price ? priceKey(price) : ''}` : flightKey;
  const existingOffer = offer ? existing?.offers.find(item => offerKey(item) === offerKey(offer)) : undefined;
  const repeatsExistingLine = offer
    ? Boolean(existingOffer && (!price || existingOffer.prices.some(item => priceKey(item) === priceKey(price))))
    : Boolean(existing);
  const duplicate = Boolean(existing && existing.sourceType !== 'import') || seen.has(lineKey) || repeatsExistingLine;
  seen.add(lineKey);
  return duplicate;
}

function indexByFlight(records: FlightInventoryRecord[]) {
  return new Map(records.map(record => [flightDuplicateKey(record), record]));
}

export default function FlightImport() {
  const navigate = useNavigate();
  const { convertToNGNAndFormat, exchangeRates } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<CsvRow[]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<Record<MappingKey, string>>({ ...emptyMapping });
  const [fileError, setFileError] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [inventory, setInventory] = useState(readFlightInventory);
  const [history, setHistory] = useState<FlightImportHistoryEntry[]>(readFlightImportHistory);
  const [apiInventory, setApiInventory] = useState<FlightInventoryRecord[]>([]);
  const [apiInventoryError, setApiInventoryError] = useState('');
  const apiEndpoint = getFlightInventoryEndpoint();

  useEffect(() => {
    if (!apiEndpoint) return;
    let cancelled = false;
    fetchApiFlights().then(records => {
      if (!cancelled) setApiInventory(records);
    }).catch(() => {
      if (!cancelled) setApiInventoryError('API duplicate checks are unavailable because the configured flight feed could not be loaded.');
    });
    return () => { cancelled = true; };
  }, [apiEndpoint]);

  const headers = useMemo(() => {
    const firstRow = rawRows[0] || [];
    return hasHeader ? firstRow.map((value, index) => value.trim() || `Column ${index + 1}`) : firstRow.map((_, index) => `Column ${index + 1}`);
  }, [hasHeader, rawRows]);
  const dataRows = useMemo(() => rawRows.slice(hasHeader ? 1 : 0), [hasHeader, rawRows]);

  const mappedRows = useMemo<MappedRow[]>(() => {
    if (headers.length === 0) return [];
    const existingByKey = indexByFlight([...inventory, ...apiInventory]);
    const seen = new Set<string>();

    return dataRows.map((values, index) => {
      const read = (key: MappingKey) => {
        const column = mapping[key];
        return column === '' ? '' : (values[Number(column)] || '').trim();
      };
      const errors: string[] = [];
      const requiredFields: MappingKey[] = ['airline', 'flightNumber', 'origin', 'destination', 'departure'];
      for (const key of requiredFields) {
        const field = mappingFields.find(item => item.key === key)!;
        if (mapping[key] === '') errors.push(`${field.label} is not mapped.`);
        else if (!read(key)) errors.push(`${field.label} is required.`);
      }

      const currency = read('currency').toUpperCase();
      if (currency && !/^[A-Z]{3}$/.test(currency)) errors.push('Currency must be a three-letter code.');
      const baseFare = parseOptionalAmount(read('baseFare'), 'Base fare', errors);
      const supplierFare = parseOptionalAmount(read('supplierFare'), 'Supplier fare', errors);
      const taxesAndFees = parseOptionalAmount(read('taxesAndFees'), 'Taxes and fees', errors);
      const supplierTotal = parseOptionalAmount(read('supplierTotal'), 'Supplier total', errors);
      const markup = parseOptionalAmount(read('markup'), 'AeroPoint markup', errors);
      const sellingPrice = parseOptionalAmount(read('sellingPrice'), 'Final selling price', errors);
      const hasPrice = [baseFare, supplierFare, taxesAndFees, supplierTotal, markup, sellingPrice].some(amount => amount !== undefined);
      if (hasPrice && !currency) errors.push('Currency is required when fare amounts are provided.');
      if (hasPrice && currency && (!Object.hasOwn(exchangeRates, currency) || !Number.isFinite(exchangeRates[currency as Currency]) || exchangeRates[currency as Currency] <= 0)) {
        errors.push(`No valid admin NGN exchange rate is configured for ${currency}.`);
      }
      const passengerType = read('passengerType');
      if (passengerType && !['adult', 'child', 'infant'].includes(passengerType.toLowerCase())) errors.push('Passenger type must be Adult, Child, or Infant.');

      const price: FarePrice = {
        ...(passengerType ? { passengerType: passengerType[0].toUpperCase() + passengerType.slice(1).toLowerCase() } : {}),
        ...(baseFare !== undefined ? { baseFare } : {}),
        ...(supplierFare !== undefined ? { supplierFare } : {}),
        ...(taxesAndFees !== undefined ? { taxesAndFees } : {}),
        ...(supplierTotal !== undefined ? { supplierTotal } : {}),
        ...(markup !== undefined ? { markup } : {}),
        ...(sellingPrice !== undefined ? { sellingPrice } : {}),
      };
      const offerFields = {
        cabinClass: read('cabinClass') || undefined,
        fareBrand: read('fareBrand') || undefined,
        fareBasis: read('fareBasis') || undefined,
        bookingClass: read('bookingClass') || undefined,
        baggage: read('baggage') || undefined,
        conditions: read('conditions') || undefined,
        currency: currency || undefined,
        availability: read('availability') || undefined,
      };
      const hasPriceLine = Object.keys(price).length > 0;
      const hasOfferData = hasPriceLine || Object.values(offerFields).some(Boolean);
      const offers: FareOffer[] = hasOfferData ? [{ id: '', ...offerFields, prices: hasPriceLine ? [price] : [] }] : [];

      const record: FlightInventoryRecord = {
        id: '',
        airline: read('airline'),
        flightNumber: read('flightNumber'),
        origin: read('origin'),
        destination: read('destination'),
        departure: read('departure'),
        ...(read('arrival') ? { arrival: read('arrival') } : {}),
        status: 'verification-required',
        sourceType: 'import',
        sourceName: fileName,
        offers,
      };
      const duplicate = !errors.length && isDuplicateLine(record, existingByKey, seen);

      return { line: index + (hasHeader ? 2 : 1), record: errors.length ? undefined : record, errors, duplicate };
    });
  }, [apiInventory, dataRows, exchangeRates, fileName, headers.length, hasHeader, inventory, mapping]);

  const validRowCount = mappedRows.filter(row => row.record && !row.duplicate).length;
  const duplicateCount = mappedRows.filter(row => row.duplicate).length;
  const rejectedCount = mappedRows.filter(row => row.errors.length > 0).length;

  const setHeaderMode = (checked: boolean) => {
    setHasHeader(checked);
    if (rawRows[0]) setMapping(inferMapping(checked ? rawRows[0] : []));
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setFileError('');
    setImportMessage('');
    Papa.parse<CsvRow>(file, {
      header: false,
      skipEmptyLines: 'greedy',
      complete: result => {
        if (result.errors.length > 0) {
          setRawRows([]);
          setFileError(`Could not parse ${file.name}: ${result.errors[0].message}`);
          return;
        }
        const rows = result.data as CsvRow[];
        if (rows.length === 0 || rows.every(row => row.length === 1 && !row[0]?.trim())) {
          setFileError('This file contains no importable rows.');
          setRawRows([]);
          return;
        }
        const firstRow = rows[0];
        const headerMatches = firstRow.filter(value => mappingFields.some(field => field.aliases.includes(normalizeHeader(value)))).length;
        const detectedHeader = headerMatches >= 2;
        setFileName(file.name);
        setRawRows(rows);
        setHasHeader(detectedHeader);
        setMapping(inferMapping(detectedHeader ? firstRow : []));
      },
      error: error => setFileError(`Import failed: ${error.message}`),
    });
    event.currentTarget.value = '';
  };

  const importRows = () => {
    const existing = readFlightInventory();
    const existingByKey = indexByFlight([...existing, ...apiInventory]);
    const created = new Map<string, FlightInventoryRecord>();
    const touched = new Set<string>();
    const seen = new Set<string>();
    const errors = mappedRows.flatMap(row => row.errors.map(error => `Row ${row.line}: ${error}`));
    const importedAt = new Date().toISOString();
    const batchId = `AIR-${importedAt.replace(/\D/g, '').slice(0, 14)}`;
    let duplicateRows = 0;
    let offersAdded = 0;

    mappedRows.forEach((row, index) => {
      if (!row.record || row.errors.length) return;
      if (isDuplicateLine(row.record, existingByKey, seen)) {
        duplicateRows += 1;
        return;
      }
      const flightKey = flightDuplicateKey(row.record);
      const known = existingByKey.get(flightKey);
      const target = created.get(flightKey) ?? (known?.sourceType === 'import' ? known : undefined) ?? { ...row.record, id: `${Date.now()}-${index}`, offers: [] };
      if (!known && !created.has(flightKey)) created.set(flightKey, target);

      const offer = row.record.offers[0];
      if (offer) {
        const sameOffer = target.offers.find(item => offerKey(item) === offerKey(offer));
        if (sameOffer) sameOffer.prices.push(...offer.prices);
        else {
          target.offers.push({ ...offer, id: `${target.id}-offer-${target.offers.length + 1}`, importBatchId: batchId, importedAt });
          offersAdded += 1;
        }
      }
      target.importBatchId = batchId;
      target.importedAt = importedAt;
      target.sourceName = fileName;
      touched.add(flightKey);
    });

    // Imported flights that already existed were updated in place, so existing and new records are saved together.
    writeFlightInventory([...existing, ...created.values()]);
    setInventory(readFlightInventory());

    const entry: FlightImportHistoryEntry = {
      id: batchId,
      fileName,
      importedAt,
      rowsRead: dataRows.length,
      recordsImported: touched.size,
      duplicateRows,
      rejectedRows: rejectedCount,
      errors,
    };
    const nextHistory = [entry, ...history];
    writeFlightImportHistory(nextHistory);
    setHistory(nextHistory);
    setImportMessage(`Imported ${touched.size} ${touched.size === 1 ? 'flight' : 'flights'} and ${offersAdded} new fare ${offersAdded === 1 ? 'offer' : 'offers'}. ${duplicateRows} duplicate rows skipped; ${rejectedCount} rows rejected.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flights')} aria-label="Back to Flight Management" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"><ArrowLeft size={17} /></button>
          <div><h1 className="text-xl font-bold text-gray-900">Import Flights</h1><p className="mt-1 text-sm text-gray-500">Map, validate, and review records before importing. Rows for the same flight with a different cabin, brand, baggage or conditions become separate fare offers.</p></div>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"><Upload size={16} /> Choose AIR / CSV file</button>
        <input ref={inputRef} type="file" accept=".air,.csv,text/csv,text/plain" onChange={handleFile} className="sr-only" />
      </header>

      <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><p>Imported records are file snapshots, not live inventory. Verify availability and price with a compatible supplier before confirming a booking. Supplier revalidation is not configured.{apiInventoryError && <span className="mt-1 block" role="alert">{apiInventoryError}</span>}</p></div>

      {fileError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{fileError}</p>}
      {importMessage && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{importMessage}</p>}

      {rawRows.length > 0 && <section className="space-y-5 border-b border-gray-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2"><FileText size={17} className="text-primary-600" /><span className="text-sm font-semibold text-gray-900">{fileName}</span><span className="text-xs text-gray-500">{dataRows.length} rows</span></div>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={hasHeader} onChange={event => setHeaderMode(event.target.checked)} className="rounded border-gray-300" /> First row contains column names</label>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Field Mapping</h2>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {mappingFields.map(field => <label key={field.key} className="text-xs font-semibold text-gray-600">{field.label}{field.required && ' *'}<select value={mapping[field.key]} onChange={event => setMapping(current => ({ ...current, [field.key]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-800"><option value="">Not mapped</option>{headers.map((header, index) => <option key={`${index}-${header}`} value={String(index)}>{header}</option>)}</select></label>)}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-gray-900">Preview & Validation</h2><div className="flex gap-4 text-xs"><span className="text-emerald-700">{validRowCount} ready</span><span className="text-amber-700">{duplicateCount} duplicates</span><span className="text-red-700">{rejectedCount} invalid</span></div></div>
          <div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-gray-50 text-[11px] uppercase text-gray-500"><tr>{['Airline / Flight', 'Route', 'Departure', 'Cabin · Brand', 'Passenger', 'Base fare (NGN)', 'Taxes / fees (NGN)', 'Supplier total (NGN)', 'Markup (NGN)', 'Selling price (NGN)', 'Currency', 'Review'].map(label => <th key={label} className="px-3 py-2.5 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{mappedRows.slice(0, 20).map(row => { const record = row.record; const offer = record?.offers[0]; const price = offer?.prices[0]; const currency = offer?.currency; return <tr key={row.line}><td className="px-3 py-2.5">{record ? `${record.airline} / ${record.flightNumber}` : `Row ${row.line}`}</td><td className="px-3 py-2.5">{record ? `${record.origin} → ${record.destination}` : '—'}</td><td className="px-3 py-2.5">{record?.departure || '—'}</td><td className="px-3 py-2.5">{[offer?.cabinClass, offer?.fareBrand].filter(Boolean).join(' · ') || '—'}</td><td className="px-3 py-2.5">{price?.passengerType || '—'}</td><td className="px-3 py-2.5">{formatAmount(price?.baseFare ?? price?.supplierFare, currency, convertToNGNAndFormat)}</td><td className="px-3 py-2.5">{formatAmount(price?.taxesAndFees, currency, convertToNGNAndFormat)}</td><td className="px-3 py-2.5">{formatAmount(price?.supplierTotal, currency, convertToNGNAndFormat)}</td><td className="px-3 py-2.5">{formatAmount(price?.markup, currency, convertToNGNAndFormat)}</td><td className="px-3 py-2.5">{formatAmount(price?.sellingPrice, currency, convertToNGNAndFormat)}</td><td className="px-3 py-2.5">{currency || 'Not provided'}</td><td className="px-3 py-2.5">{row.errors.length ? <span className="text-red-700">{row.errors.join(' ')}</span> : row.duplicate ? <span className="text-amber-700">Duplicate</span> : <span className="text-emerald-700">Ready</span>}</td></tr>; })}</tbody></table></div>
          {mappedRows.length > 20 && <p className="mt-2 text-xs text-gray-500">Showing first 20 of {mappedRows.length} rows.</p>}
          <div className="mt-4 flex justify-end"><button type="button" disabled={dataRows.length === 0} onClick={importRows} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={16} /> Import {validRowCount} valid {validRowCount === 1 ? 'row' : 'rows'}</button></div>
        </section>
      </section>}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900"><History size={16} /> Import History</h2>
        {history.length === 0 ? <p className="border-y border-gray-200 py-8 text-center text-sm text-gray-500">No import batches yet.</p> : <div className="overflow-x-auto border-y border-gray-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-[11px] uppercase text-gray-500"><tr>{['File / Batch', 'Imported', 'Rows', 'Flights', 'Duplicates', 'Rejected', 'Errors'].map(label => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{history.map(entry => <tr key={entry.id}><td className="px-3 py-3"><span className="block font-medium text-gray-900">{entry.fileName}</span><span className="text-xs text-gray-500">{entry.id}</span></td><td className="px-3 py-3 text-gray-600">{new Date(entry.importedAt).toLocaleString()}</td><td className="px-3 py-3">{entry.rowsRead}</td><td className="px-3 py-3 text-emerald-700">{entry.recordsImported}</td><td className="px-3 py-3 text-amber-700">{entry.duplicateRows}</td><td className="px-3 py-3 text-red-700">{entry.rejectedRows}</td><td className="px-3 py-3">{entry.errors.length ? <details><summary className="cursor-pointer text-primary-700">{entry.errors.length} errors</summary><ul className="mt-2 max-w-sm whitespace-normal text-xs text-red-700">{entry.errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></details> : '0'}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
