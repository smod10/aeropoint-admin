import type { HotelListing } from '../types/hotel';

const HOTELS_KEY = 'aeropoint-hotel-listings';

export function readHotelListings(): HotelListing[] {
  return JSON.parse(localStorage.getItem(HOTELS_KEY) || '[]') as HotelListing[];
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