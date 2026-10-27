# Shared Airline Deals Contract

This document defines an app-independent contract for exchanging airline deals, deal bookings, and normalized flight results. It has no imports or runtime dependency on either React app.

`Deal` below reflects the current admin `AirlineDeal` model. `DealBooking` and `NormalizedFlightResult` are proposed shared shapes: neither app currently defines these contracts end to end.

```ts
export type DealStatus = 'Draft' | 'Active' | 'Paused' | 'Expired';
export type DealTripType = 'One-way' | 'Return';
export type DealExceptionType = 'single-date' | 'date-range' | 'weekday-range';
export type PassengerType = 'adult' | 'child' | 'infant';
export type DealBookingStatus = 'Pending ticketing' | 'Ticketed' | 'Cannot ticket';

export interface DealFare {
  baseFare: number; // Fare amount before taxes, in the deal currency.
  taxes: number; // Tax and fee amount, in the deal currency.
}

export interface DealSegment {
  id: string; // Stable identifier for this segment within the journey.
  airline: string; // Marketing airline name.
  flightNumber: string; // Marketing flight number.
  operatingAirline: string; // Operating carrier, or empty when the marketing carrier operates it.
  origin: string; // Origin airport IATA code.
  destination: string; // Destination airport IATA code.
  departureTime: string; // Local departure time in HH:mm format at the origin airport.
  departureDayOffset: number; // Calendar days after the journey departure date.
  arrivalTime: string; // Local arrival time in HH:mm format at the destination airport.
  arrivalDayOffset: number; // Calendar days after the journey departure date.
  departureTerminal: string; // Departure terminal, or empty when not provided.
  arrivalTerminal: string; // Arrival terminal, or empty when not provided.
  cabin: string; // Cabin name for this segment.
  baggage: string; // Included baggage allowance for this segment.
}

export interface DealJourney {
  segments: DealSegment[]; // Ordered flight segments issued on one ticket.
}

export interface DealScheduleException {
  id: string; // Stable identifier for this exception.
  type: DealExceptionType; // Match rule: one date, continuous date range, or weekdays within a range.
  date: string; // YYYY-MM-DD date, used by single-date rules.
  startDate: string; // Inclusive YYYY-MM-DD start for range rules.
  endDate: string; // Inclusive YYYY-MM-DD end for range rules.
  daysOfWeek: number[]; // Weekday numbers 0-6 (Sunday-Saturday), used by weekday-range rules.
  seatsAvailable?: number; // Seat count override; omitted to inherit the deal default.
  adultPriceOverride?: number; // Adult total price override; omitted to inherit the default price.
  returnDayOffset?: number; // Return departure days after outbound; omitted to inherit the default.
  closed: boolean; // True when no sales are allowed on matching dates.
  note: string; // Optional admin note explaining the exception.
}

export interface DealSchedule {
  dateRangeStart: string; // Inclusive first YYYY-MM-DD date for default departures.
  dateRangeEnd: string; // Inclusive last YYYY-MM-DD date for default departures.
  daysOfWeek: number[]; // Weekday numbers 0-6 (Sunday-Saturday) that have default departures.
  returnDayOffset: number; // Default return departure days after outbound; positive whole number.
  defaultAdultPrice: number; // Default adult total price, in the deal currency.
  exceptions: DealScheduleException[]; // Sparse overrides; never expanded into stored per-day records.
}

export interface Deal {
  id: string; // Stable deal identifier.
  title: string; // Customer-facing deal title.
  description: string; // Short customer-facing description.
  airline: string; // Legacy/list summary airline, normally from the first outbound segment.
  cabin: string; // Legacy/list summary cabin, normally from the first outbound segment.
  tripType: DealTripType; // Whether the itinerary has an outbound only or outbound and return journey.
  routes: Array<{ origin: string; destination: string }>; // Legacy/list summary route sequence using airport codes.
  flightNumber: string; // Legacy/list summary flight number, normally from the first outbound segment.
  departureTime: string; // Legacy/list summary local departure time.
  arrivalTime: string; // Legacy/list summary local arrival time.
  stops: number; // Legacy/list summary stop count; calculate from outbound segments.
  baggage: string; // Legacy/list summary baggage allowance.
  travelStartDate: string; // Legacy/list summary first departure date.
  travelEndDate: string; // Legacy/list summary last departure date.
  fares: {
    adult: DealFare; // Default adult base fare and taxes.
    child: DealFare; // Default child base fare and taxes.
    infant: DealFare; // Default infant base fare and taxes.
  };
  currency: string; // ISO 4217 currency code for all deal prices.
  seatsAvailable: number; // Legacy/list summary default seats per departure.
  salesStartDate: string; // First date the deal can be purchased.
  salesEndDate: string; // Last date the deal can be purchased.
  bookingCutOffHours: number; // Minimum hours before departure that booking is allowed.
  image: string; // Customer-facing image URL or empty string.
  featured: boolean; // Whether the deal is eligible for featured placement.
  displayOrder: number; // Preferred ascending display order.
  internalNotes: string; // Admin-only notes; never display to customers.
  status: DealStatus; // Admin lifecycle state.
  outboundJourney?: DealJourney; // Outbound segments; optional only for legacy records.
  returnJourney?: DealJourney; // Return segments; present for return deals.
  minimumConnectionMinutes?: number; // Minimum layover validation setting; defaults to 60.
  schedule?: DealSchedule; // Defaults and sparse date exceptions; optional only for legacy records.
  createdAt: string; // ISO 8601 creation timestamp.
  updatedAt: string; // ISO 8601 last-update timestamp.
}

export interface DealBookingPassenger {
  type: PassengerType; // Passenger fare category.
  title?: string; // Optional passenger title.
  firstName: string; // Passenger first and middle names as supplied.
  lastName: string; // Passenger surname as supplied.
  dateOfBirth?: string; // Optional YYYY-MM-DD date.
}

export interface DealBooking {
  id: string; // Stable booking record identifier.
  bookingId: string; // Customer-facing booking reference.
  bookingType: 'flights'; // Existing admin booking category for flight bookings.
  dealId: string; // Deal identifier purchased.
  ticketingStatus: DealBookingStatus; // Ticketing outcome managed by the admin.
  customerId: number | null; // Existing admin customer ID, or null for a guest.
  customerName: string; // Booking contact name.
  customerEmail: string; // Booking contact email.
  customerPhone: string; // Booking contact phone.
  guestBooking: boolean; // Whether checkout was completed without a customer account.
  passengers: DealBookingPassenger[]; // Travelers covered by this booking.
  departureDate: string; // Selected outbound departure date in YYYY-MM-DD format.
  returnDate?: string; // Selected return departure date for return trips.
  tripType: DealTripType; // One-way or return.
  outboundJourney: DealJourney; // Journey snapshot purchased by the customer.
  returnJourney?: DealJourney; // Return journey snapshot for return trips.
  currency: string; // ISO 4217 currency code.
  amount: number; // Total booking price due.
  amountPaid: number; // Amount successfully paid and recorded.
  bookingStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'; // Existing admin booking lifecycle state.
  paymentStatus: 'Pending' | 'Paid' | 'Refunded'; // Payment state, separate from ticketing state.
  bookingReference: string | null; // Airline PNR or supplier booking reference, when ticketed.
  ticketNumbers: string[]; // Issued e-ticket numbers; empty until ticketed.
  eTicketUrl: string | null; // E-ticket document URL, when uploaded.
  ticketingDeadline: string; // ISO 8601 timestamp by which ticketing must be completed.
  cannotTicketReason?: string; // Admin explanation when status is Cannot ticket.
  createdAt: string; // ISO 8601 booking creation timestamp.
  updatedAt: string; // ISO 8601 last-update timestamp.
}

export interface NormalizedFlightResult {
  id: number; // Numeric result identifier used as the React list key.
  airline: string; // Airline name displayed on the result card.
  flightNumber: string; // Primary flight number displayed on the result card.
  departureTime: string; // Display-ready local departure time.
  arrivalTime: string; // Display-ready local arrival time.
  departureAirport: string; // Departure airport code or label.
  arrivalAirport: string; // Arrival airport code or label.
  duration: string; // Display-ready total elapsed journey duration; calculated from segments.
  stops: number; // Number of connections; calculated as segment count minus one.
  price: string; // Display-ready customer price, including its currency symbol.
  baggage?: string; // Optional baggage summary sourced from deal segments; omit when no allowance is supplied.
  isCheapest?: boolean; // Optional marker used for the existing cheapest-result styling.
  layovers?: Array<{
    airport: string; // Connection airport code or label.
    country?: string; // Optional country shown by the existing card.
    duration: string; // Display-ready layover duration; calculated from adjacent segments.
  }>;
}
```

## Notes

- Times are local to the airport identified by the segment endpoint. Day offsets are relative to that journey's departure date.
- `Deal.routes`, the top-level flight fields, and top-level `seatsAvailable` are existing admin list-compatibility summaries. `outboundJourney` and `schedule` are the detailed values; new consumers should prefer those.
- Exception precedence is single date, date range, weekday range, then defaults. A closed exception removes that departure from customer search.
- `NormalizedFlightResult` matches the existing customer search-result data shape. Its `stops`, total `duration`, and optional `layovers` are calculated from the deal's segments and airport time zones. The React `onBookNow` callback is UI behavior and is not part of the data contract.
- The customer card's existing data shape has no deal badge field. Deal-specific presentation metadata, such as a `Special offer` label, must be supplied separately by the adapter/UI rather than changing this base result contract.
- `DealBooking` is a proposed contract, not an existing admin type. The current admin has a generic `ManagedBooking` with free-form `details`; it does not yet model deal ticketing fields or the three deal ticketing statuses.