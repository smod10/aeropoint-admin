import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, Building2, PackageCheck } from 'lucide-react';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { readHotelListings, saveHotelListing } from '../../utils/hotelStorage';
import type { HotelListing, HotelRoom } from '../../types/hotel';

export default function HotelInventory() {
  const navigate = useNavigate();
  const canManage = canManageTeam(getCurrentActorRole());
  const [hotels, setHotels] = useState(readHotelListings);
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availability, setAvailability] = useState<'all' | HotelRoom['availability']>('all');

  const categories = [...new Set(hotels.map(hotel => hotel.category))].sort();
  const rooms = useMemo(() => hotels.flatMap(hotel => hotel.rooms.map(room => ({ hotel, room }))).filter(({ hotel, room }) => {
    const matchesHotel = selectedHotel === 'all' || hotel.id === selectedHotel;
    const matchesCategory = selectedCategory === 'all' || hotel.category === selectedCategory;
    const matchesAvailability = availability === 'all' || room.availability === availability;
    return matchesHotel && matchesCategory && matchesAvailability;
  }), [availability, hotels, selectedCategory, selectedHotel]);
  const availableUnits = rooms.reduce((total, item) => total + (item.room.availability === 'Available' ? item.room.availableUnits ?? 0 : 0), 0);
  const unavailableRoomTypes = rooms.filter(item => item.room.availability === 'Unavailable').length;

  const updateRoom = (hotel: HotelListing, roomId: string, updates: Partial<HotelRoom>) => {
    const updated = { ...hotel, rooms: hotel.rooms.map(room => room.id === roomId ? { ...room, ...updates } : room) };
    saveHotelListing(updated);
    setHotels(current => current.map(item => item.id === hotel.id ? updated : item));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Hotels / Inventory</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Room Inventory</h1><p className="mt-1 text-sm text-gray-500">Availability and rates across registered properties.</p></div>
        {canManage && <button onClick={() => navigate('/hotels/edit/new')} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Add property</button>}
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Properties</p><p className="mt-2 text-2xl font-semibold text-gray-900">{hotels.length}</p></article>
        <article className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Available rooms</p><p className="mt-2 text-2xl font-semibold text-gray-900">{availableUnits}</p></article>
        <article className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Unavailable room types</p><p className="mt-2 text-2xl font-semibold text-gray-900">{unavailableRoomTypes}</p></article>
      </section>

      <section className="grid gap-3 border-y border-gray-200 py-4 sm:grid-cols-3">
        <label className="text-xs font-semibold uppercase text-gray-500">Property<select value={selectedHotel} onChange={event => setSelectedHotel(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="all">All properties</option>{hotels.map(hotel => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}</select></label>
        <label className="text-xs font-semibold uppercase text-gray-500">Category<select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="all">All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
        <label className="text-xs font-semibold uppercase text-gray-500">Availability<select value={availability} onChange={event => setAvailability(event.target.value as typeof availability)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="all">All statuses</option><option value="Available">Available</option><option value="Unavailable">Unavailable</option></select></label>
      </section>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 font-semibold">Property</th><th className="px-4 py-3 font-semibold">Room type</th><th className="px-4 py-3 font-semibold">Capacity</th><th className="px-4 py-3 font-semibold">Rate / night</th><th className="px-4 py-3 font-semibold">Units</th><th className="px-4 py-3 font-semibold">Availability</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{rooms.map(({ hotel, room }) => <tr key={`${hotel.id}-${room.id}`} className="hover:bg-gray-50/70">
            <td className="px-5 py-4"><p className="font-medium text-gray-900">{hotel.name}</p><p className="mt-0.5 text-xs text-gray-500">{hotel.city}, {hotel.country} · {hotel.category}</p></td>
            <td className="px-4 py-4"><p className="font-medium text-gray-900">{room.name}</p><p className="mt-0.5 text-xs text-gray-500">{room.bedType || 'Bed type not set'}</p></td>
            <td className="px-4 py-4 text-gray-700">Up to {room.maxGuests}</td>
            <td className="px-4 py-4 font-medium text-gray-800">{new Intl.NumberFormat(undefined, { style: 'currency', currency: localStorage.getItem('aeropoint-base-currency') || 'NGN', maximumFractionDigits: 0 }).format(room.price)}</td>
            <td className="px-4 py-4">{canManage ? <input aria-label={`${room.name} available units`} type="number" min="0" value={room.availableUnits ?? 0} onChange={event => updateRoom(hotel, room.id, { availableUnits: Number(event.target.value) })} className="w-20 rounded border border-gray-200 px-2 py-1.5 text-sm" /> : <span className="text-gray-700">{room.availableUnits ?? 0}</span>}</td>
            <td className="px-4 py-4">{canManage ? <select aria-label={`${room.name} availability`} value={room.availability} onChange={event => updateRoom(hotel, room.id, { availability: event.target.value as HotelRoom['availability'] })} className="rounded border border-gray-200 px-2 py-1.5 text-sm"><option>Available</option><option>Unavailable</option></select> : <span className="inline-flex items-center gap-1.5 text-gray-700">{room.availability === 'Available' ? <PackageCheck size={14} className="text-emerald-600" /> : <BedDouble size={14} className="text-gray-400" />}{room.availability}</span>}</td>
            <td className="px-5 py-4 text-right"><button onClick={() => navigate(`/hotels/edit/${hotel.id}`)} className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"><Building2 size={14} /> Manage</button></td>
          </tr>)}
          {!rooms.length && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-gray-500">No room inventory matches these filters.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}