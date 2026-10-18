import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Columns, Edit2, Eye, FileUp, Plus, Search, Trash2 } from 'lucide-react';
import { deleteHotelListings, hotelSourceLabel, readHotelListings, saveHotelListing } from '../../utils/hotelStorage';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { findHotelOwner } from '../../data/hotelOwners';
import { sanitizeHtml } from '../../utils/richText';
import { useCurrency } from '../../context/CurrencyContext';
import SlideOver from '../../components/Shared/SlideOver';
import ToggleSwitch from '../../components/Shared/ToggleSwitch';
import HotelBulkUpload from './HotelBulkUpload';
import type { HotelListing } from '../../types/hotel';

type ColumnKey = 'status' | 'featured' | 'image' | 'name' | 'location' | 'stars' | 'rating' | 'owner';
type SearchField = 'all' | 'name' | 'location' | 'stars' | 'rating' | 'owner';

const columnLabels: Record<ColumnKey, string> = { status: 'Status', featured: 'Featured', image: 'Image', name: 'Hotel Name', location: 'Location', stars: 'Stars', rating: 'Rating', owner: 'Owner' };
const searchFields: { key: SearchField; label: string }[] = [
  { key: 'all', label: 'All Columns' }, { key: 'name', label: 'Hotel Name' }, { key: 'location', label: 'Location' },
  { key: 'stars', label: 'Stars' }, { key: 'rating', label: 'Rating' }, { key: 'owner', label: 'Owner' },
];

function searchValue(hotel: HotelListing, field: Exclude<SearchField, 'all'>) {
  if (field === 'name') return hotel.name;
  if (field === 'location') return `${hotel.city} ${hotel.country}`;
  if (field === 'stars') return String(hotel.stars);
  if (field === 'rating') return hotel.rating.toFixed(2);
  return findHotelOwner(hotel.ownerId)?.name ?? '';
}

export default function HotelCatalog() {
  const navigate = useNavigate();
  const { convertToNGNAndFormat } = useCurrency();
  const canManage = canManageTeam(getCurrentActorRole());
  const [hotels, setHotels] = useState(readHotelListings);
  const [search, setSearch] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visible, setVisible] = useState<Record<ColumnKey, boolean>>({ status: true, featured: true, image: true, name: true, location: true, stars: true, rating: true, owner: true });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<HotelListing>();
  const [message, setMessage] = useState('');

  const refresh = () => setHotels(readHotelListings());

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return hotels;
    return hotels.filter(hotel => field === 'all'
      ? (['name', 'location', 'stars', 'rating', 'owner'] as const).some(key => searchValue(hotel, key).toLowerCase().includes(query))
      : searchValue(hotel, field).toLowerCase().includes(query));
  }, [field, hotels, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageHotels = filtered.slice(startIndex, startIndex + rowsPerPage);
  const allOnPageSelected = pageHotels.length > 0 && pageHotels.every(hotel => selected.has(hotel.id));
  const columnCount = 3 + Object.values(visible).filter(Boolean).length + 1;

  const update = (hotel: HotelListing, changes: Partial<HotelListing>) => {
    saveHotelListing({ ...hotel, ...changes });
    refresh();
  };

  const toggleActive = (hotel: HotelListing, active: boolean) => {
    if (active && hotel.rooms.length === 0) { setMessage(`${hotel.name} needs at least one room before it can be activated.`); return; }
    setMessage('');
    update(hotel, { status: active ? 'Published' : hotel.status === 'Draft' ? 'Draft' : 'Unpublished' });
  };

  const remove = (hotelsToRemove: HotelListing[]) => {
    const label = hotelsToRemove.length === 1 ? hotelsToRemove[0].name : `${hotelsToRemove.length} hotels`;
    if (!window.confirm(`Delete ${label}? This removes the listing and its room data.`)) return;
    deleteHotelListings(hotelsToRemove.map(hotel => hotel.id));
    setSelected(new Set());
    setMessage(`Deleted ${label}.`);
    refresh();
  };

  const toggleRow = (id: string) => setSelected(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const togglePage = () => setSelected(current => {
    const next = new Set(current);
    for (const hotel of pageHotels) { if (allOnPageSelected) next.delete(hotel.id); else next.add(hotel.id); }
    return next;
  });

  const iconButton = 'inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50';
  const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white shadow-soft">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h1 className="text-lg font-bold text-gray-900">Stay Management</h1><p className="mt-0.5 text-sm text-gray-500">{hotels.length} records</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setColumnMenuOpen(open => !open)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Columns size={16} /> View Columns</button>
              {columnMenuOpen && <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">{(Object.keys(columnLabels) as ColumnKey[]).map(key => <label key={key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><input type="checkbox" checked={visible[key]} onChange={() => setVisible(current => ({ ...current, [key]: !current[key] }))} className="rounded border-gray-300" />{columnLabels[key]}</label>)}</div>}
            </div>
            <form onSubmit={event => event.preventDefault()} className="flex">
              <select aria-label="Search column" value={field} onChange={event => { setField(event.target.value as SearchField); setPage(1); }} className="rounded-l-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none">{searchFields.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select>
              <input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search records..." aria-label="Search records" className="w-44 border-y border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500" />
              <button type="submit" aria-label="Search" className="rounded-r-lg bg-primary-600 px-3 text-white hover:bg-primary-700"><Search size={16} /></button>
            </form>
            {canManage && <button onClick={() => navigate('/hotels/edit/new')} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Create New</button>}
            {canManage && <button onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><FileUp size={16} /> Upload Bulk</button>}
          </div>
        </div>

        <div className="mx-5 mb-4 flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertTriangle size={17} className="mt-0.5 shrink-0" /><p>Hotels are managed in this dashboard. Records labelled Demo are sample data, and no rates or availability here come from a live supplier connection.</p></div>
        {message && <p role="status" className="mx-5 mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">{message}</p>}
        {canManage && selected.size > 0 && <div className="mx-5 mb-4 flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50 px-4 py-2.5 text-sm text-primary-800"><span>{selected.size} selected</span><button onClick={() => remove(hotels.filter(hotel => selected.has(hotel.id)))} className="inline-flex items-center gap-1.5 font-medium text-red-700 hover:text-red-800"><Trash2 size={15} /> Delete selected</button></div>}

        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-100"><tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all on this page" checked={allOnPageSelected} onChange={togglePage} className="rounded border-gray-300" /></th>
              <th className={`${th} w-10`}>#</th>
              {visible.status && <th className={th}>Status</th>}
              {visible.featured && <th className={th}>Featured</th>}
              {visible.image && <th className={th}>Image</th>}
              {visible.name && <th className={th}>Hotel Name</th>}
              {visible.location && <th className={th}>Location</th>}
              {visible.stars && <th className={th}>Stars</th>}
              {visible.rating && <th className={th}>Rating</th>}
              {visible.owner && <th className={th}>Owner</th>}
              <th className={`${th} border-l border-gray-100 text-right`}>Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {pageHotels.map((hotel, index) => {
                const image = hotel.images.find(item => item.id === hotel.featuredImageId) ?? hotel.images[0];
                const owner = findHotelOwner(hotel.ownerId);
                return <tr key={hotel.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${hotel.name}`} checked={selected.has(hotel.id)} onChange={() => toggleRow(hotel.id)} className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{startIndex + index + 1}</td>
                  {visible.status && <td className="px-4 py-3"><ToggleSwitch checked={hotel.status === 'Published'} disabled={!canManage} label={`${hotel.name} active status`} onChange={active => toggleActive(hotel, active)} /></td>}
                  {visible.featured && <td className="px-4 py-3"><ToggleSwitch checked={hotel.featured} disabled={!canManage} label={`${hotel.name} featured`} onChange={featured => update(hotel, { featured })} /></td>}
                  {visible.image && <td className="px-4 py-3">{image ? <img src={image.src} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-300"><Building2 size={18} /></span>}</td>}
                  {visible.name && <td className="px-4 py-3"><p className="font-medium text-gray-900">{hotel.name}</p><p className={`mt-0.5 text-xs ${hotel.source === 'demo' ? 'text-amber-700' : 'text-gray-500'}`}>{hotelSourceLabel(hotel)}{hotel.status === 'Draft' ? ' · Draft' : ''}</p></td>}
                  {visible.location && <td className="px-4 py-3 text-gray-700" title={hotel.country}>{hotel.city || '—'}</td>}
                  {visible.stars && <td className="px-4 py-3 text-gray-700">{hotel.stars}</td>}
                  {visible.rating && <td className="px-4 py-3 text-gray-700">{hotel.rating.toFixed(2)}</td>}
                  {visible.owner && <td className="px-4 py-3 text-gray-700">{owner?.name ?? '—'}</td>}
                  <td className="border-l border-gray-100 px-4 py-3"><div className="flex justify-end gap-1.5">
                    <button onClick={() => setPreview(hotel)} aria-label={`View ${hotel.name}`} title="View details" className={iconButton}><Eye size={15} /></button>
                    <button onClick={() => navigate(`/hotels/inventory/${hotel.id}`)} aria-label={`${hotel.name} rooms and availability`} title="Rooms and availability" className={iconButton}><CalendarDays size={15} /></button>
                    <button onClick={() => navigate(`/hotels/rates/${hotel.id}`)} aria-label={`${hotel.name} rates calendar`} title="Rates calendar" className={iconButton}><CalendarRange size={15} /></button>
                    {canManage && <button onClick={() => navigate(`/hotels/edit/${hotel.id}`)} aria-label={`Edit ${hotel.name}`} title="Edit hotel" className={iconButton}><Edit2 size={15} /></button>}
                    {canManage && <button onClick={() => remove([hotel])} aria-label={`Delete ${hotel.name}`} title="Delete hotel" className={`${iconButton} hover:text-red-600`}><Trash2 size={15} /></button>}
                  </div></td>
                </tr>;
              })}
              {pageHotels.length === 0 && <tr><td colSpan={columnCount} className="px-5 py-16 text-center"><Building2 size={28} className="mx-auto text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700">{search ? 'No hotels match this search' : 'No hotels added yet'}</p><p className="mt-1 text-xs text-gray-500">{search ? 'Try a different search term or column.' : 'Use Create New or Upload Bulk to add hotels.'}</p></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 p-4 sm:flex-row">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} results</span>
            <select aria-label="Rows per page" value={rowsPerPage} onChange={event => { setRowsPerPage(Number(event.target.value)); setPage(1); }} className="rounded border border-gray-200 bg-white px-2 py-1 text-sm">{[10, 25, 50, 100].map(size => <option key={size} value={size}>{size} per page</option>)}</select>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Previous page" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
            <span className="px-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} aria-label="Next page" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {uploadOpen && <HotelBulkUpload onClose={() => setUploadOpen(false)} onImported={result => { setUploadOpen(false); setMessage(result); refresh(); }} />}

      <SlideOver isOpen={Boolean(preview)} onClose={() => setPreview(undefined)} title={preview?.name ?? ''}>
        {preview && <div className="space-y-5">
          <p className={`text-xs font-medium ${preview.source === 'demo' ? 'text-amber-700' : 'text-gray-500'}`}>{hotelSourceLabel(preview)}</p>
          <dl className="grid grid-cols-2 gap-4">
            {([['Accommodation type', preview.category], ['Stars', String(preview.stars)], ['Rating', preview.rating.toFixed(2)], ['Currency', preview.currency], ['Location', [preview.city, preview.country].filter(Boolean).join(', ') || '—'], ['Owner', findHotelOwner(preview.ownerId)?.name ?? '—'], ['Check-in', preview.checkInTime || '—'], ['Check-out', preview.checkOutTime || '—']] as const).map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase text-gray-500">{label}</dt><dd className="mt-1 text-gray-900">{value}</dd></div>)}
          </dl>
          {preview.description && <div><h3 className="text-xs font-semibold uppercase text-gray-500">Description</h3><div className="mt-1 text-gray-700 [&_p]:my-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(preview.description) }} /></div>}
          <div><h3 className="text-xs font-semibold uppercase text-gray-500">Amenities</h3><p className="mt-1 text-gray-700">{preview.amenities.length ? preview.amenities.join(', ') : 'None selected'}</p></div>
          <div><h3 className="text-xs font-semibold uppercase text-gray-500">Rooms</h3>{preview.rooms.length ? <ul className="mt-2 space-y-2">{preview.rooms.map(room => <li key={room.id} className="rounded border border-gray-100 p-3"><p className="font-medium text-gray-900">{room.name || room.roomType}</p><p className="mt-0.5 text-xs text-gray-500">{room.roomType} · up to {room.maxGuests} guests · {room.availability}</p><ul className="mt-2 space-y-0.5 text-xs text-gray-600">{room.options.map(option => <li key={option.id} className="flex justify-between"><span>{option.board}</span><span>{convertToNGNAndFormat(option.price, preview.currency)}</span></li>)}</ul></li>)}</ul> : <p className="mt-1 text-gray-500">No rooms added.</p>}</div>
          {canManage && <button onClick={() => navigate(`/hotels/edit/${preview.id}`)} className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Edit hotel</button>}
        </div>}
      </SlideOver>
    </div>
  );
}
