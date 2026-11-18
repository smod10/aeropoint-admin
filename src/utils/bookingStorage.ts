import type { DealTicketingStatus, ETicketFile, ManagedBooking } from '../types/booking';
import { getCurrentAccountId, getCurrentActorRole } from './accountAccess';

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

export function updateDealTicketing(
  bookingId: string,
  update: {
    status: DealTicketingStatus;
    bookingReference: string;
    ticketNumbers: string[];
    eTicketFiles: ETicketFile[];
    cannotTicketReason: string;
  },
): ManagedBooking {
  const booking = findManagedBooking(bookingId);
  if (!booking || booking.bookingType !== 'flights' || !(booking.dealId || booking.details.airlineDealId)) {
    throw new Error('This is not a deal booking.');
  }

  const passengerCount = Math.max(booking.passengers?.length ?? 0, booking.passengerCount ?? (Number(booking.details.passengerCount) || 0));
  if (update.status === 'Ticketed') {
    if (!update.bookingReference.trim()) throw new Error('Enter the airline booking reference (PNR).');
    if (passengerCount < 1) throw new Error('Add the passenger count before ticketing this booking.');
    const tickets = update.ticketNumbers.slice(0, passengerCount);
    if (tickets.length !== passengerCount || tickets.some(ticket => !ticket.trim())) {
      throw new Error(`Enter one ticket number for each of the ${passengerCount} passengers.`);
    }
  }
  if (update.status === 'Cannot ticket' && !update.cannotTicketReason.trim()) {
    throw new Error('Enter a reason before marking this booking Cannot ticket.');
  }

  const previousStatus = booking.ticketingStatus ?? 'Pending ticketing';
  const now = new Date().toISOString();
  const actor = `${getCurrentActorRole().replaceAll('_', ' ')} (account ${getCurrentAccountId()})`;
  const updatedBooking: ManagedBooking = {
    ...booking,
    ticketingStatus: update.status,
    bookingReference: update.bookingReference.trim(),
    ticketNumbers: update.ticketNumbers.slice(0, passengerCount).map(ticket => ticket.trim()),
    eTicketFiles: update.eTicketFiles,
    ticketedBy: update.status === 'Ticketed' ? booking.ticketedBy ?? actor : booking.ticketedBy,
    ticketedAt: update.status === 'Ticketed' ? booking.ticketedAt ?? now : booking.ticketedAt,
    cannotTicketReason: update.status === 'Cannot ticket' ? update.cannotTicketReason.trim() : '',
    ticketingActivity: previousStatus === update.status
      ? booking.ticketingActivity ?? []
      : [...(booking.ticketingActivity ?? []), { fromStatus: previousStatus, toStatus: update.status, actor, at: now }],
  };
  saveManagedBooking(updatedBooking);
  return updatedBooking;
}