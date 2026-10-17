import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { Download, FileUp, X } from 'lucide-react';
import { createBlankHotel, createBlankRoom, hotelDuplicateKey, readHotelListings, supportedCurrencies, writeHotelListings } from '../../utils/hotelStorage';
import { readActiveStayNames } from '../../utils/stayStorage';
import { plainTextToHtml, sanitizeHtml } from '../../utils/richText';
import { findDestination } from '../../data/destinations';
import type { Currency } from '../../context/CurrencyContext';
import type { HotelListing, HotelRoom } from '../../types/hotel';

type Props = { onClose: () => void; onImported: (message: string) => void };
type Row = Record<string, string>;
type Checked = { line: number; hotelKey: string; errors: string[]; duplicate: boolean; row: Row };

const templateHeaders = ['name', 'city', 'country', 'address', 'accommodation_type', 'stars', 'rating', 'currency', 'email', 'phone', 'website', 'description', 'amenities', 'room_type', 'room_name', 'bed_type', 'max_guests', 'available_units', 'board', 'price'];
const templateRow = ['Example Bay Hotel', 'Dubai', 'United Arab Emirates', 'Example Street 1', 'Hotel', '4', '8.5', 'USD', 'stay@example.com', '+971 4 000 0000', 'https://example.com', 'Sample description', 'Free WiFi;Swimming Pool', 'Deluxe Room', 'Deluxe King', 'King', '2', '5', 'Bed & Breakfast', '180'];

const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const roomFields = ['room_type', 'room_name', 'bed_type', 'max_guests', 'available_units', 'board', 'price'];

function toNumber(value: string) {
  return value.trim() === '' ? undefined : Number(value.replace(/,/g, ''));
}

export default function HotelBulkUpload({ onClose, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const settings = useMemo(() => ({
    accommodation: readActiveStayNames('accommodation'),
    amenities: readActiveStayNames('stayAmenity'),
    roomTypes: readActiveStayNames('roomType'),
    boards: readActiveStayNames('board'),
  }), []);

  const checked = useMemo<Checked[]>(() => {
    const existing = new Set(readHotelListings().map(hotelDuplicateKey));
    const seenLines = new Set<string>();
    const lookup = (names: string[], value: string) => names.find(name => name.toLowerCase() === value.trim().toLowerCase());

    return rows.map((row, index) => {
      const errors: string[] = [];
      const name = row.name?.trim() ?? '';
      const city = row.city?.trim() ?? '';
      if (!name) errors.push('Name is required.');
      if (!city) errors.push('City is required.');
      const type = row.accommodation_type?.trim();
      if (type && !lookup(settings.accommodation, type)) errors.push(`Accommodation type "${type}" is not set up in Stay Settings.`);
      const stars = toNumber(row.stars ?? '');
      if (stars !== undefined && (!Number.isInteger(stars) || stars < 1 || stars > 5)) errors.push('Stars must be a whole number from 1 to 5.');
      const rating = toNumber(row.rating ?? '');
      if (rating !== undefined && (!Number.isFinite(rating) || rating < 0 || rating > 10)) errors.push('Rating must be between 0 and 10.');
      const currency = row.currency?.trim().toUpperCase();
      if (currency && !supportedCurrencies.includes(currency as Currency)) errors.push(`Currency "${currency}" has no admin exchange rate.`);
      if (row.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) errors.push('Email is not valid.');
      for (const amenity of (row.amenities ?? '').split(';').map(item => item.trim()).filter(Boolean)) {
        if (!lookup(settings.amenities, amenity)) errors.push(`Amenity "${amenity}" is not set up in Stay Settings.`);
      }

      const hasRoom = roomFields.some(field => row[field]?.trim());
      if (hasRoom) {
        const roomType = row.room_type?.trim();
        if (!roomType) errors.push('Room type is required when room details are given.');
        else if (!lookup(settings.roomTypes, roomType)) errors.push(`Room type "${roomType}" is not set up in Stay Settings.`);
        const board = row.board?.trim();
        if (board && !lookup(settings.boards, board)) errors.push(`Board "${board}" is not set up in Stay Settings.`);
        const price = toNumber(row.price ?? '');
        if (price === undefined || !Number.isFinite(price) || price < 0) errors.push('Room price must be a number of zero or more.');
        const guests = toNumber(row.max_guests ?? '');
        if (guests !== undefined && (!Number.isInteger(guests) || guests < 1)) errors.push('Max guests must be a whole number of 1 or more.');
        const units = toNumber(row.available_units ?? '');
        if (units !== undefined && (!Number.isInteger(units) || units < 0)) errors.push('Available units must be a whole number of 0 or more.');
      }

      const hotelKey = hotelDuplicateKey({ name, city });
      const lineKey = `${hotelKey}|${(row.room_name || row.room_type || '').trim().toLowerCase()}|${(row.board || 'Room Only').trim().toLowerCase()}`;
      const repeated = hasRoom && seenLines.has(lineKey);
      if (hasRoom) seenLines.add(lineKey);
      return { line: index + 2, hotelKey, errors, duplicate: !errors.length && (existing.has(hotelKey) || repeated), row };
    });
  }, [rows, settings]);

  const ready = checked.filter(item => !item.errors.length && !item.duplicate);
  const duplicates = checked.filter(item => item.duplicate).length;
  const invalid = checked.filter(item => item.errors.length).length;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    setError('');
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: header => {
        const normalized = normalizeHeader(header);
        const match = templateHeaders.find(candidate => normalizeHeader(candidate) === normalized);
        return match ?? (normalized === 'location' ? 'city' : normalized === 'type' || normalized === 'category' ? 'accommodation_type' : header.trim());
      },
      complete: result => {
        if (result.errors.length > 0) { setRows([]); setError(`Could not read ${file.name}: ${result.errors[0].message}`); return; }
        if (!result.meta.fields?.includes('name') || !result.meta.fields.includes('city')) { setRows([]); setError('The file needs "name" and "city" columns. Download the template for the expected format.'); return; }
        if (result.data.length === 0) { setRows([]); setError('The file has no data rows.'); return; }
        setFileName(file.name);
        setRows(result.data);
      },
      error: parseError => setError(`Import failed: ${parseError.message}`),
    });
  };

  const downloadTemplate = () => {
    const csv = `${templateHeaders.join(',')}\n${templateRow.map(value => `"${value.replace(/"/g, '""')}"`).join(',')}\n`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'hotel-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const runImport = () => {
    const importedAt = new Date().toISOString();
    const batchId = `HTL-${importedAt.replace(/\D/g, '').slice(0, 14)}`;
    const hotels = new Map<string, HotelListing>();
    const lookup = (names: string[], value: string) => names.find(name => name.toLowerCase() === value.trim().toLowerCase()) ?? value.trim();

    for (const { hotelKey, row } of ready) {
      let hotel = hotels.get(hotelKey);
      if (!hotel) {
        const city = row.city.trim();
        const destination = findDestination(city);
        const currency = (row.currency?.trim().toUpperCase() || 'NGN') as Currency;
        hotel = {
          ...createBlankHotel(),
          name: row.name.trim(),
          description: sanitizeHtml(plainTextToHtml(row.description?.trim() ?? '')),
          city,
          country: row.country?.trim() || destination?.country || '',
          latitude: destination?.latitude,
          longitude: destination?.longitude,
          address: row.address?.trim() ?? '',
          category: row.accommodation_type?.trim() ? lookup(settings.accommodation, row.accommodation_type) : 'Hotel',
          stars: toNumber(row.stars ?? '') ?? 3,
          rating: toNumber(row.rating ?? '') ?? 0,
          currency,
          contactEmail: row.email?.trim() ?? '',
          contactPhone: row.phone?.trim() ?? '',
          website: row.website?.trim() ?? '',
          amenities: (row.amenities ?? '').split(';').map(item => item.trim()).filter(Boolean).map(item => lookup(settings.amenities, item)),
          status: 'Draft',
          source: 'import',
          importBatchId: batchId,
          importedAt,
        };
        hotels.set(hotelKey, hotel);
      }

      if (roomFields.some(field => row[field]?.trim())) {
        const roomLabel = row.room_name?.trim() || row.room_type.trim();
        let room: HotelRoom | undefined = hotel.rooms.find(item => item.name.toLowerCase() === roomLabel.toLowerCase());
        const board = lookup(settings.boards, row.board?.trim() || 'Room Only');
        const price = toNumber(row.price) ?? 0;
        if (!room) {
          room = { ...createBlankRoom(), name: roomLabel, roomType: lookup(settings.roomTypes, row.room_type), bedType: row.bed_type?.trim() ?? '', maxGuests: toNumber(row.max_guests ?? '') ?? 2, availableUnits: toNumber(row.available_units ?? '') ?? 0, options: [] };
          hotel.rooms.push(room);
        }
        room.options.push({ id: crypto.randomUUID(), board, price });
        room.price = Math.min(...room.options.map(option => option.price));
      }
    }

    const imported = Array.from(hotels.values());
    writeHotelListings([...imported, ...readHotelListings()]);
    onImported(`Imported ${imported.length} ${imported.length === 1 ? 'hotel' : 'hotels'} as drafts (batch ${batchId}). ${duplicates} duplicate rows skipped; ${invalid} rows rejected.`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="bulk-upload-title" className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div><h2 id="bulk-upload-title" className="text-lg font-semibold text-gray-900">Upload Hotels in Bulk</h2><p className="mt-1 text-sm text-gray-500">Upload a CSV file. Rows are checked against Stay Settings before anything is saved. Imported hotels are created as drafts.</p></div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
        </header>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"><FileUp size={16} /> Choose CSV file</button>
            <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><Download size={16} /> Download template</button>
            <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
            {fileName && <span className="text-sm text-gray-600">{fileName} · {rows.length} rows</span>}
          </div>
          <p className="text-xs text-gray-500">One row per hotel room option: repeat the hotel name and city on extra rows to add more rooms or board options to the same hotel. Use ";" between amenities. Imported data is demo-independent but is not live supplier inventory.</p>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          {rows.length > 0 && <>
            <div className="flex gap-4 text-xs"><span className="text-emerald-700">{ready.length} ready</span><span className="text-amber-700">{duplicates} duplicates</span><span className="text-red-700">{invalid} invalid</span></div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase text-gray-500"><tr>{['Row', 'Hotel', 'City', 'Type', 'Room', 'Board', 'Price', 'Review'].map(label => <th key={label} className="px-3 py-2.5 font-semibold">{label}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100">{checked.slice(0, 50).map(item => <tr key={item.line}>
                  <td className="px-3 py-2.5 text-gray-500">{item.line}</td><td className="px-3 py-2.5 text-gray-900">{item.row.name || '—'}</td><td className="px-3 py-2.5">{item.row.city || '—'}</td><td className="px-3 py-2.5">{item.row.accommodation_type || '—'}</td><td className="px-3 py-2.5">{item.row.room_name || item.row.room_type || '—'}</td><td className="px-3 py-2.5">{item.row.board || '—'}</td><td className="px-3 py-2.5">{item.row.price ? `${item.row.currency || 'NGN'} ${item.row.price}` : '—'}</td>
                  <td className="px-3 py-2.5">{item.errors.length ? <span className="text-red-700">{item.errors.join(' ')}</span> : item.duplicate ? <span className="text-amber-700">Duplicate, will be skipped</span> : <span className="text-emerald-700">Ready</span>}</td>
                </tr>)}</tbody>
              </table>
            </div>
            {checked.length > 50 && <p className="text-xs text-gray-500">Showing the first 50 of {checked.length} rows.</p>}
          </>}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="button" disabled={ready.length === 0} onClick={runImport} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Import {ready.length} {ready.length === 1 ? 'row' : 'rows'}</button>
        </footer>
      </section>
    </div>
  );
}
