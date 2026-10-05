import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { readHotelListings, saveHotelListing } from '../../utils/hotelStorage';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import type { HotelImage, HotelListing, HotelRoom } from '../../types/hotel';

const standardAmenities = ['Wi-Fi', 'Swimming Pool', 'Gym', 'Restaurant', 'Parking', 'Airport Transfer', 'Breakfast', 'Air Conditioning', 'Room Service'];
const fieldClass = 'mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

function blankRoom(): HotelRoom {
  return { id: crypto.randomUUID(), name: '', description: '', images: [], maxGuests: 2, bedType: '', facilities: [], price: 0, availability: 'Available' };
}

function readImage(file: File): Promise<HotelImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, src: String(reader.result) });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function newHotel(): HotelListing {
  return {
    id: crypto.randomUUID(), name: '', description: '', address: '', city: '', country: '', contactName: '',
    contactEmail: '', contactPhone: '', category: 'Hotel', stars: 3, amenities: [], images: [], featuredImageId: '',
    rooms: [blankRoom()], status: 'Draft', createdAt: new Date().toISOString(),
  };
}

export default function HotelListingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canManage = canManageTeam(getCurrentActorRole());
  const existing = id && id !== 'new' ? readHotelListings().find(hotel => hotel.id === id) : undefined;
  const [hotel, setHotel] = useState<HotelListing>(() => existing ?? newHotel());
  const [customAmenity, setCustomAmenity] = useState('');

  const update = <K extends keyof HotelListing>(key: K, value: HotelListing[K]) => setHotel(current => ({ ...current, [key]: value }));
  const addPropertyImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const images = await Promise.all(files.map(readImage));
    setHotel(current => ({ ...current, images: [...current.images, ...images], featuredImageId: current.featuredImageId || images[0].id }));
    event.target.value = '';
  };
  const removePropertyImage = (imageId: string) => setHotel(current => {
    const images = current.images.filter(image => image.id !== imageId);
    return { ...current, images, featuredImageId: current.featuredImageId === imageId ? images[0]?.id || '' : current.featuredImageId };
  });
  const updateRoom = (roomId: string, updates: Partial<HotelRoom>) => setHotel(current => ({ ...current, rooms: current.rooms.map(room => room.id === roomId ? { ...room, ...updates } : room) }));
  const addRoomImages = async (roomId: string, event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    updateRoom(roomId, { images: [...(hotel.rooms.find(room => room.id === roomId)?.images || []), ...await Promise.all(files.map(readImage))] });
    event.target.value = '';
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveHotelListing(hotel);
    navigate('/hotels');
  };
  const toggleAmenity = (amenity: string) => update('amenities', hotel.amenities.includes(amenity) ? hotel.amenities.filter(item => item !== amenity) : [...hotel.amenities, amenity]);
  const addCustomAmenity = () => {
    const amenity = customAmenity.trim();
    if (amenity && !hotel.amenities.includes(amenity)) update('amenities', [...hotel.amenities, amenity]);
    setCustomAmenity('');
  };

  if (id && id !== 'new' && !existing) return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Hotel listing not found.</div>;
  if (!canManage) return <div role="alert" className="rounded-lg border border-red-200 bg-white p-8 text-center text-gray-600">You do not have permission to manage hotel listings.</div>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><Link to="/hotels" aria-label="Back to hotels" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Hotel inventory</p><h1 className="mt-1 text-2xl font-bold text-gray-900">{existing ? 'Edit hotel listing' : 'Add new hotel'}</h1></div></div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save listing</button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Basic information</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Hotel / property name<input required value={hotel.name} onChange={event => update('name', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Description<textarea required rows={4} value={hotel.description} onChange={event => update('description', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Street address<input required value={hotel.address} onChange={event => update('address', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">City<input required value={hotel.city} onChange={event => update('city', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Country<input required value={hotel.country} onChange={event => update('country', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Category<select value={hotel.category} onChange={event => update('category', event.target.value)} className={fieldClass}>{['Hotel', 'Resort', 'Apartment', 'Guest House', 'Villa', 'Hostel', 'Other'].map(category => <option key={category}>{category}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Star rating<select value={hotel.stars} onChange={event => update('stars', Number(event.target.value))} className={fieldClass}>{[1, 2, 3, 4, 5].map(stars => <option key={stars} value={stars}>{stars} star{stars === 1 ? '' : 's'}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Contact name<input value={hotel.contactName} onChange={event => update('contactName', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Contact email<input type="email" value={hotel.contactEmail} onChange={event => update('contactEmail', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Contact phone<input type="tel" value={hotel.contactPhone} onChange={event => update('contactPhone', event.target.value)} className={fieldClass} /></label>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-gray-900">Property images</h2><p className="mt-1 text-xs text-gray-500">Choose a featured image for the listing.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><ImagePlus size={16} /> Upload images<input type="file" accept="image/*" multiple onChange={addPropertyImages} className="sr-only" /></label></div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{hotel.images.map(image => <div key={image.id} className="relative overflow-hidden rounded-lg border border-gray-200"><img src={image.src} alt={image.name} className="aspect-square w-full object-cover" /><label className="flex items-center gap-1.5 p-2 text-xs text-gray-700"><input type="radio" name="featured-image" checked={hotel.featuredImageId === image.id} onChange={() => update('featuredImageId', image.id)} />Featured</label><button type="button" onClick={() => removePropertyImage(image.id)} aria-label={`Remove ${image.name}`} className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-600"><Trash2 size={14} /></button></div>)}{hotel.images.length === 0 && <p className="py-5 text-sm text-gray-500">No images uploaded.</p>}</div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Amenities</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">{[...new Set([...standardAmenities, ...hotel.amenities])].map(amenity => <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={hotel.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />{amenity}</label>)}</div>
        <div className="mt-4 flex gap-2"><input value={customAmenity} onChange={event => setCustomAmenity(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addCustomAmenity(); } }} placeholder="Add a custom amenity" className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500" /><button type="button" onClick={addCustomAmenity} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Plus size={15} /> Add</button></div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-gray-900">Rooms</h2><p className="mt-1 text-sm text-gray-500">Set capacity, facilities, pricing, and availability.</p></div><button type="button" onClick={() => update('rooms', [...hotel.rooms, blankRoom()])} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Plus size={16} /> Add room</button></div>
        {hotel.rooms.map((room, index) => <article key={room.id} className="rounded-lg border border-gray-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-900">Room {index + 1}</h3>{hotel.rooms.length > 1 && <button type="button" onClick={() => update('rooms', hotel.rooms.filter(item => item.id !== room.id))} aria-label={`Remove room ${index + 1}`} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>}</div><div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Room name / type<input required value={room.name} onChange={event => updateRoom(room.id, { name: event.target.value })} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Maximum guests<input required min="1" type="number" value={room.maxGuests} onChange={event => updateRoom(room.id, { maxGuests: Number(event.target.value) })} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Bed type<input value={room.bedType} onChange={event => updateRoom(room.id, { bedType: event.target.value })} placeholder="King, twin, bunk..." className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Price per night<input required min="0" step="0.01" type="number" value={room.price} onChange={event => updateRoom(room.id, { price: Number(event.target.value) })} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Availability<select value={room.availability} onChange={event => updateRoom(room.id, { availability: event.target.value as HotelRoom['availability'] })} className={fieldClass}><option>Available</option><option>Unavailable</option></select></label>
          <label className="text-sm font-medium text-gray-700">Facilities, comma separated<input value={room.facilities.join(', ')} onChange={event => updateRoom(room.id, { facilities: event.target.value.split(',').map(value => value.trim()).filter(Boolean) })} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Description<textarea rows={2} value={room.description} onChange={event => updateRoom(room.id, { description: event.target.value })} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Room images<input type="file" accept="image/*" multiple onChange={event => void addRoomImages(room.id, event)} className="mt-1.5 block w-full text-xs text-gray-600" /></label>
          {room.images.map(image => <div key={image.id} className="flex items-center gap-2 text-xs text-gray-500"><img src={image.src} alt={image.name} className="h-9 w-9 rounded object-cover" />{image.name}</div>)}
        </div></article>)}
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 sm:flex-row sm:items-end sm:justify-between">
        <label className="w-full max-w-xs text-sm font-medium text-gray-700">Listing status<select value={hotel.status} onChange={event => update('status', event.target.value as HotelListing['status'])} className={fieldClass}><option>Draft</option><option>Published</option><option>Unpublished</option></select><span className="mt-1 block text-xs font-normal text-gray-500">Only published hotels are available for booking.</span></label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save listing</button>
      </section>
    </form>
  );
}