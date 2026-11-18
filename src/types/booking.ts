export type BookingType = 'flights' | 'hotels' | 'tours' | 'visa' | 'umrah';
export type DealTicketingStatus = 'Pending ticketing' | 'Ticketed' | 'Cannot ticket';
export type DealBookingPassenger = {
  type?: 'adult' | 'child' | 'infant';
  firstName?: string;
  lastName?: string;
};
export type ETicketFile = { name: string; mimeType: string; dataUrl: string };
export type TicketingActivity = {
  fromStatus: DealTicketingStatus;
  toStatus: DealTicketingStatus;
  actor: string;
  at: string;
};

export type ManagedBooking = {
  id: string;
  bookingType: BookingType;
  bookingId: string;
  customerId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestBooking: boolean;
  amount: number;
  currency: string;
  bookingStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  dealId?: string;
  passengers?: DealBookingPassenger[];
  passengerCount?: number;
  ticketingStatus?: DealTicketingStatus;
  bookingReference?: string;
  ticketNumbers?: string[];
  eTicketFiles?: ETicketFile[];
  ticketingDeadline?: string;
  ticketedBy?: string;
  ticketedAt?: string;
  cannotTicketReason?: string;
  ticketingActivity?: TicketingActivity[];
  createdAt: string;
  details: Record<string, string>;
};