import { Fragment, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { readHotelListings, saveHotelListing } from '../../utils/hotelStorage';
import type { HotelListing } from '../../types/hotel';

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const localDate = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const startOfToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export default function HotelRateCalendar() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const canManage = canManageTeam(getCurrentActorRole());
  const [hotels, setHotels] = useState(readHotelListings);
  const [month, setMonth] = useState(() => {
    const today = startOfToday();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const todayKey = dateKey(startOfToday());
  const tomorrowKey = dateKey(new Date(startOfToday().getFullYear(), startOfToday().getMonth(), startOfToday().getDate() + 1));
  const hotel = hotels.find(item => item.id === hotelId);
  const [roomFilter, setRoomFilter] = useState('all');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [draftRates, setDraftRates] = useState<Record<string, number>>({});
  const [fromDate, setFromDate] = useState(tomorrowKey);
  const [toDate, setToDate] = useState(tomorrowKey);
  const [bulkPrice, setBulkPrice] = useState('');
  const [message, setMessage] = useState('');

  if (!hotel) {
    return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Stay listing not found.</div>;
  }

  const visibleRooms = hotel.rooms.filter(room => roomFilter === 'all' || room.id === roomFilter);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const hasChanges = Object.keys(draftRates).length > 0;

  const rateFor = (optionId: string, day: string, basePrice: number, storedRates?: Record<string, number>) =>
    draftRates[`${optionId}|${day}`] ?? storedRates?.[day] ?? basePrice;

  const changeRate = (optionId: string, day: string, value: string) => {
    if (day <= todayKey || !canManage) return;
    const price = Number(value);
    if (value === '' || !Number.isFinite(price) || price < 0) return;
    setDraftRates(current => ({ ...current, [`${optionId}|${day}`]: price }));
    setMessage('');
  };

  const applyRange = () => {
    if (!canManage) return;
    if (!fromDate || !toDate || fromDate < tomorrowKey || toDate < fromDate) {
      setMessage('Choose a date range starting tomorrow or later.');
      return;
    }
    if (bulkPrice.trim() === '' || !Number.isFinite(Number(bulkPrice)) || Number(bulkPrice) < 0) {
      setMessage('Enter a valid rate.');
      return;
    }
    const targets = visibleRooms.flatMap(room => room.options).filter(option => selectedOptions.has(option.id));
    if (!targets.length) {
      setMessage('Select at least one room option.');
      return;
    }

    const updates: Record<string, number> = {};
    const cursor = localDate(fromDate);
    const finalDate = localDate(toDate);
    while (cursor <= finalDate) {
      const day = dateKey(cursor);
      if (day > todayKey) targets.forEach(option => { updates[`${option.id}|${day}`] = Number(bulkPrice); });
      cursor.setDate(cursor.getDate() + 1);
    }
    setDraftRates(current => ({ ...current, ...updates }));
    setMessage('Rates applied to the selected future dates.');
  };

  const saveChanges = () => {
    if (!canManage || !hasChanges) return;
    const updated: HotelListing = {
      ...hotel,
      rooms: hotel.rooms.map(room => ({
        ...room,
        options: room.options.map(option => {
          const dateRates = { ...option.dateRates };
          Object.entries(draftRates).forEach(([key, price]) => {
            const [optionId, day] = key.split('|');
            if (optionId === option.id && day > todayKey) dateRates[day] = price;
          });
          return { ...option, dateRates };
        }),
      })),
    };
    saveHotelListing(updated);
    setHotels(current => current.map(item => item.id === updated.id ? updated : item));
    setDraftRates({});
    setMessage('Rate changes saved.');
  };

  const toggleOption = (optionId: string) => setSelectedOptions(current => {
    const next = new Set(current);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    return next;
  });

  const selectAllVisible = () => {
    const visibleIds = visibleRooms.flatMap(room => room.options.map(option => option.id));
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedOptions.has(id));
    setSelectedOptions(current => {
      const next = new Set(current);
      visibleIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const allVisibleSelected = visibleRooms.flatMap(room => room.options).length > 0
    && visibleRooms.flatMap(room => room.options).every(option => selectedOptions.has(option.id));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hotels')} aria-label="Back to hotels" className="rounded border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={17} /></button>
          <div className="text-sm text-gray-500">Hotels <span className="mx-1.5">›</span> <span className="text-gray-700">{hotel.name}</span> <span className="mx-1.5">›</span> <span className="font-medium text-gray-900">Rates Calendar</span></div>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Hotel #{hotel.id}</span>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Filter room type" value={roomFilter} onChange={event => setRoomFilter(event.target.value)} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
            <option value="all">All Room Types</option>
            {hotel.rooms.map(room => <option key={room.id} value={room.id}>{room.name || room.roomType}</option>)}
          </select>
          <div className="flex items-center rounded-full border border-gray-200 bg-white p-1">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month" className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100"><ChevronLeft size={16} /></button>
            <label className="flex items-center gap-2 px-2 text-xs font-medium text-gray-700"><span>{monthLabel}</span><input aria-label="Choose month" type="month" value={`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`} onChange={event => { const [year, selectedMonth] = event.target.value.split('-').map(Number); if (year && selectedMonth) setMonth(new Date(year, selectedMonth - 1, 1)); }} className="w-5 cursor-pointer opacity-70" /></label>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month" className="rounded-full p-1.5 text-gray-600 hover:bg-gray-100"><ChevronRight size={16} /></button>
          </div>
          <button onClick={() => { const today = startOfToday(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Today</button>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">Rates in <strong className="text-gray-700">{hotel.currency}</strong>
          {canManage && <button onClick={saveChanges} disabled={!hasChanges} className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Save size={14} /> Save Changes</button>}
        </div>
      </div>

      <section className="flex flex-wrap items-end gap-2 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700"><CalendarDays size={15} className="text-blue-600" /> Bulk Date Range</div>
        <label className="text-xs text-gray-500">From<input aria-label="Range start date" type="date" min={tomorrowKey} value={fromDate} onChange={event => setFromDate(event.target.value)} disabled={!canManage} className="ml-2 rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 disabled:bg-gray-100" /></label>
        <label className="text-xs text-gray-500">To<input aria-label="Range end date" type="date" min={fromDate < tomorrowKey ? tomorrowKey : fromDate} value={toDate} onChange={event => setToDate(event.target.value)} disabled={!canManage} className="ml-2 rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-700 disabled:bg-gray-100" /></label>
        <select aria-label="Bulk room filter" value={roomFilter} onChange={event => setRoomFilter(event.target.value)} className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
          <option value="all">All Rooms</option>
          {hotel.rooms.map(room => <option key={room.id} value={room.id}>{room.name || room.roomType}</option>)}
        </select>
        <span className="text-xs text-gray-500">{hotel.currency}</span>
        <input aria-label="Bulk rate" type="number" min="0" step="0.01" value={bulkPrice} onChange={event => setBulkPrice(event.target.value)} disabled={!canManage} placeholder="Price" className="w-24 rounded border border-gray-200 px-2 py-1.5 text-xs disabled:bg-gray-100" />
        <button onClick={applyRange} disabled={!canManage} className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Apply to Range</button>
        <span className="ml-auto text-xs italic text-gray-400">Select room options below; only future dates are editable.</span>
      </section>

      {message && <p role="status" className="text-xs text-gray-600">{message}</p>}

      <div className="overflow-auto border border-gray-200 bg-white">
        <table className="w-full min-w-[1500px] border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-gray-100 text-gray-600">
            <tr>
              <th className="sticky left-0 z-20 w-48 border-b border-r border-gray-200 bg-gray-100 px-3 py-2 text-left font-semibold uppercase tracking-wide">
                <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={allVisibleSelected} onChange={selectAllVisible} disabled={!canManage} /> Room / Option</label>
              </th>
              {dates.map(date => {
                const day = dateKey(date);
                const isToday = day === todayKey;
                return <th key={day} aria-label={`${date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${day <= todayKey ? ', not editable' : ''}`} className={`w-16 border-b border-r border-gray-200 px-1 py-1.5 text-center ${isToday ? 'bg-blue-100 text-blue-700' : ''} ${day <= todayKey ? 'text-gray-400' : ''}`}>
                  <span className="block text-[9px] uppercase">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span><span className="text-xs font-semibold">{date.getDate()}</span>
                </th>;
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRooms.map(room => <Fragment key={room.id}>
              <tr key={`${room.id}-heading`} className="border-b border-gray-200 bg-gray-100/80">
                <th colSpan={dates.length + 1} className="sticky left-0 px-3 py-1.5 text-left font-semibold text-gray-800">▱ &nbsp;{room.name || room.roomType}</th>
              </tr>
              {room.options.map(option => <tr key={option.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                <th className="sticky left-0 z-[1] border-r border-gray-200 bg-white px-3 py-1.5 text-left font-normal text-gray-700">
                  <label className="flex items-center gap-2"><input type="checkbox" aria-label={`Select ${room.name || room.roomType} ${option.board}`} checked={selectedOptions.has(option.id)} onChange={() => toggleOption(option.id)} disabled={!canManage} /><span>{option.board}</span></label>
                </th>
                {dates.map(date => {
                  const day = dateKey(date);
                  const editable = canManage && day > todayKey;
                  const value = rateFor(option.id, day, option.price, option.dateRates);
                  return <td key={day} className={`border-r border-gray-100 p-0.5 text-center ${day === todayKey ? 'bg-blue-50' : ''} ${!editable ? 'text-gray-400' : ''}`}>
                    {editable ? <input aria-label={`${room.name || room.roomType}, ${option.board}, ${day} rate`} type="number" min="0" step="0.01" value={value} onChange={event => changeRate(option.id, day, event.target.value)} className="h-7 w-full min-w-12 border-0 bg-transparent px-1 text-center text-[10px] text-gray-600 outline-none focus:bg-blue-50 focus:ring-1 focus:ring-inset focus:ring-blue-400" /> : <span aria-label={`${value} ${hotel.currency}; not editable`} className="inline-block min-w-10 py-1.5">{value}</span>}
                  </td>;
                })}
              </tr>)}
            </Fragment>)}
            {visibleRooms.length === 0 && <tr><td colSpan={dates.length + 1} className="px-4 py-10 text-center text-gray-500">No rooms are available for this property.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}