export type HotelImage = { id: string; name: string; src: string };

export type HotelRoom = {
  id: string;
  name: string;
  description: string;
  images: HotelImage[];
  maxGuests: number;
  bedType: string;
  facilities: string[];
  price: number;
  availability: 'Available' | 'Unavailable';
};

export type HotelListing = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  category: string;
  stars: number;
  amenities: string[];
  images: HotelImage[];
  featuredImageId: string;
  rooms: HotelRoom[];
  status: 'Draft' | 'Published' | 'Unpublished';
  createdAt: string;
};