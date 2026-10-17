import type { Currency } from '../context/CurrencyContext';

export type HotelImage = { id: string; name: string; src: string };

// A rate option for one room: the same room can be sold on several board bases at different prices.
export type RoomOption = { id: string; board: string; price: number };

export type HotelRoom = {
  id: string;
  name: string;
  roomType: string;
  description: string;
  images: HotelImage[];
  maxGuests: number;
  bedType: string;
  facilities: string[];
  // Lowest option price, kept so booking and inventory screens can show a single "from" rate.
  price: number;
  options: RoomOption[];
  availableUnits?: number;
  availability: 'Available' | 'Unavailable';
};

// Admin-entered records are never live supplier inventory; 'demo' marks sample data.
export type HotelSource = 'manual' | 'import' | 'demo';

export type HotelListing = {
  id: string;
  name: string;
  // Sanitised HTML.
  description: string;
  translations: Record<string, { name: string; description: string }>;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  ownerId: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  // Accommodation type, one of the Accommodation settings in Stay Settings.
  category: string;
  stars: number;
  rating: number;
  discountPercent: number;
  currency: Currency;
  refundable: boolean;
  featured: boolean;
  checkInTime: string;
  checkOutTime: string;
  ageRequirement: number | null;
  cancellationPolicy: string;
  privacyPolicy: string;
  metaTitle: string;
  metaKeywords: string;
  amenities: string[];
  images: HotelImage[];
  featuredImageId: string;
  tripadvisorLocationId: string;
  rooms: HotelRoom[];
  status: 'Draft' | 'Published' | 'Unpublished';
  createdAt: string;
  source: HotelSource;
  importBatchId?: string;
  importedAt?: string;
};

export type StaySettingKind = 'stayAmenity' | 'roomType' | 'roomAmenity' | 'accommodation' | 'board';

export type StaySetting = {
  id: string;
  kind: StaySettingKind;
  name: string;
  active: boolean;
  // Creation order; lists show newest first, forms show oldest first.
  order: number;
};
