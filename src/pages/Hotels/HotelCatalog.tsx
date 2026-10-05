import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { deleteHotelListing, readHotelListings } from '../../utils/hotelStorage';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import type { HotelListing } from '../../types/hotel';

export default function HotelCatalog() {
  const navigate = useNavigate();
  const canManage = canManageTeam(getCurrentActorRole());
  const [hotels, setHotels] = useState(readHotelListings);
  const [search, setSearch] = useState('');
  const filteredHotels = hotels.filter(hotel => `${hotel.name} ${hotel.city} ${hotel.country} ${hotel.category}`.toLowerCase().includes(search.toLowerCase()));

  const updateHotel = (hotel: HotelListing) => {
    const saved = [...hotels];
    const index = saved.findIndex(item => item.id === hotel.id);
    if (index >= 0) saved[index] = hotel;
    setHotels(saved);
  };

  const cycleStatus = (hotel: HotelListing) => {
    const status: HotelListing['status'] = hotel.status === 'Published' ? 'Unpublished' : 'Published';
    updateHotel({ ...hotel, status });
    localStorage.setItem('aeropoint-hotel-listings', JSON.stringify(hotels.map(item => item.id === hotel.id ? { ...item, status } : item)));
  };

  const removeHotel = (hotel: HotelListing) => {
    if (!window.confirm(`Delete ${hotel.name}? This will remove its listing and room data.`)) return;
    deleteHotelListing(hotel.id);
    setHotels(current => current.filter(item => item.id !== hotel.id));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Inventory</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Hotel Management</h1><p className="mt-1 text-sm text-gray-500">{hotels.length} registered properties</p></div>
        {canManage && <button onClick={() => navigate('/hotels/edit/new')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Add New Hotel</button>}
      </header>

      <div className="flex flex-col gap-3 border-y border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md"><Search size={16} className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search hotels, locations, or categories" className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-500" /></label>
        <p className="text-sm text-gray-500">Only published listings are selectable for bookings.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 font-semibold">Hotel</th><th className="px-4 py-3 font-semibold">Location</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Rating</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Date added</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{filteredHotels.map(hotel => {
            const featuredImage = hotel.images.find(image => image.id === hotel.featuredImageId) ?? hotel.images[0];
            return <tr key={hotel.id} className="hover:bg-gray-50/70">
              <td className="px-5 py-4"><div className="flex items-center gap-3">{featuredImage ? <img src={featuredImage.src} alt="" className="h-11 w-11 rounded object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded bg-gray-100 text-gray-400"><Building2 size={19} /></span>}<div><p className="font-medium text-gray-900">{hotel.name}</p><p className="mt-0.5 text-xs text-gray-500">{hotel.rooms.length} room types</p></div></div></td>
              <td className="px-4 py-4 text-gray-700">{hotel.city}, {hotel.country}</td>
              <td className="px-4 py-4 text-gray-700">{hotel.category}</td>
              <td className="px-4 py-4 text-gray-700">{hotel.stars} star{hotel.stars === 1 ? '' : 's'}</td>
              <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${hotel.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : hotel.status === 'Draft' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{hotel.status}</span></td>
              <td className="px-4 py-4 text-gray-600">{new Date(hotel.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-4"><div className="flex justify-end gap-2">{canManage && <><button onClick={() => cycleStatus(hotel)} className="rounded border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">{hotel.status === 'Published' ? 'Unpublish' : 'Publish'}</button><button onClick={() => navigate(`/hotels/edit/${hotel.id}`)} aria-label={`Edit ${hotel.name}`} className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"><Edit2 size={15} /></button><button onClick={() => removeHotel(hotel)} aria-label={`Delete ${hotel.name}`} className="rounded border border-gray-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></>}</div></td>
            </tr>;
          })}
          {filteredHotels.length === 0 && <tr><td colSpan={7} className="px-5 py-16 text-center"><Building2 size={28} className="mx-auto text-gray-300" /><p className="mt-3 text-sm font-medium text-gray-700">{search ? 'No matching hotel listings' : 'No hotels added yet'}</p><p className="mt-1 text-xs text-gray-500">Add a property to start managing rooms and availability.</p></td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}