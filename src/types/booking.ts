export type BookingType = 'flights' | 'stays' | 'tours' | 'visa' | 'umrah';

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
  createdAt: string;
  details: Record<string, string>;
};