import airportTimeZones from 'airport-timezone';
import { getAvailableAirlines } from '../data/airlines';
import { getAvailableAirports } from '../data/airports';
import { readManagedBookings } from '../utils/bookingStorage';

export type DealStatus = 'Draft' | 'Active' | 'Paused' | 'Expired';
export type DealTripType = 'One-way' | 'Return';
export type DealFare = { baseFare?: number; taxes?: number };
export type DealBaggageAllowance = { included: boolean; pieces?: number; weightKg?: number };
export type DealFareConditionType = 'yes' | 'no' | 'with-fee';
export type DealFareConditions = {
  refundable?: DealFareConditionType;
  refundFee?: number;
  changesAllowed?: DealFareConditionType;
  changeFee?: number;
  notes?: string;
};
export type DealRoute = { origin: string; destination: string };
export type DealSegment = {
  id: string;
  airline: string;
  flightNumber: string;
  operatingAirline: string;
  origin: string;
  destination: string;
  departureTime: string;
  departureDayOffset: number;
  arrivalTime: string;
  arrivalDayOffset: number;
  departureTerminal: string;
  arrivalTerminal: string;
  aircraft?: string;
  cabin: string;
  cabinBaggage?: DealBaggageAllowance;
  checkedBaggage?: DealBaggageAllowance;
  baggage: string;
};
export type DealJourney = { segments: DealSegment[] };
export type DealExceptionType = 'single-date' | 'date-range' | 'weekday-range';
export type DealScheduleException = {
  id: string;
  type: DealExceptionType;
  date: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  seatsAvailable?: number;
  adultPriceOverride?: number;
  returnDayOffset?: number;
  closed: boolean;
  note: string;
};
export type DealSchedule = {
  dateRangeStart: string;
  dateRangeEnd: string;
  daysOfWeek: number[];
  returnDayOffset: number;
  defaultAdultPrice: number;
  exceptions: DealScheduleException[];
};
export type DealDeparture = {
  date: string;
  seatsAvailable: number;
  returnDayOffset: number;
  adultPrice: number;
  closed: boolean;
  exception?: DealScheduleException;
};
type LegacyDealSchedule = {
  mode?: 'specific-dates' | 'date-range';
  specificDates?: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
  daysOfWeek?: number[];
  returnDayOffset?: number;
  departures?: Record<string, { seatsAvailable: number; adultPriceOverride?: number; returnDayOffset?: number }>;
  defaultAdultPrice?: number;
  exceptions?: DealScheduleException[];
};
export type AirportTimeZone = { code: string; timezone: string; offset: { gmt: number; dst: number } };
export type JourneyConnection = { from: string; to: string; layoverMinutes: number | null; airportChange: boolean; overnight: boolean; over24Hours: boolean; belowMinimum: boolean };
export type JourneyMetrics = { stops: number; totalMinutes: number | null; arrivalDayOffset: number | null; connections: JourneyConnection[]; error?: string };

export type AirlineDeal = {
  id: string;
  title: string;
  description: string;
  airline: string;
  cabin: string;
  tripType: DealTripType;
  routes: DealRoute[];
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  baggage: string;
  travelStartDate: string;
  travelEndDate: string;
  fares: { adult: DealFare; child: DealFare; infant: DealFare };
  fareConditions?: DealFareConditions;
  currency: string;
  seatsAvailable: number;
  salesStartDate: string;
  salesEndDate: string;
  bookingCutOffHours: number;
  image: string;
  imageAlt?: string;
  featured: boolean;
  displayOrder: number;
  internalNotes: string;
  status: DealStatus;
  outboundJourney?: DealJourney;
  returnJourney?: DealJourney;
  minimumConnectionMinutes?: number;
  schedule?: DealSchedule;
  createdAt: string;
  updatedAt: string;
};

export type AirlineDealDraft = Omit<AirlineDeal, 'id' | 'createdAt' | 'updatedAt'>;
export type DealAirportOption = { code: string; label: string; searchText: string };

export function getMissingDealDetails(deal: Pick<AirlineDeal, 'image' | 'imageAlt' | 'fares' | 'fareConditions' | 'outboundJourney' | 'returnJourney'>): string[] {
  const missing: string[] = [];
  if (!deal.image.trim()) missing.push('deal image');
  if (!deal.imageAlt?.trim()) missing.push('image alt text');

  const segments = [deal.outboundJourney, deal.returnJourney].flatMap(journey => journey?.segments ?? []);
  segments.forEach((segment, index) => {
    const segmentName = `segment ${index + 1}`;
    const allowanceIsComplete = (allowance?: DealBaggageAllowance) => allowance !== undefined && (
      !allowance.included
        ? allowance.pieces === undefined && allowance.weightKg === undefined
        : (allowance.pieces !== undefined && Number.isInteger(allowance.pieces) && allowance.pieces > 0)
          || (allowance.weightKg !== undefined && Number.isFinite(allowance.weightKg) && allowance.weightKg > 0)
    );
    if (!allowanceIsComplete(segment.cabinBaggage)) missing.push(`${segmentName} cabin baggage`);
    if (!allowanceIsComplete(segment.checkedBaggage)) missing.push(`${segmentName} checked baggage`);
  });
  if (!segments.length) missing.push('flight segments');

  (['adult', 'child', 'infant'] as const).forEach(passenger => {
    (['baseFare', 'taxes'] as const).forEach(part => {
      const value = deal.fares[passenger][part];
      if (value === undefined || !Number.isFinite(value) || value < 0) missing.push(`${passenger} ${part === 'baseFare' ? 'base fare' : 'taxes'}`);
    });
  });

  const conditions = deal.fareConditions;
  if (!conditions?.refundable) missing.push('refund conditions');
  if (conditions?.refundable === 'with-fee' && (conditions.refundFee === undefined || !Number.isFinite(conditions.refundFee) || conditions.refundFee < 0)) missing.push('refund fee');
  if (!conditions?.changesAllowed) missing.push('change conditions');
  if (conditions?.changesAllowed === 'with-fee' && (conditions.changeFee === undefined || !Number.isFinite(conditions.changeFee) || conditions.changeFee < 0)) missing.push('change fee');
  return missing;
}

export function describeSegmentBaggage(segment: DealSegment): string[] {
  const describe = (label: string, allowance?: DealBaggageAllowance) => {
    if (!allowance) return undefined;
    if (!allowance.included) return `No ${label.toLowerCase()} included`;
    const details = [
      allowance.pieces !== undefined ? `${allowance.pieces} ${allowance.pieces === 1 ? 'piece' : 'pieces'}` : '',
      allowance.weightKg !== undefined ? `${allowance.weightKg} kg` : '',
    ].filter(Boolean).join(' · ');
    return details ? `${label}: ${details}` : undefined;
  };
  return [describe('Cabin bag', segment.cabinBaggage), describe('Checked bag', segment.checkedBaggage)].filter((value): value is string => Boolean(value));
}

const STORAGE_KEY = 'aeropoint-airline-deals-v1';
const airportTimeZoneByCode = new Map((airportTimeZones as AirportTimeZone[]).map(airport => [airport.code.toUpperCase(), airport.timezone]));

const emptySchedule = (startDate: string, endDate: string): DealSchedule => ({
  dateRangeStart: startDate, dateRangeEnd: endDate,
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], returnDayOffset: 7, defaultAdultPrice: 0, exceptions: [],
});

function legacySegment(deal: AirlineDeal, route: DealRoute, index: number): DealSegment {
  const arrivalDayOffset = deal.arrivalTime < deal.departureTime ? 1 : 0;
  return {
    id: `${deal.id}-segment-${index + 1}`, airline: deal.airline, flightNumber: deal.flightNumber,
    operatingAirline: '', origin: route.origin, destination: route.destination,
    departureTime: deal.departureTime, departureDayOffset: 0, arrivalTime: deal.arrivalTime, arrivalDayOffset,
    departureTerminal: '', arrivalTerminal: '', cabin: deal.cabin, baggage: deal.baggage,
  };
}

function normalizeDeal(deal: AirlineDeal): AirlineDeal {
  const routes = deal.routes.length ? deal.routes : [{ origin: '', destination: '' }];
  const defaultSchedule = emptySchedule(deal.travelStartDate, deal.travelEndDate);
  const legacySchedule = deal.schedule as DealSchedule & LegacyDealSchedule | undefined;
  const dates = legacySchedule?.mode === 'specific-dates' ? (legacySchedule.specificDates ?? []).filter(Boolean).sort() : [];
  const startDate = legacySchedule?.dateRangeStart || dates[0] || deal.travelStartDate;
  const endDate = legacySchedule?.dateRangeEnd || dates[dates.length - 1] || deal.travelEndDate;
  const legacyDays = dates.length ? Array.from(new Set(dates.map(date => new Date(`${date}T00:00:00Z`).getUTCDay()))).sort() : legacySchedule?.daysOfWeek;
  const exceptions = [...(legacySchedule?.exceptions ?? [])];
  for (const [date, inventory] of Object.entries(legacySchedule?.departures ?? {})) {
    if (inventory.seatsAvailable === deal.seatsAvailable
      && inventory.adultPriceOverride === undefined
      && inventory.returnDayOffset === undefined) continue;
    exceptions.push({
      id: `legacy-${date}`,
      type: 'single-date',
      date,
      startDate: date,
      endDate: date,
      daysOfWeek: [],
      seatsAvailable: inventory.seatsAvailable === deal.seatsAvailable ? undefined : inventory.seatsAvailable,
      adultPriceOverride: inventory.adultPriceOverride,
      returnDayOffset: inventory.returnDayOffset,
      closed: false,
      note: '',
    });
  }
  const schedule: DealSchedule = {
    ...defaultSchedule,
    dateRangeStart: startDate,
    dateRangeEnd: endDate,
    daysOfWeek: legacyDays ?? defaultSchedule.daysOfWeek,
    returnDayOffset: legacySchedule?.returnDayOffset ?? defaultSchedule.returnDayOffset,
    defaultAdultPrice: legacySchedule?.defaultAdultPrice ?? (deal.fares.adult.baseFare ?? 0) + (deal.fares.adult.taxes ?? 0),
    exceptions,
  };
  if (legacySchedule?.mode === 'specific-dates' && dates.length) {
    const included = new Set(dates);
    for (const date of generateDefaultDates(schedule)) {
      if (!included.has(date)) schedule.exceptions.push({
        id: `legacy-closed-${date}`,
        type: 'single-date',
        date,
        startDate: date,
        endDate: date,
        daysOfWeek: [],
        closed: true,
        note: '',
      });
    }
  }
  return {
    ...deal,
    imageAlt: deal.imageAlt ?? '',
    outboundJourney: deal.outboundJourney ?? { segments: routes.map((route, index) => legacySegment(deal, route, index)) },
    minimumConnectionMinutes: deal.minimumConnectionMinutes ?? 60,
    schedule,
  };
}

export function getAirportTimeZone(code: string): string | undefined {
  return airportTimeZoneByCode.get(code.trim().toUpperCase());
}

function dateWithOffset(date: string, offset: number): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match || !Number.isInteger(offset)) return null;
  const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + offset));
  return [value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()];
}

function localDateTimeToEpoch(date: string, time: string, dayOffset: number, zone: string): number | null {
  const dateParts = dateWithOffset(date, dayOffset);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateParts || !timeMatch) return null;
  const [year, month, day] = dateParts;
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (hour > 23 || minute > 59) return null;
  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute);
  let instant = targetWallTime;
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  try {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(part => [part.type, part.value]));
      const displayedWallTime = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
      const correction = targetWallTime - displayedWallTime;
      if (correction === 0) return instant;
      instant += correction;
    }
  } catch {
    return null;
  }
  return null;
}

function dateAtAirport(epoch: number, code: string): string | null {
  const zone = getAirportTimeZone(code);
  if (!zone) return null;
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(epoch)).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    return null;
  }
}

function calendarDayDifference(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
}

export function calculateJourneyMetrics(journey: DealJourney, departureDate: string, minimumConnectionMinutes = 60): JourneyMetrics {
  const segments = journey.segments;
  if (!segments.length) return { stops: 0, totalMinutes: null, arrivalDayOffset: null, connections: [], error: 'Add at least one segment.' };
  const instants = segments.map(segment => {
    const originZone = getAirportTimeZone(segment.origin);
    const destinationZone = getAirportTimeZone(segment.destination);
    if (!originZone || !destinationZone) return null;
    const departure = localDateTimeToEpoch(departureDate, segment.departureTime, segment.departureDayOffset, originZone);
    const arrival = localDateTimeToEpoch(departureDate, segment.arrivalTime, segment.arrivalDayOffset, destinationZone);
    return departure === null || arrival === null ? null : { departure, arrival };
  });
  if (instants.some(instant => !instant)) return { stops: segments.length - 1, totalMinutes: null, arrivalDayOffset: null, connections: [], error: 'Choose valid times and airports with known time zones.' };
  const resolved = instants as Array<{ departure: number; arrival: number }>;
  if (resolved.some(instant => instant.arrival < instant.departure)) return { stops: segments.length - 1, totalMinutes: null, arrivalDayOffset: null, connections: [], error: 'Each segment must arrive after it departs.' };
  const connections: JourneyConnection[] = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    const current = segments[index];
    const next = segments[index + 1];
    const layoverMinutes = (resolved[index + 1].departure - resolved[index].arrival) / 60_000;
    const airportChange = current.destination !== next.origin;
    const arrivalDate = dateAtAirport(resolved[index].arrival, current.destination);
    const nextDepartureDate = dateAtAirport(resolved[index + 1].departure, next.origin);
    connections.push({
      from: current.destination, to: next.origin, layoverMinutes,
      airportChange,
      overnight: Boolean(arrivalDate && nextDepartureDate && arrivalDate !== nextDepartureDate),
      over24Hours: layoverMinutes > 24 * 60,
      belowMinimum: layoverMinutes < minimumConnectionMinutes,
    });
  }
  const firstDepartureDate = dateAtAirport(resolved[0].departure, segments[0].origin);
  const finalArrivalDate = dateAtAirport(resolved[resolved.length - 1].arrival, segments[segments.length - 1].destination);
  return {
    stops: segments.length - 1,
    totalMinutes: (resolved[resolved.length - 1].arrival - resolved[0].departure) / 60_000,
    arrivalDayOffset: firstDepartureDate && finalArrivalDate ? calendarDayDifference(firstDepartureDate, finalArrivalDate) : null,
    connections,
  };
}

function generateDefaultDates(schedule: Pick<DealSchedule, 'dateRangeStart' | 'dateRangeEnd' | 'daysOfWeek'>): string[] {
  if (!schedule.dateRangeStart || !schedule.dateRangeEnd || schedule.dateRangeStart > schedule.dateRangeEnd) return [];
  const dates: string[] = [];
  const current = new Date(`${schedule.dateRangeStart}T00:00:00Z`);
  const end = new Date(`${schedule.dateRangeEnd}T00:00:00Z`);
  for (; current <= end; current.setUTCDate(current.getUTCDate() + 1)) {
    if (schedule.daysOfWeek.includes(current.getUTCDay())) dates.push(current.toISOString().slice(0, 10));
  }
  return dates;
}

function exceptionMatchesDate(exception: DealScheduleException, date: string): boolean {
  if (exception.type === 'single-date') return exception.date === date;
  if (date < exception.startDate || date > exception.endDate) return false;
  return exception.type === 'date-range' || exception.daysOfWeek.includes(new Date(`${date}T00:00:00Z`).getUTCDay());
}

const exceptionPriority: Record<DealExceptionType, number> = { 'single-date': 0, 'date-range': 1, 'weekday-range': 2 };

export function generateDealDepartures(
  schedule: DealSchedule,
  defaults: { seatsAvailable: number; adultPrice: number; returnDayOffset?: number },
): DealDeparture[] {
  return generateDefaultDates(schedule).map(date => {
    const exception = schedule.exceptions
      .filter(item => exceptionMatchesDate(item, date))
      .sort((left, right) => exceptionPriority[left.type] - exceptionPriority[right.type])[0];
    return {
      date,
      seatsAvailable: exception?.seatsAvailable ?? defaults.seatsAvailable,
      adultPrice: exception?.adultPriceOverride ?? schedule.defaultAdultPrice ?? defaults.adultPrice,
      returnDayOffset: exception?.returnDayOffset ?? schedule.returnDayOffset ?? defaults.returnDayOffset ?? 7,
      closed: exception?.closed ?? false,
      exception,
    };
  });
}

export function getScheduledDepartureDates(schedule: DealSchedule): string[] {
  return generateDealDepartures(schedule, { seatsAvailable: 0, adultPrice: schedule.defaultAdultPrice }).filter(departure => !departure.closed).map(departure => departure.date);
}

export function getCustomerSearchDepartures(deal: AirlineDeal): DealDeparture[] {
  if (deal.status !== 'Active' || !deal.schedule) return [];
  const departures = generateDealDepartures(deal.schedule, {
    seatsAvailable: deal.seatsAvailable,
    adultPrice: (deal.fares.adult.baseFare ?? 0) + (deal.fares.adult.taxes ?? 0),
    returnDayOffset: deal.schedule.returnDayOffset,
  });
  const soldByDate = getSeatsSoldForDepartures(deal.id, departures.map(departure => departure.date));
  return departures
    .map(departure => ({ ...departure, seatsAvailable: Math.max(0, departure.seatsAvailable - (soldByDate[departure.date] ?? 0)) }))
    .filter(departure => !departure.closed && departure.seatsAvailable > 0);
}

export function getSeatsSoldForDepartures(dealId: string, dates: string[]): Record<string, number> {
  if (!dealId || !dates.length) return {};
  const requestedDates = new Set(dates);
  return readManagedBookings()
    .filter(booking => booking.bookingType === 'flights'
      && booking.bookingStatus !== 'Cancelled'
      && booking.details.airlineDealId === dealId
      && requestedDates.has(booking.details.departureDate))
    .reduce<Record<string, number>>((totals, booking) => {
      const date = booking.details.departureDate;
      const passengerCount = Number(booking.details.passengerCount || 1);
      totals[date] = (totals[date] ?? 0) + (Number.isInteger(passengerCount) && passengerCount > 0 ? passengerCount : 1);
      return totals;
    }, {});
}

export function getExceptionDepartureDates(schedule: DealSchedule, exception: DealScheduleException): string[] {
  return generateDefaultDates(schedule).filter(date => exceptionMatchesDate(exception, date));
}

export function hasOverlappingSameTypeExceptions(exceptions: DealScheduleException[]): boolean {
  return exceptions.some((exception, index) => exceptions.slice(index + 1).some(other => {
    if (exception.type !== other.type) return false;
    if (exception.type === 'single-date') return exception.date === other.date;
    const overlapsRange = exception.startDate <= other.endDate && other.startDate <= exception.endDate;
    if (!overlapsRange) return false;
    return exception.type === 'date-range' || exception.daysOfWeek.some(day => other.daysOfWeek.includes(day));
  }));
}

const mockDeals: AirlineDeal[] = [
  {
    id: 'deal-lagos-london', title: 'London Winter Escape', description: 'Seasonal return fares from Lagos to London.', airline: 'British Airways', cabin: 'Economy', tripType: 'Return',
    routes: [{ origin: 'LOS', destination: 'LHR' }], flightNumber: 'BA 074', departureTime: '23:10', arrivalTime: '05:25', stops: 0, baggage: '23 kg checked baggage',
    travelStartDate: '2026-11-01', travelEndDate: '2027-02-28', fares: { adult: { baseFare: 720000, taxes: 185000 }, child: { baseFare: 570000, taxes: 145000 }, infant: { baseFare: 120000, taxes: 45000 } },
    currency: 'NGN', seatsAvailable: 18, salesStartDate: '2026-10-01', salesEndDate: '2026-12-31', bookingCutOffHours: 24,
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=480&q=80', featured: true, displayOrder: 1, internalNotes: 'Winter allocation; confirm inventory before ticketing.', status: 'Active', createdAt: '2026-10-01T09:00:00.000Z', updatedAt: '2026-10-18T11:00:00.000Z',
  },
  {
    id: 'deal-abuja-dubai', title: 'Dubai City Break', description: 'Direct return flights for your next Dubai getaway.', airline: 'Emirates', cabin: 'Economy', tripType: 'Return',
    routes: [{ origin: 'ABV', destination: 'DXB' }], flightNumber: 'EK 786', departureTime: '18:20', arrivalTime: '04:45', stops: 0, baggage: '25 kg checked baggage',
    travelStartDate: '2026-11-15', travelEndDate: '2027-03-30', fares: { adult: { baseFare: 580000, taxes: 162000 }, child: { baseFare: 460000, taxes: 130000 }, infant: { baseFare: 95000, taxes: 38000 } },
    currency: 'NGN', seatsAvailable: 9, salesStartDate: '2026-10-10', salesEndDate: '2027-01-15', bookingCutOffHours: 12,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=480&q=80', featured: true, displayOrder: 2, internalNotes: '', status: 'Active', createdAt: '2026-10-10T09:00:00.000Z', updatedAt: '2026-10-20T11:00:00.000Z',
  },
  {
    id: 'deal-lagos-accra', title: 'Accra Quick Getaway', description: 'A short hop from Lagos to Accra.', airline: 'Africa World Airlines', cabin: 'Economy', tripType: 'One-way',
    routes: [{ origin: 'LOS', destination: 'ACC' }], flightNumber: 'AW 215', departureTime: '09:30', arrivalTime: '10:40', stops: 0, baggage: '20 kg checked baggage',
    travelStartDate: '2026-10-25', travelEndDate: '2026-11-20', fares: { adult: { baseFare: 185000, taxes: 42000 }, child: { baseFare: 145000, taxes: 35000 }, infant: { baseFare: 30000, taxes: 12000 } },
    currency: 'NGN', seatsAvailable: 6, salesStartDate: '2026-10-01', salesEndDate: '2026-11-10', bookingCutOffHours: 6,
    image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=480&q=80', featured: false, displayOrder: 3, internalNotes: 'Limited seats.', status: 'Paused', createdAt: '2026-10-02T09:00:00.000Z', updatedAt: '2026-10-19T11:00:00.000Z',
  },
  {
    id: 'deal-lagos-paris-expired', title: 'Paris Spring Fare', description: 'Return fares to Paris for spring travel.', airline: 'Air France', cabin: 'Economy', tripType: 'Return',
    routes: [{ origin: 'LOS', destination: 'CDG' }], flightNumber: 'AF 149', departureTime: '22:45', arrivalTime: '06:20', stops: 0, baggage: '23 kg checked baggage',
    travelStartDate: '2026-04-01', travelEndDate: '2026-06-30', fares: { adult: { baseFare: 680000, taxes: 190000 }, child: { baseFare: 530000, taxes: 150000 }, infant: { baseFare: 110000, taxes: 42000 } },
    currency: 'NGN', seatsAvailable: 0, salesStartDate: '2026-01-01', salesEndDate: '2026-03-20', bookingCutOffHours: 24,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=480&q=80', featured: false, displayOrder: 4, internalNotes: '', status: 'Expired', createdAt: '2026-01-01T09:00:00.000Z', updatedAt: '2026-03-21T11:00:00.000Z',
  },
];

function makeId(): string {
  return `deal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function saveDeals(deals: AirlineDeal[]): AirlineDeal[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  return deals;
}

export function getAirlineDeals(): AirlineDeal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return mockDeals.map(deal => normalizeDeal({ ...deal, routes: deal.routes.map(route => ({ ...route })) }));
    const parsed = JSON.parse(stored) as AirlineDeal[];
    return Array.isArray(parsed) ? parsed.map(normalizeDeal) : mockDeals.map(normalizeDeal);
  } catch {
    return mockDeals.map(normalizeDeal);
  }
}

export function saveAirlineDeal(draft: AirlineDealDraft, id?: string): AirlineDeal[] {
  const deals = getAirlineDeals();
  const now = new Date().toISOString();
  const existing = id ? deals.find(deal => deal.id === id) : undefined;
  const nextDeal: AirlineDeal = { ...draft, id: existing?.id ?? makeId(), createdAt: existing?.createdAt ?? now, updatedAt: now };
  return saveDeals(existing ? deals.map(deal => deal.id === id ? nextDeal : deal) : [nextDeal, ...deals]);
}

export function updateAirlineDeal(id: string, updates: Partial<AirlineDeal>): AirlineDeal[] {
  return saveDeals(getAirlineDeals().map(deal => deal.id === id ? { ...deal, ...updates, updatedAt: new Date().toISOString() } : deal));
}

export function duplicateAirlineDeal(id: string): AirlineDeal[] {
  const deals = getAirlineDeals();
  const source = deals.find(deal => deal.id === id);
  if (!source) return deals;
  const now = new Date().toISOString();
  return saveDeals([{ ...source, id: makeId(), title: `${source.title} (Copy)`, status: 'Draft', featured: false, createdAt: now, updatedAt: now }, ...deals]);
}

export function deleteAirlineDeal(id: string): AirlineDeal[] {
  return saveDeals(getAirlineDeals().filter(deal => deal.id !== id));
}

export function getDealAirlineOptions(): string[] {
  return getAvailableAirlines().filter(airline => airline.status).map(airline => `${airline.name} (${airline.code})`).sort((left, right) => left.localeCompare(right));
}

export function searchDealAirports(query: string): DealAirportOption[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  return getAvailableAirports().filter(airport => airport.status && `${airport.iata} ${airport.name} ${airport.city} ${airport.country}`.toLowerCase().includes(needle))
    .slice(0, 8)
    .map(airport => ({ code: airport.iata, label: `${airport.iata} · ${airport.city}, ${airport.country}`, searchText: `${airport.name} ${airport.iata} ${airport.city} ${airport.country}` }));
}

export function getDealAirportLabel(code: string): string | undefined {
  const airport = getAvailableAirports().find(item => item.iata.toLowerCase() === code.trim().toLowerCase());
  return airport ? `${airport.iata} · ${airport.city}, ${airport.country}` : undefined;
}