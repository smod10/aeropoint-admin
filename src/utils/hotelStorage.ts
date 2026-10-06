import type { HotelListing } from '../types/hotel';

const HOTELS_KEY = 'aeropoint-hotel-listings';
const SAMPLE_SEED_KEY = 'aeropoint-hotel-listings-seeded';

const sampleHotels: HotelListing[] = [
  {
    id: 'sample-lagos-waterfront', name: 'Lagos Waterfront Hotel', description: 'A contemporary waterfront stay with dining and meeting facilities.',
    address: '14 Victoria Island Way', city: 'Lagos', country: 'Nigeria', contactName: 'Reservations', contactEmail: 'stay@example.com',
    contactPhone: '+234 800 100 2000', category: 'Hotel', stars: 4, amenities: ['Wi-Fi', 'Restaurant', 'Airport Transfer', 'Swimming Pool'],
    images: [{ id: 'sample-lagos-image', name: 'Lagos Waterfront', src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' }],
    featuredImageId: 'sample-lagos-image', status: 'Published', createdAt: '2026-05-12T10:00:00.000Z',
    rooms: [
      { id: 'sample-lagos-deluxe', name: 'Deluxe King', description: 'City and lagoon views with a king bed.', images: [], maxGuests: 2, bedType: 'King', facilities: ['Wi-Fi', 'Air Conditioning', 'Breakfast'], price: 145000, availableUnits: 8, availability: 'Available' },
      { id: 'sample-lagos-suite', name: 'Executive Suite', description: 'Separate lounge and private balcony.', images: [], maxGuests: 3, bedType: 'King + sofa bed', facilities: ['Wi-Fi', 'Room Service', 'Breakfast'], price: 225000, availableUnits: 3, availability: 'Available' },
    ],
  },
  {
    id: 'sample-abuja-garden', name: 'Abuja Garden Suites', description: 'Quiet garden property near the city centre.',
    address: '8 Jabi Lake Road', city: 'Abuja', country: 'Nigeria', contactName: 'Guest Services', contactEmail: 'hello@example.com',
    contactPhone: '+234 800 300 4000', category: 'Resort', stars: 5, amenities: ['Wi-Fi', 'Gym', 'Restaurant', 'Parking', 'Room Service'],
    images: [{ id: 'sample-abuja-image', name: 'Abuja Garden Suites', src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' }],
    featuredImageId: 'sample-abuja-image', status: 'Published', createdAt: '2026-06-03T09:30:00.000Z',
    rooms: [
      { id: 'sample-abuja-standard', name: 'Garden Standard', description: 'Garden-side room with a queen bed.', images: [], maxGuests: 2, bedType: 'Queen', facilities: ['Wi-Fi', 'Air Conditioning'], price: 98000, availableUnits: 12, availability: 'Available' },
      { id: 'sample-abuja-family', name: 'Family Apartment', description: 'Two bedrooms with a kitchenette.', images: [], maxGuests: 5, bedType: 'Twin + Queen', facilities: ['Wi-Fi', 'Kitchen', 'Parking'], price: 185000, availableUnits: 0, availability: 'Unavailable' },
    ],
  },
  {
    id: 'sample-dubai-marina', name: 'Dubai Marina View', description: 'A draft property listing ready for review.',
    address: '22 Marina Promenade', city: 'Dubai', country: 'United Arab Emirates', contactName: 'Property Manager', contactEmail: '',
    contactPhone: '', category: 'Apartment', stars: 4, amenities: ['Wi-Fi', 'Swimming Pool', 'Gym'],
    images: [{ id: 'sample-dubai-image', name: 'Dubai Marina View', src: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' }],
    featuredImageId: 'sample-dubai-image', status: 'Draft', createdAt: '2026-08-19T12:00:00.000Z',
    rooms: [{ id: 'sample-dubai-one-bedroom', name: 'One Bedroom Marina Suite', description: 'Bright one-bedroom apartment.', images: [], maxGuests: 2, bedType: 'King', facilities: ['Wi-Fi', 'Gym'], price: 520, availableUnits: 5, availability: 'Available' }],
  },
];

export function readHotelListings(): HotelListing[] {
  const stored = JSON.parse(localStorage.getItem(HOTELS_KEY) || '[]') as HotelListing[];
  if (localStorage.getItem(SAMPLE_SEED_KEY) !== 'true') {
    const existingIds = new Set(stored.map(hotel => hotel.id));
    const seeded = [...stored, ...sampleHotels.filter(hotel => !existingIds.has(hotel.id))];
    localStorage.setItem(HOTELS_KEY, JSON.stringify(seeded));
    localStorage.setItem(SAMPLE_SEED_KEY, 'true');
    return seeded;
  }
  return stored;
}

export function saveHotelListing(hotel: HotelListing): void {
  const hotels = readHotelListings();
  const index = hotels.findIndex(item => item.id === hotel.id);
  if (index === -1) hotels.unshift(hotel);
  else hotels[index] = hotel;
  localStorage.setItem(HOTELS_KEY, JSON.stringify(hotels));
}

export function deleteHotelListing(id: string): void {
  localStorage.setItem(HOTELS_KEY, JSON.stringify(readHotelListings().filter(hotel => hotel.id !== id)));
}