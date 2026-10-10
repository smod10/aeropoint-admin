import { MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { readHotelListings } from '../../utils/hotelStorage';
import { useCurrency } from '../../context/CurrencyContext';

export default function PublicHotels() {
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency();
  const publishedHotels = readHotelListings().filter(hotel => hotel.status === 'Published');

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between"><a href="/" className="text-lg font-bold text-primary-700">Aeropoint Express</a><span className="text-sm text-gray-500">Stays</span></div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-10">
        <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Find your stay</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Stays</h1><p className="mt-2 text-sm text-gray-500">Explore published Aeropoint properties and available rooms.</p></div>
        {publishedHotels.length === 0 ? <div className="border-y border-gray-200 py-16 text-center"><h2 className="text-lg font-semibold text-gray-900">No stays are currently available</h2><p className="mt-2 text-sm text-gray-500">Please check back soon.</p></div> : <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {publishedHotels.map(hotel => {
            const image = hotel.images.find(item => item.id === hotel.featuredImageId) ?? hotel.images[0];
            const availableRooms = hotel.rooms.filter(room => room.availability === 'Available');
            return <article key={hotel.id} className="overflow-hidden border-b border-gray-200 pb-6">
              {image ? <img src={image.src} alt={hotel.name} className="aspect-[4/3] w-full rounded-lg object-cover" /> : <div className="aspect-[4/3] rounded-lg bg-gray-100" />}
              <div className="pt-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-gray-900">{hotel.name}</h2><p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin size={14} />{hotel.city}, {hotel.country}</p></div><span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-amber-700"><Star size={15} fill="currentColor" />{hotel.stars}</span></div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">{hotel.category === 'Hotel' ? 'Stay' : hotel.category}</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{hotel.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">{hotel.amenities.map(amenity => <span key={amenity} className="border-b border-gray-200 px-1 py-1 text-xs text-gray-600">{amenity}</span>)}</div>
                <div className="mt-5 border-t border-gray-200 pt-4"><h3 className="text-sm font-semibold text-gray-900">Available rooms</h3>{availableRooms.length ? <div className="mt-2 space-y-2">{availableRooms.map(room => <div key={room.id} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0"><span className="block truncate font-medium text-gray-800">{room.name}</span><span className="text-xs text-gray-500">Up to {room.maxGuests} guests · {room.bedType}</span></span><span className="shrink-0 text-right"><span className="block font-semibold text-gray-900">{convertAndFormat(room.price)}</span><span className="text-xs text-gray-500">per night</span></span></div>)}</div> : <p className="mt-2 text-sm text-gray-500">No rooms available.</p>}
                  <button disabled={!availableRooms.length} onClick={() => navigate(`/bookings/create/stays?hotel=${encodeURIComponent(hotel.name)}`)} className="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">Book this stay</button>
                </div>
              </div>
            </article>;
          })}
        </div>}
      </div>
    </main>
  );
}