import type { ManagedBooking } from '../types/booking';

const BOOKINGS_KEY = 'aeropoint-managed-bookings';

export function readManagedBookings(): ManagedBooking[] {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]') as ManagedBooking[];
}

export function saveManagedBooking(booking: ManagedBooking): void {
  const bookings = readManagedBookings();
  const existingIndex = bookings.findIndex(item => item.bookingId === booking.bookingId);
  if (existingIndex === -1) bookings.unshift(booking);
  else bookings[existingIndex] = booking;
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function findManagedBooking(bookingId: string): ManagedBooking | undefined {
  return readManagedBookings().find(booking => booking.bookingId === bookingId);
}

export function updateManagedBooking(bookingId: string, updates: Partial<ManagedBooking>): ManagedBooking | undefined {
  const booking = findManagedBooking(bookingId);
  if (!booking) return undefined;
  const updatedBooking = { ...booking, ...updates };
  saveManagedBooking(updatedBooking);
  return updatedBooking;
}