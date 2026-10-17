import { useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { ChevronDown, ChevronUp, Download, FileUp, SlidersHorizontal, X } from 'lucide-react';
import { useCurrency, type Currency } from '../../context/CurrencyContext';
import { flightDuplicateKey, readFlightImportHistory, readFlightInventory, writeFlightImportHistory, writeFlightInventory } from '../../utils/flightStorage';
import { offerKey, priceKey } from '../../utils/fareOffers';
import type { FareOffer, FarePrice, FlightImportHistoryEntry, FlightInventoryRecord } from '../../types/flight';
import { fetchApiFlights, getFlightInventoryEndpoint } from '../../services/flightInventoryApi';

type Props = { onClose: () => void; onImported: (message: string) => void };

type MappingKey =
  | 'airline'
  | 'flightNumber'
  | 'origin'
  | 'destination'
  | 'departure'
  | 'arrival'
  | 'cabinClass'
  | 'fareBrand'
  | 'availability'
  | 'passengerType'
  | 'baseFare'
  | 'supplierFare'
  | 'taxesAndFees'
  | 'supplierTotal'
  | 'markup'
  | 'sellingPrice'
  | 'currency'
  | 'fareBasis'
  | 'bookingClass'
  | 'baggage'
  | 'conditions';

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
  { key: 'cabinClass', label: 'Cabin class', aliases: ['cabinclass', 'class', 'cabin'] },
  { key: 'fareBrand', label: 'Fare type / brand', aliases: ['farebrand', 'brand', 'brandname', 'faretype', 'type'] },
  { key: 'availability', label: 'Availability', aliases: ['availability', 'seatsavailable', 'seats'] },
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

const templateHeaders = [
  'airline',
  'flight_number',
  'origin',
  'destination',
  'departure',
  'arrival',
  'cabin_class',
  'fare_brand',
  'availability',
  'passenger_type',
  'base_fare',
  'supplier_fare',
  'taxes_and_fees',
  'supplier_total',
  'markup',
  'selling_price',
  'currency',
  'fare_basis',
  'booking_class',
  'baggage',
  'conditions',
];

const templateRow = [
  'Air Peace',
  'P47120',
  'LOS',
  'ABV',
  '2026-11-15 08:30',
  '2026-11-15 09:45',
  'Economy',
  'Economy Flex',
  '12',
  'Adult',
  '120000',
  '120000',
  '18000',
  '138000',
  '12000',
  '150000',
  'NGN',
  'YFLEX',
  'Y',
  '1x23kg',
  'Partially refundable with penalty',
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
  if (amount === undefined) return '—';
  if (!currency) return String(amount);
  return convertToNGNAndFormat(amount, currency);
}

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

export default function FlightBulkUpload({ onClose, onImported }: Props) {
  const { convertToNGNAndFormat, exchangeRates } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<CsvRow[]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<Record<MappingKey, string>>({ ...emptyMapping });
  const [showMapping, setShowMapping] = useState(false);
  const [error, setError] = useState('');
  const [apiInventory, setApiInventory] = useState<FlightInventoryRecord[]>([]);
  const apiEndpoint = getFlightInventoryEndpoint();

  useEffect(() => {
    if (!apiEndpoint) return;
    let cancelled = false;
    fetchApiFlights().then(records => {
      if (!cancelled) setApiInventory(records);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [apiEndpoint]);

  const headers = useMemo(() => {
    const firstRow = rawRows[0] || [];
    return hasHeader ? firstRow.map((value, index) => value.trim() || `Column ${index + 1}`) : firstRow.map((_, index) => `Column ${index + 1}`);
  }, [hasHeader, rawRows]);

  const dataRows = useMemo(() => rawRows.slice(hasHeader ? 1 : 0), [hasHeader, rawRows]);

  const mappedRows = useMemo<MappedRow[]>(() => {
    if (headers.length === 0) return [];
    const inventory = readFlightInventory();
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
  }, [apiInventory, dataRows, exchangeRates, fileName, headers.length, hasHeader, mapping]);

  const ready = useMemo(() => mappedRows.filter(row => row.record && !row.duplicate), [mappedRows]);
  const duplicates = useMemo(() => mappedRows.filter(row => row.duplicate).length, [mappedRows]);
  const invalid = useMemo(() => mappedRows.filter(row => row.errors.length > 0).length, [mappedRows]);

  const setHeaderMode = (checked: boolean) => {
    setHasHeader(checked);
    if (rawRows[0]) setMapping(inferMapping(checked ? rawRows[0] : []));
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setError('');
    Papa.parse<CsvRow>(file, {
      header: false,
      skipEmptyLines: 'greedy',
      complete: result => {
        if (result.errors.length > 0) {
          setRawRows([]);
          setError(`Could not parse ${file.name}: ${result.errors[0].message}`);
          return;
        }
        const rows = result.data as CsvRow[];
        if (rows.length === 0 || rows.every(row => row.length === 1 && !row[0]?.trim())) {
          setError('This file contains no importable rows.');
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
      error: parseError => setError(`Import failed: ${parseError.message}`),
    });
  };

  const downloadTemplate = () => {
    const csv = `${templateHeaders.join(',')}\n${templateRow.map(value => `"${value.replace(/"/g, '""')}"`).join(',')}\n`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'flight-bulk-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const runImport = () => {
    const existing = readFlightInventory();
    const existingByKey = indexByFlight([...existing, ...apiInventory]);
    const created = new Map<string, FlightInventoryRecord>();
    const touched = new Set<string>();
    const seen = new Set<string>();
    const errors = mappedRows.flatMap(row => row.errors.map(err => `Row ${row.line}: ${err}`));
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

    writeFlightInventory([...existing, ...created.values()]);

    const entry: FlightImportHistoryEntry = {
      id: batchId,
      fileName,
      importedAt,
      rowsRead: dataRows.length,
      recordsImported: touched.size,
      duplicateRows,
      rejectedRows: invalid,
      errors,
    };
    const currentHistory = readFlightImportHistory();
    writeFlightImportHistory([entry, ...currentHistory]);

    onImported(`Imported ${touched.size} ${touched.size === 1 ? 'flight' : 'flights'} and ${offersAdded} fare ${offersAdded === 1 ? 'offer' : 'offers'} (batch ${batchId}). ${duplicateRows} duplicate rows skipped; ${invalid} rows rejected.`);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/40 p-4"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="bulk-upload-title" className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="bulk-upload-title" className="text-lg font-semibold text-gray-900">Upload Flights in Bulk</h2>
            <p className="mt-1 text-sm text-gray-500">Upload an AIR or CSV file. Rows are validated and grouped into flight offers before saving.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <FileUp size={16} /> Choose AIR / CSV file
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} /> Download template
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".air,.csv,text/csv,text/plain"
              onChange={handleFile}
              className="sr-only"
            />
            {fileName && <span className="text-sm text-gray-600">{fileName} · {dataRows.length} rows</span>}
          </div>

          <p className="text-xs text-gray-500">
            Accepts AIR or CSV files. Rows for the same flight with different cabin class, brand, passenger type or conditions become separate fare offers. Imported records are file snapshots and must be verified before booking.
          </p>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          {rawRows.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={event => setHeaderMode(event.target.checked)}
                    className="rounded border-gray-300"
                  />
                  First row contains column names
                </label>
                <button
                  type="button"
                  onClick={() => setShowMapping(open => !open)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800"
                >
                  <SlidersHorizontal size={14} />
                  {showMapping ? 'Hide column mapping' : 'Customize column mapping'}
                  {showMapping ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {showMapping && (
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Column Mapping</h3>
                  <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    {mappingFields.map(field => (
                      <label key={field.key} className="text-xs font-medium text-gray-700">
                        {field.label}{field.required && ' *'}
                        <select
                          value={mapping[field.key]}
                          onChange={event => setMapping(current => ({ ...current, [field.key]: event.target.value }))}
                          className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-primary-500"
                        >
                          <option value="">Not mapped</option>
                          {headers.map((header, index) => (
                            <option key={`${index}-${header}`} value={String(index)}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 text-xs font-medium">
                <span className="text-emerald-700">{ready.length} ready</span>
                <span className="text-amber-700">{duplicates} duplicates</span>
                <span className="text-red-700">{invalid} invalid</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                    <tr>
                      {['Row', 'Flight', 'Route', 'Departure', 'Cabin · Brand', 'Pax', 'Price (NGN)', 'Review'].map(label => (
                        <th key={label} className="px-3 py-2.5 font-semibold">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mappedRows.slice(0, 50).map(item => {
                      const record = item.record;
                      const offer = record?.offers[0];
                      const price = offer?.prices[0];
                      const currency = offer?.currency;
                      return (
                        <tr key={item.line}>
                          <td className="px-3 py-2.5 text-gray-500">{item.line}</td>
                          <td className="px-3 py-2.5 font-medium text-gray-900">{record ? `${record.airline} ${record.flightNumber}` : '—'}</td>
                          <td className="px-3 py-2.5">{record ? `${record.origin} → ${record.destination}` : '—'}</td>
                          <td className="px-3 py-2.5">{record?.departure || '—'}</td>
                          <td className="px-3 py-2.5">{[offer?.cabinClass, offer?.fareBrand].filter(Boolean).join(' · ') || '—'}</td>
                          <td className="px-3 py-2.5">{price?.passengerType || '—'}</td>
                          <td className="px-3 py-2.5">{formatAmount(price?.sellingPrice ?? price?.supplierTotal ?? price?.baseFare, currency, convertToNGNAndFormat)}</td>
                          <td className="px-3 py-2.5">
                            {item.errors.length ? (
                              <span className="text-xs text-red-700">{item.errors.join(' ')}</span>
                            ) : item.duplicate ? (
                              <span className="text-xs text-amber-700">Duplicate, will be skipped</span>
                            ) : (
                              <span className="text-xs text-emerald-700">Ready</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {mappedRows.length > 50 && <p className="text-xs text-gray-500">Showing the first 50 of {mappedRows.length} rows.</p>}
            </>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={ready.length === 0}
            onClick={runImport}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import {ready.length} {ready.length === 1 ? 'row' : 'rows'}
          </button>
        </footer>
      </section>
    </div>
  );
}

