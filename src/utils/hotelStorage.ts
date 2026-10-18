import type { Currency } from '../context/CurrencyContext';
import type { HotelListing, HotelRoom } from '../types/hotel';
import { findDestination } from '../data/destinations';
import { plainTextToHtml } from './richText';

const HOTELS_KEY = 'aeropoint-hotel-listings';
const SEED_KEY = 'aeropoint-hotel-listings-seeded-v2';
const LEGACY_SEED_KEY = 'aeropoint-hotel-listings-seeded';

export const supportedCurrencies: Currency[] = ['NGN', 'USD', 'GBP', 'EUR', 'CAD'];

type StoredRoom = Partial<HotelRoom> & { id: string; name: string };
type StoredHotel = Partial<Omit<HotelListing, 'rooms'>> & { id: string; name: string; rooms?: StoredRoom[] };

// Names used before amenities were managed in Stay Settings.
const amenitySynonyms: Record<string, string> = { 'wi-fi': 'Free WiFi', wifi: 'Free WiFi', gym: 'Gym/Fitness Center', 'airport transfer': 'Airport Shuttle' };
const canonicalAmenity = (name: string) => amenitySynonyms[name.trim().toLowerCase()] ?? name;

function normalizeRoom(room: StoredRoom): HotelRoom {
  const options = room.options?.length ? room.options : [{ id: `${room.id}-option-1`, board: 'Room Only', price: room.price ?? 0 }];
  return {
    id: room.id,
    name: room.name || room.roomType || '',
    roomType: room.roomType || room.name || '',
    description: room.description ?? '',
    images: room.images ?? [],
    maxGuests: room.maxGuests ?? 2,
    bedType: room.bedType ?? '',
    facilities: room.facilities ?? [],
    breakfastIncluded: room.breakfastIncluded ?? false,
    freeCancellation: room.freeCancellation ?? false,
    refundable: room.refundable ?? false,
    active: room.active ?? true,
    options,
    price: Math.min(...options.map(option => option.price)),
    availableUnits: room.availableUnits ?? 0,
    availability: room.availability ?? 'Available',
  };
}

// Fills every field added after the first release so older saved records keep working.
function normalizeHotel(raw: StoredHotel): HotelListing {
  const destination = findDestination(raw.city ?? '');
  const currency = raw.currency && supportedCurrencies.includes(raw.currency) ? raw.currency : raw.id === 'sample-dubai-marina' ? 'USD' : 'NGN';
  return {
    id: raw.id,
    name: raw.name,
    description: plainTextToHtml(raw.description ?? ''),
    translations: raw.translations ?? {},
    address: raw.address ?? '',
    city: raw.city ?? '',
    country: raw.country ?? destination?.country ?? '',
    latitude: raw.latitude ?? destination?.latitude,
    longitude: raw.longitude ?? destination?.longitude,
    ownerId: raw.ownerId ?? null,
    contactName: raw.contactName ?? '',
    contactEmail: raw.contactEmail ?? '',
    contactPhone: raw.contactPhone ?? '',
    website: raw.website ?? '',
    category: raw.category === 'Stay' ? 'Hotel' : raw.category || 'Hotel',
    stars: raw.stars ?? 3,
    rating: raw.rating ?? 0,
    discountPercent: raw.discountPercent ?? 0,
    currency,
    refundable: raw.refundable ?? false,
    featured: raw.featured ?? false,
    checkInTime: raw.checkInTime ?? '15:00',
    checkOutTime: raw.checkOutTime ?? '11:00',
    ageRequirement: raw.ageRequirement ?? null,
    cancellationPolicy: raw.cancellationPolicy ?? '',
    privacyPolicy: raw.privacyPolicy ?? '',
    metaTitle: raw.metaTitle ?? '',
    metaKeywords: raw.metaKeywords ?? '',
    amenities: Array.from(new Set((raw.amenities ?? []).map(canonicalAmenity))),
    images: raw.images ?? [],
    featuredImageId: raw.featuredImageId ?? '',
    tripadvisorLocationId: raw.tripadvisorLocationId ?? '',
    rooms: (raw.rooms ?? []).map(normalizeRoom),
    status: raw.status ?? 'Draft',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    source: raw.source ?? (raw.id.startsWith('sample-') || raw.id.startsWith('demo-') ? 'demo' : 'manual'),
    importBatchId: raw.importBatchId,
    importedAt: raw.importedAt,
  };
}

export function hotelDuplicateKey(hotel: Pick<HotelListing, 'name' | 'city'>): string {
  return `${hotel.name.trim().toLowerCase()}|${hotel.city.trim().toLowerCase()}`;
}

// Demonstration rooms: two board options per room, with illustrative rates that are not supplier prices.
function demoRoom(hotelSlug: string, slug: string, name: string, roomType: string, bedType: string, maxGuests: number, price: number, facilities: string[], availableUnits: number): HotelRoom {
  const id = `demo-${hotelSlug}-${slug}`;
  return {
    id, name, roomType, description: '', images: [], maxGuests, bedType, facilities, breakfastIncluded: false, freeCancellation: false, refundable: false, active: true, price, availableUnits, availability: 'Available',
    options: [{ id: `${id}-room-only`, board: 'Room Only', price }, { id: `${id}-bed-breakfast`, board: 'Bed & Breakfast', price: Math.round(price * 1.15) }],
  };
}

function demoHotel(slug: string, name: string, category: string, city: string, stars: number, rating: number, featured: boolean, amenities: string[], rooms: HotelRoom[], overrides: Partial<HotelListing> = {}): HotelListing {
  return normalizeHotel({
    id: `demo-${slug}`,
    name,
    category,
    city,
    stars,
    rating,
    featured,
    amenities,
    rooms,
    currency: 'USD',
    description: `<p>Demonstration record used to test Stay Management. Details, rates and availability are sample values, not supplier data.</p>`,
    address: `${city} (demo address)`,
    status: 'Published',
    createdAt: '2026-10-17T09:00:00.000Z',
    source: 'demo',
    ...overrides,
  });
}

const rr = ['Air Conditioning', 'Flat-screen TV', 'Private Bathroom'];
const resortAmenities = ['Free WiFi', 'Swimming Pool', 'Restaurant', 'Spa', 'Bar/Lounge'];

const demoHotels: HotelListing[] = [
  demoHotel('marina-bay-apartments', 'Marina Bay Apartments', 'Apartment', 'Dubai', 4, 8.4, false, ['Free WiFi', 'Swimming Pool'],
    [demoRoom('marina-bay-apartments', 'family-room', 'Family Room', 'Family Room', 'Twin + Queen', 5, 240, ['Air Conditioning', 'Flat-screen TV'], 6)],
    { description: '<p>Serviced apartments with kitchen and marina views.</p>', address: 'Dubai Marina', contactEmail: 'stay@marinabay.example', contactPhone: '+971 4 111 1111', ageRequirement: 21, cancellationPolicy: 'Non-refundable rates cannot be cancelled.' }),
  demoHotel('grand-palm-hotel', 'Grand Palm Hotel', 'Hotel', 'Dubai', 5, 9.1, true, ['Free WiFi', 'Swimming Pool', 'Restaurant', 'Gym/Fitness Center', '24-Hour Front Desk'],
    [demoRoom('grand-palm-hotel', 'deluxe', 'Deluxe Room', 'Deluxe Room', 'King', 2, 320, rr, 14), demoRoom('grand-palm-hotel', 'suite', 'Palm Suite', 'Suite', 'King + sofa bed', 3, 640, rr, 4)]),
  demoHotel('velaa-private-island', 'Velaa Private Island', 'Resort', 'Maldives', 5, 1, true, resortAmenities,
    [demoRoom('velaa-private-island', 'deluxe', 'Beach Deluxe', 'Deluxe Room', 'King', 2, 1800, rr, 6), demoRoom('velaa-private-island', 'suite', 'Overwater Suite', 'Suite', 'King', 3, 3200, rr, 3)]),
  demoHotel('taj-exotica-maldives', 'Taj Exotica Maldives', 'Resort', 'Maldives', 5, 1, true, resortAmenities,
    [demoRoom('taj-exotica-maldives', 'deluxe', 'Lagoon Deluxe', 'Deluxe Room', 'King', 2, 900, rr, 8), demoRoom('taj-exotica-maldives', 'suite', 'Overwater Suite', 'Suite', 'King', 3, 1500, rr, 4)]),
  demoHotel('lily-beach-resort', 'Lily Beach Resort', 'Resort', 'Maldives', 5, 4.6, true, resortAmenities,
    [demoRoom('lily-beach-resort', 'deluxe', 'Beach Deluxe', 'Deluxe Room', 'King', 2, 650, rr, 10), demoRoom('lily-beach-resort', 'suite', 'Water Suite', 'Suite', 'King', 3, 980, rr, 5)]),
  demoHotel('gili-lankanfushi', 'Gili Lankanfushi', 'Resort', 'Maldives', 5, 4.85, true, resortAmenities,
    [demoRoom('gili-lankanfushi', 'deluxe', 'Villa Deluxe', 'Deluxe Room', 'King', 2, 1200, rr, 6), demoRoom('gili-lankanfushi', 'suite', 'Crusoe Suite', 'Suite', 'King', 4, 2100, rr, 2)]),
  demoHotel('anantara-veli-resort', 'Anantara Veli Resort', 'Resort', 'Maldives', 5, 4.55, true, resortAmenities,
    [demoRoom('anantara-veli-resort', 'deluxe', 'Beach Deluxe', 'Deluxe Room', 'King', 2, 780, rr, 9), demoRoom('anantara-veli-resort', 'suite', 'Overwater Suite', 'Suite', 'King', 3, 1250, rr, 4)]),
  demoHotel('baros-maldives', 'Baros Maldives', 'Resort', 'Maldives', 5, 4.7, true, resortAmenities,
    [demoRoom('baros-maldives', 'deluxe', 'Deluxe Villa', 'Deluxe Room', 'King', 2, 850, rr, 9), demoRoom('baros-maldives', 'suite', 'Water Suite', 'Suite', 'King', 3, 1400, rr, 3)]),
  demoHotel('conrad-maldives', 'Conrad Maldives', 'Resort', 'Gan Island', 5, 1, true, resortAmenities,
    [demoRoom('conrad-maldives', 'deluxe', 'Deluxe Room', 'Deluxe Room', 'King', 2, 700, rr, 12), demoRoom('conrad-maldives', 'suite', 'Villa Suite', 'Suite', 'King', 3, 1100, rr, 4)]),
  demoHotel('soneva-fushi', 'Soneva Fushi', 'Resort', 'Maldives', 5, 4.95, true, resortAmenities,
    [demoRoom('soneva-fushi', 'deluxe', 'Beach Villa', 'Deluxe Room', 'King', 2, 1500, rr, 7), demoRoom('soneva-fushi', 'suite', 'Family Suite', 'Family Room', 'King + twin', 5, 2600, rr, 3)]),
  demoHotel('conrad-tokyo', 'Conrad Tokyo', 'Hotel', 'Tokyo', 5, 4.6, true, ['Free WiFi', 'Restaurant', 'Gym/Fitness Center', 'Spa', '24-Hour Front Desk', 'Bar/Lounge'],
    [demoRoom('conrad-tokyo', 'deluxe', 'Deluxe Room', 'Deluxe Room', 'King', 2, 450, rr, 20), demoRoom('conrad-tokyo', 'suite', 'Executive Suite', 'Suite', 'King', 3, 820, rr, 6)]),
  demoHotel('shangri-la-tokyo', 'Shangri-La Tokyo', 'Hotel', 'Tokyo', 5, 4.65, true, ['Free WiFi', 'Restaurant', 'Gym/Fitness Center', 'Spa', '24-Hour Front Desk', 'Bar/Lounge'],
    [demoRoom('shangri-la-tokyo', 'deluxe', 'Deluxe Room', 'Deluxe Room', 'King', 2, 480, rr, 18), demoRoom('shangri-la-tokyo', 'suite', 'Premier Suite', 'Suite', 'King', 3, 900, rr, 5)]),
];

// Records seeded before this module changed; kept so existing demo bookings and links still resolve.
const legacySamples: StoredHotel[] = [
  {
    id: 'sample-lagos-waterfront', name: 'Lagos Waterfront Hotel', description: 'A contemporary waterfront stay with dining and meeting facilities.',
    address: '14 Victoria Island Way', city: 'Lagos', country: 'Nigeria', contactName: 'Reservations', contactEmail: 'stay@example.com',
    contactPhone: '+234 800 100 2000', category: 'Hotel', stars: 4, amenities: ['Free WiFi', 'Restaurant', 'Airport Shuttle', 'Swimming Pool'],
    images: [{ id: 'sample-lagos-image', name: 'Lagos Waterfront', src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' }],
    featuredImageId: 'sample-lagos-image', status: 'Published', createdAt: '2026-05-12T10:00:00.000Z',
    rooms: [
      { id: 'sample-lagos-deluxe', name: 'Deluxe King', roomType: 'Deluxe Room', description: 'City and lagoon views with a king bed.', images: [], maxGuests: 2, bedType: 'King', facilities: ['Air Conditioning', 'Flat-screen TV'], price: 145000, availableUnits: 8, availability: 'Available' },
      { id: 'sample-lagos-suite', name: 'Executive Suite', roomType: 'Suite', description: 'Separate lounge and private balcony.', images: [], maxGuests: 3, bedType: 'King + sofa bed', facilities: ['Air Conditioning', 'Balcony'], price: 225000, availableUnits: 3, availability: 'Available' },
    ],
  },
  {
    id: 'sample-abuja-garden', name: 'Abuja Garden Suites', description: 'Quiet garden property near the city centre.',
    address: '8 Jabi Lake Road', city: 'Abuja', country: 'Nigeria', contactName: 'Guest Services', contactEmail: 'hello@example.com',
    contactPhone: '+234 800 300 4000', category: 'Resort', stars: 5, amenities: ['Free WiFi', 'Gym/Fitness Center', 'Restaurant', 'Parking'],
    images: [{ id: 'sample-abuja-image', name: 'Abuja Garden Suites', src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80' }],
    featuredImageId: 'sample-abuja-image', status: 'Published', createdAt: '2026-06-03T09:30:00.000Z',
    rooms: [
      { id: 'sample-abuja-standard', name: 'Garden Standard', roomType: 'Queen Room', description: 'Garden-side room with a queen bed.', images: [], maxGuests: 2, bedType: 'Queen', facilities: ['Air Conditioning'], price: 98000, availableUnits: 12, availability: 'Available' },
      { id: 'sample-abuja-family', name: 'Family Apartment', roomType: 'Family Room', description: 'Two bedrooms with a kitchenette.', images: [], maxGuests: 5, bedType: 'Twin + Queen', facilities: ['Air Conditioning'], price: 185000, availableUnits: 0, availability: 'Unavailable' },
    ],
  },
  {
    id: 'sample-dubai-marina', name: 'Dubai Marina View', description: 'A draft property listing ready for review.',
    address: '22 Marina Promenade', city: 'Dubai', country: 'United Arab Emirates', contactName: 'Property Manager', contactEmail: '',
    contactPhone: '', category: 'Apartment', stars: 4, amenities: ['Free WiFi', 'Swimming Pool', 'Gym/Fitness Center'], currency: 'USD',
    images: [{ id: 'sample-dubai-image', name: 'Dubai Marina View', src: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' }],
    featuredImageId: 'sample-dubai-image', status: 'Draft', createdAt: '2026-08-19T12:00:00.000Z',
    rooms: [{ id: 'sample-dubai-one-bedroom', name: 'One Bedroom Marina Suite', roomType: 'Suite', description: 'Bright one-bedroom apartment.', images: [], maxGuests: 2, bedType: 'King', facilities: ['Air Conditioning'], price: 520, availableUnits: 5, availability: 'Available' }],
  },
];

export function createBlankRoom(): HotelRoom {
  const id = crypto.randomUUID();
  return { id, name: '', roomType: '', description: '', images: [], maxGuests: 2, bedType: '', facilities: [], breakfastIncluded: false, freeCancellation: false, refundable: false, active: true, price: 0, options: [{ id: crypto.randomUUID(), board: 'Room Only', price: 0 }], availableUnits: 0, availability: 'Available' };
}

export function createBlankHotel(): HotelListing {
  return normalizeHotel({ id: crypto.randomUUID(), name: '', category: 'Hotel', currency: 'NGN', status: 'Draft', createdAt: new Date().toISOString(), source: 'manual', rooms: [] });
}

export function hotelSourceLabel(hotel: Pick<HotelListing, 'source' | 'importBatchId'>): string {
  if (hotel.source === 'demo') return 'Demo data · not live inventory';
  if (hotel.source === 'import') return `Imported${hotel.importBatchId ? ` · ${hotel.importBatchId}` : ''}`;
  return 'Created manually';
}

export function readHotelListings(): HotelListing[] {
  let stored: StoredHotel[];
  try {
    stored = JSON.parse(localStorage.getItem(HOTELS_KEY) || '[]') as StoredHotel[];
  } catch {
    stored = [];
  }
  const hotels = stored.map(normalizeHotel);
  if (localStorage.getItem(SEED_KEY) === 'true') return hotels;

  // Seed once, skipping any demo record that matches an existing id or name and location.
  const includeLegacy = localStorage.getItem(LEGACY_SEED_KEY) !== 'true';
  const ids = new Set(hotels.map(hotel => hotel.id));
  const keys = new Set(hotels.map(hotelDuplicateKey));
  const seeded = [...demoHotels, ...(includeLegacy ? legacySamples.map(normalizeHotel) : [])].filter(hotel => {
    if (ids.has(hotel.id) || keys.has(hotelDuplicateKey(hotel))) return false;
    ids.add(hotel.id);
    keys.add(hotelDuplicateKey(hotel));
    return true;
  });
  const all = [...hotels, ...seeded];
  writeHotelListings(all);
  localStorage.setItem(SEED_KEY, 'true');
  return all;
}

export function writeHotelListings(hotels: HotelListing[]): void {
  localStorage.setItem(HOTELS_KEY, JSON.stringify(hotels));
}

export function saveHotelListing(hotel: HotelListing): void {
  const hotels = readHotelListings();
  const index = hotels.findIndex(item => item.id === hotel.id);
  if (index === -1) hotels.unshift(hotel);
  else hotels[index] = hotel;
  writeHotelListings(hotels);
}

export function deleteHotelListings(ids: string[]): void {
  const removed = new Set(ids);
  writeHotelListings(readHotelListings().filter(hotel => !removed.has(hotel.id)));
}

export function deleteHotelListing(id: string): void {
  deleteHotelListings([id]);
}
