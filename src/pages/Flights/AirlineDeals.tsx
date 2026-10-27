import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CalendarDays, ChevronLeft, ChevronRight, Clock3, Copy, Edit2, Pause, Plane, Plus, Search, Trash2, X } from 'lucide-react';
import {
  deleteAirlineDeal,
  calculateJourneyMetrics,
  describeSegmentBaggage,
  duplicateAirlineDeal,
  getMissingDealDetails,
  getAirlineDeals,
  getCustomerSearchDepartures,
  getDealAirlineOptions,
  getDealAirportLabel,
  generateDealDepartures,
  getExceptionDepartureDates,
  getSeatsSoldForDepartures,
  getScheduledDepartureDates,
  hasOverlappingSameTypeExceptions,
  saveAirlineDeal,
  searchDealAirports,
  updateAirlineDeal,
} from '../../services/airlineDealsService';
import type { AirlineDeal, AirlineDealDraft, DealBaggageAllowance, DealExceptionType, DealFare, DealFareConditions, DealFareConditionType, DealJourney, DealSchedule, DealScheduleException, DealSegment, DealStatus, DealTripType } from '../../services/airlineDealsService';

const inputClass = 'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
const labelClass = 'block text-xs font-medium text-gray-600';
const statuses: DealStatus[] = ['Draft', 'Active', 'Paused', 'Expired'];
const currencies = ['NGN', 'USD', 'GBP', 'EUR', 'CAD'];
const cabins = ['Economy', 'Premium Economy', 'Business', 'First'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function blankBaggageAllowance(): DealBaggageAllowance {
  return { included: false };
}

function blankSegment(): DealSegment {
  return { id: `segment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, airline: '', flightNumber: '', operatingAirline: '', origin: '', destination: '', departureTime: '', departureDayOffset: 0, arrivalTime: '', arrivalDayOffset: 0, departureTerminal: '', arrivalTerminal: '', aircraft: '', cabin: 'Economy', cabinBaggage: blankBaggageAllowance(), checkedBaggage: blankBaggageAllowance(), baggage: '' };
}

function blankJourney(): DealJourney {
  return { segments: [blankSegment()] };
}

function blankReturnJourney(outbound: DealJourney | undefined, routes: AirlineDeal['routes']): DealJourney {
  const outboundSegments = outbound?.segments.length ? outbound.segments : routes.map(route => ({ ...blankSegment(), origin: route.origin, destination: route.destination }));
  return { segments: [...outboundSegments].reverse().map(segment => ({ ...blankSegment(), airline: segment.airline, origin: segment.destination, destination: segment.origin, aircraft: segment.aircraft, cabin: segment.cabin, cabinBaggage: segment.cabinBaggage, checkedBaggage: segment.checkedBaggage, baggage: segment.baggage })) };
}

function blankSchedule(): DealSchedule {
  return { dateRangeStart: '', dateRangeEnd: '', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], returnDayOffset: 7, defaultAdultPrice: 0, exceptions: [] };
}

function blankDraft(): AirlineDealDraft {
  return {
    title: '', description: '', airline: '', cabin: 'Economy', tripType: 'One-way', routes: [{ origin: '', destination: '' }],
    flightNumber: '', departureTime: '', arrivalTime: '', stops: 0, baggage: '', travelStartDate: '', travelEndDate: '',
    fares: { adult: { baseFare: undefined, taxes: undefined }, child: { baseFare: undefined, taxes: undefined }, infant: { baseFare: undefined, taxes: undefined } },
    currency: 'NGN', seatsAvailable: 1, salesStartDate: '', salesEndDate: '', bookingCutOffHours: 24, image: '', featured: false,
    displayOrder: 0, internalNotes: '', imageAlt: '', fareConditions: { notes: '' }, status: 'Draft', outboundJourney: blankJourney(), minimumConnectionMinutes: 60, schedule: blankSchedule(),
  };
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'Not available';
  const wholeMinutes = Math.round(minutes);
  const hours = Math.floor(wholeMinutes / 60);
  const remainingMinutes = wholeMinutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, '0')}m`;
}

function shiftDate(date: string, days: number): string {
  if (!date) return '';
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function journeyError(journey: DealJourney | undefined, date: string, minimumConnectionMinutes: number, label: string): string | undefined {
  if (!journey?.segments.length) return `${label} journey needs at least one segment.`;
  for (const [index, segment] of journey.segments.entries()) {
    if (!segment.airline || !segment.flightNumber.trim() || !segment.origin || !segment.destination || !segment.departureTime || !segment.arrivalTime || !segment.cabin) return `Complete the airline, flight, airports, times, and cabin for ${label.toLowerCase()} segment ${index + 1}.`;
    if (!Number.isInteger(segment.departureDayOffset) || segment.departureDayOffset < 0 || !Number.isInteger(segment.arrivalDayOffset) || segment.arrivalDayOffset < 0) return `Day offsets for ${label.toLowerCase()} segment ${index + 1} must be whole days of zero or more.`;
  }
  const metrics = calculateJourneyMetrics(journey, date, minimumConnectionMinutes);
  if (metrics.error) return `${label} journey: ${metrics.error}`;
  if (metrics.connections.some(connection => (connection.layoverMinutes ?? 0) < 0)) return `${label} journey has a segment departing before the previous segment arrives.`;
  if (metrics.connections.some(connection => connection.belowMinimum)) return `${label} journey has a connection below the ${minimumConnectionMinutes}-minute minimum.`;
  return undefined;
}

function scheduleError(schedule: DealSchedule, defaultSeats: number, dealId?: string): string | undefined {
  if (!schedule.dateRangeStart || !schedule.dateRangeEnd || schedule.dateRangeStart > schedule.dateRangeEnd) return 'Choose a valid schedule date range.';
  if (!schedule.daysOfWeek.length) return 'Choose at least one default day of the week.';
  const dates = getScheduledDepartureDates(schedule);
  if (!dates.length) return 'Add at least one departure date.';
  if (!Number.isInteger(defaultSeats) || defaultSeats < 0) return 'Default seats per departure must be a whole number of zero or more.';
  if (!Number.isFinite(schedule.defaultAdultPrice) || schedule.defaultAdultPrice < 0) return 'Default adult price must be zero or more.';
  if (!Number.isInteger(schedule.returnDayOffset) || schedule.returnDayOffset < 1) return 'Return after must be a positive whole number of days.';
  for (const exception of schedule.exceptions) {
    if (exception.type === 'single-date' && !exception.date) return 'Choose a date for each single-date exception.';
    if (exception.type !== 'single-date' && (!exception.startDate || !exception.endDate || exception.startDate > exception.endDate)) return 'Choose a valid date range for each exception.';
    if (exception.type === 'weekday-range' && !exception.daysOfWeek.length) return 'Choose at least one weekday for each weekday exception.';
    if (exception.seatsAvailable !== undefined && (!Number.isInteger(exception.seatsAvailable) || exception.seatsAvailable < 0)) return 'Exception seats must be a whole number of zero or more.';
    if (exception.adultPriceOverride !== undefined && (!Number.isFinite(exception.adultPriceOverride) || exception.adultPriceOverride < 0)) return 'Exception price must be zero or more.';
    if (exception.returnDayOffset !== undefined && (!Number.isInteger(exception.returnDayOffset) || exception.returnDayOffset < 1)) return 'Exception return after must be a positive whole number of days.';
  }
  if (dealId) {
    const departures = generateDealDepartures(schedule, { seatsAvailable: defaultSeats, adultPrice: schedule.defaultAdultPrice, returnDayOffset: schedule.returnDayOffset });
    const soldByDate = getSeatsSoldForDepartures(dealId, departures.map(departure => departure.date));
    const overbooked = departures.find(departure => !departure.closed && departure.seatsAvailable < (soldByDate[departure.date] ?? 0));
    if (overbooked) return `Seats for ${overbooked.date} cannot be lower than the ${soldByDate[overbooked.date]} already sold.`;
  }
  return undefined;
}

function statusClass(status: DealStatus): string {
  if (status === 'Active') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Paused') return 'bg-amber-50 text-amber-800';
  if (status === 'Expired') return 'bg-gray-100 text-gray-600';
  return 'bg-blue-50 text-blue-700';
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function AirportPicker({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
  const [query, setQuery] = useState(getDealAirportLabel(value) ?? value);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchDealAirports(query), [query]);

  return <div className="relative">
    <label className={labelClass}>{label}
      <input value={query} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onChange={event => { setQuery(event.target.value); onChange(event.target.value); setOpen(true); }} placeholder="Search city or airport" className={inputClass} autoComplete="off" />
    </label>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    {open && query.trim().length >= 2 && <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
      {results.length ? results.map(option => <button key={option.code} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { onChange(option.code); setQuery(option.label); setOpen(false); }} className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50">{option.label}</button>) : <p className="px-3 py-2 text-xs text-gray-500">No matching airport found.</p>}
    </div>}
  </div>;
}

function validateDraft(draft: AirlineDealDraft, dealId?: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.title.trim()) errors.title = 'Enter a deal title.';
  if (!draft.description.trim()) errors.description = 'Enter a short description.';
  const scheduleDates = draft.schedule ? getScheduledDepartureDates(draft.schedule) : [];
  const journeyDate = scheduleDates[0] ?? draft.travelStartDate;
  const outboundError = journeyError(draft.outboundJourney, journeyDate, draft.minimumConnectionMinutes ?? 60, 'Outbound');
  if (outboundError) errors.outboundJourney = outboundError;
  if (draft.tripType === 'Return') {
    const returnError = journeyError(draft.returnJourney, journeyDate, draft.minimumConnectionMinutes ?? 60, 'Return');
    if (returnError) errors.returnJourney = returnError;
  }
  if (draft.outboundJourney?.segments.some(segment => segment.origin.toLowerCase() === segment.destination.toLowerCase())) errors.outboundJourney = 'A segment origin and destination must be different.';
  if (draft.returnJourney?.segments.some(segment => segment.origin.toLowerCase() === segment.destination.toLowerCase())) errors.returnJourney = 'A segment origin and destination must be different.';
  if (!draft.schedule) errors.schedule = 'Set a schedule for this deal.';
  else {
    const error = scheduleError(draft.schedule, draft.seatsAvailable, dealId);
    if (error) errors.schedule = error;
  }
  if (!draft.salesStartDate || !draft.salesEndDate) errors.salesDates = 'Choose the sales date range.';
  else if (draft.salesStartDate > draft.salesEndDate) errors.salesDates = 'Sales end date must be on or after the start date.';
  if (!Number.isInteger(draft.minimumConnectionMinutes) || (draft.minimumConnectionMinutes ?? -1) < 0) errors.minimumConnectionMinutes = 'Minimum connection time must be zero or more minutes.';
  if (!Number.isInteger(draft.seatsAvailable) || draft.seatsAvailable < 0) errors.seatsAvailable = 'Default seats must be a whole number of zero or more.';
  if (!Number.isFinite(draft.bookingCutOffHours) || draft.bookingCutOffHours < 0) errors.bookingCutOffHours = 'Cut-off must be zero or more hours.';
  if (!Number.isInteger(draft.displayOrder) || draft.displayOrder < 0) errors.displayOrder = 'Display order must be a whole number of zero or more.';
  (['adult', 'child', 'infant'] as const).forEach(passenger => {
    (['baseFare', 'taxes'] as const).forEach(part => {
      const value = draft.fares[passenger][part];
      if (value !== undefined && (!Number.isFinite(value) || value < 0)) errors[`fare-${passenger}-${part}`] = 'Enter a valid amount of zero or more.';
    });
  });
  if (draft.status === 'Active') {
    const missing = getMissingDealDetails(draft);
    if (missing.length) errors.activeDetails = `Complete these details before activating: ${missing.join(', ')}.`;
  }
  return errors;
}

function FareFields({ passenger, fare, currency, onChange, errors }: { passenger: 'adult' | 'child' | 'infant'; fare: DealFare; currency: string; onChange: (passenger: 'adult' | 'child' | 'infant', part: keyof DealFare, value: number | undefined) => void; errors: Record<string, string> }) {
  const title = passenger[0].toUpperCase() + passenger.slice(1);
  return <div className="grid grid-cols-[1fr_1fr_1fr] items-start gap-3">
    <span className="pt-3 text-xs font-semibold text-gray-700">{title}</span>
    {(['baseFare', 'taxes'] as const).map(part => {
      const key = `fare-${passenger}-${part}`;
      return <label key={part} className={labelClass}>{part === 'baseFare' ? `Base fare (${currency})` : `Taxes (${currency})`} <span className="text-[10px] text-gray-400">Required for Active</span>
        <input type="number" min="0" step="0.01" value={fare[part] ?? ''} onChange={event => onChange(passenger, part, event.target.value === '' ? undefined : Number(event.target.value))} className={inputClass} />
        {errors[key] && <span className="mt-1 block text-xs text-red-600">{errors[key]}</span>}
      </label>;
    })}
  </div>;
}

function BaggageFields({ label, value, onChange }: { label: string; value?: DealBaggageAllowance; onChange: (value: DealBaggageAllowance) => void }) {
  const allowance = value ?? blankBaggageAllowance();
  return <fieldset className="rounded-lg border border-gray-200 p-3">
    <legend className="px-1 text-xs font-medium text-gray-600">{label} <span className="text-[10px] text-gray-400">Required for Active</span></legend>
    <label className="flex items-center gap-2 text-xs text-gray-700"><input type="checkbox" checked={allowance.included} onChange={event => onChange(event.target.checked ? { included: true } : { included: false })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />Included</label>
    {allowance.included && <div className="mt-3 grid grid-cols-2 gap-3">
      <label className={labelClass}>Pieces<input type="number" min="1" step="1" value={allowance.pieces ?? ''} onChange={event => onChange({ ...allowance, pieces: event.target.value === '' ? undefined : Number(event.target.value) })} className={inputClass} /></label>
      <label className={labelClass}>Weight (kg)<input type="number" min="0.1" step="0.1" value={allowance.weightKg ?? ''} onChange={event => onChange({ ...allowance, weightKg: event.target.value === '' ? undefined : Number(event.target.value) })} className={inputClass} /></label>
    </div>}
  </fieldset>;
}

function JourneyEditor({ label, journey, departureDate, minimumConnectionMinutes, error, onChange }: { label: string; journey: DealJourney; departureDate: string; minimumConnectionMinutes: number; error?: string; onChange: (journey: DealJourney) => void }) {
  const metrics = calculateJourneyMetrics(journey, departureDate, minimumConnectionMinutes);
  const airlineOptions = getDealAirlineOptions();
  const updateSegment = (index: number, key: keyof DealSegment, value: string | number) => {
    onChange({ segments: journey.segments.map((segment, segmentIndex) => segmentIndex === index ? { ...segment, [key]: value } : segment) });
  };
  const updateSegmentBaggage = (index: number, key: 'cabinBaggage' | 'checkedBaggage', value: DealBaggageAllowance) => {
    onChange({ segments: journey.segments.map((segment, segmentIndex) => segmentIndex === index ? { ...segment, [key]: value } : segment) });
  };
  const moveSegment = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= journey.segments.length) return;
    const segments = [...journey.segments];
    [segments[index], segments[destination]] = [segments[destination], segments[index]];
    onChange({ segments });
  };

  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-2">
      <div><h3 className="text-sm font-semibold text-gray-900">{label} journey</h3><p className="mt-1 text-xs text-gray-500">All segments in this journey are issued on one ticket.</p></div>
      <button type="button" onClick={() => onChange({ segments: [...journey.segments, blankSegment()] })} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700"><Plus size={14} /> Add segment</button>
    </div>

    {journey.segments.map((segment, index) => <div key={segment.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between"><h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Segment {index + 1}</h4><div className="flex items-center gap-1">
        <button type="button" disabled={index === 0} onClick={() => moveSegment(index, -1)} aria-label={`Move ${label.toLowerCase()} segment ${index + 1} up`} title="Move up" className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-primary-700 disabled:opacity-35"><ArrowUp size={14} /></button>
        <button type="button" disabled={index === journey.segments.length - 1} onClick={() => moveSegment(index, 1)} aria-label={`Move ${label.toLowerCase()} segment ${index + 1} down`} title="Move down" className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-primary-700 disabled:opacity-35"><ArrowDown size={14} /></button>
        <button type="button" disabled={journey.segments.length === 1} onClick={() => onChange({ segments: journey.segments.filter((_, segmentIndex) => segmentIndex !== index) })} aria-label={`Remove ${label.toLowerCase()} segment ${index + 1}`} title="Remove segment" className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-red-600 disabled:opacity-35"><X size={14} /></button>
      </div></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Airline<select value={segment.airline} onChange={event => updateSegment(index, 'airline', event.target.value)} className={inputClass}><option value="">Select airline</option>{airlineOptions.map(airline => <option key={airline}>{airline}</option>)}</select></label>
        <label className={labelClass}>Flight number<input value={segment.flightNumber} onChange={event => updateSegment(index, 'flightNumber', event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Operating airline (optional)<select value={segment.operatingAirline} onChange={event => updateSegment(index, 'operatingAirline', event.target.value)} className={inputClass}><option value="">Same as marketing airline</option>{airlineOptions.map(airline => <option key={airline}>{airline}</option>)}</select></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AirportPicker label="Origin airport" value={segment.origin} onChange={value => updateSegment(index, 'origin', value)} />
        <AirportPicker label="Destination airport" value={segment.destination} onChange={value => updateSegment(index, 'destination', value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className={labelClass}>Departure time<input type="time" value={segment.departureTime} onChange={event => updateSegment(index, 'departureTime', event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Departure day offset (+ days)<input type="number" min="0" step="1" value={segment.departureDayOffset} onChange={event => updateSegment(index, 'departureDayOffset', Number(event.target.value))} className={inputClass} /></label>
        <label className={labelClass}>Arrival time<input type="time" value={segment.arrivalTime} onChange={event => updateSegment(index, 'arrivalTime', event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Arrival day offset (+ days)<input type="number" min="0" step="1" value={segment.arrivalDayOffset} onChange={event => updateSegment(index, 'arrivalDayOffset', Number(event.target.value))} className={inputClass} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className={labelClass}>Departure terminal (optional)<input value={segment.departureTerminal} onChange={event => updateSegment(index, 'departureTerminal', event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Arrival terminal (optional)<input value={segment.arrivalTerminal} onChange={event => updateSegment(index, 'arrivalTerminal', event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Aircraft (optional)<input value={segment.aircraft ?? ''} onChange={event => updateSegment(index, 'aircraft', event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Cabin<select value={segment.cabin} onChange={event => updateSegment(index, 'cabin', event.target.value)} className={inputClass}>{cabins.map(cabin => <option key={cabin}>{cabin}</option>)}</select></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2"><BaggageFields label="Cabin bag" value={segment.cabinBaggage} onChange={value => updateSegmentBaggage(index, 'cabinBaggage', value)} /><BaggageFields label="Checked bag" value={segment.checkedBaggage} onChange={value => updateSegmentBaggage(index, 'checkedBaggage', value)} /></div>
      {index < journey.segments.length - 1 && <div className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600"><ArrowRight size={14} className="mt-0.5 shrink-0" />Connection to segment {index + 2}</div>}
    </div>)}

    <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
      <div><span className="block text-xs text-gray-500">Stops</span><strong className="text-sm text-gray-900">{metrics.stops}</strong></div>
      <div><span className="block text-xs text-gray-500">Total journey time</span><strong className="text-sm text-gray-900">{formatDuration(metrics.totalMinutes)}</strong></div>
      <div><span className="block text-xs text-gray-500">Arrival day</span><strong className="text-sm text-gray-900">{metrics.arrivalDayOffset === null ? 'Not available' : metrics.arrivalDayOffset === 0 ? 'Same day' : `+${metrics.arrivalDayOffset} day${metrics.arrivalDayOffset === 1 ? '' : 's'}`}</strong></div>
      {metrics.connections.map((connection, index) => <div key={`${connection.from}-${connection.to}-${index}`} className="sm:col-span-3">
        <p className={`flex items-start gap-2 text-xs ${connection.belowMinimum ? 'font-medium text-red-700' : 'text-gray-700'}`}><Clock3 size={14} className="mt-0.5 shrink-0" />Layover at {getDealAirportLabel(connection.from) ?? connection.from}: {formatDuration(connection.layoverMinutes)}{connection.belowMinimum ? ` · below ${minimumConnectionMinutes}-minute minimum` : ''}</p>
        {(connection.airportChange || connection.overnight || connection.over24Hours) && <p className="mt-1 flex items-start gap-2 text-xs text-amber-800"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{[connection.airportChange && `Airport changes from ${connection.from} to ${connection.to}`, connection.overnight && 'Overnight layover', connection.over24Hours && 'Layover exceeds 24 hours'].filter(Boolean).join(' · ')}</p>}
      </div>)}
      {metrics.error && <p className="sm:col-span-3 text-xs text-gray-500">{departureDate ? metrics.error : 'Set a departure date to calculate itinerary times using airport time zones.'}</p>}
    </div>
    {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
  </section>;
}

function emptyException(type: DealExceptionType = 'single-date', date = ''): DealScheduleException {
  return { id: `exception-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, date, startDate: date, endDate: date, daysOfWeek: [], closed: false, note: '' };
}

function exceptionDescription(exception: DealScheduleException): string {
  if (exception.type === 'single-date') return exception.date || 'Choose a date';
  const range = `${exception.startDate || 'Start'} – ${exception.endDate || 'End'}`;
  return exception.type === 'date-range' ? range : `${weekdays.filter((_, index) => exception.daysOfWeek.includes(index)).join(', ') || 'No weekdays'} · ${range}`;
}

function ScheduleEditor({ schedule, currency, defaultSeats, error, onScheduleChange, onDefaultSeatsChange, onPreviewDate, onDefaultPriceChange }: { schedule: DealSchedule; currency: string; defaultSeats: number; error?: string; onScheduleChange: (schedule: DealSchedule) => void; onDefaultSeatsChange: (seats: number) => void; onPreviewDate: (date: string) => void; onDefaultPriceChange: (price: number) => void }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exceptionForm, setExceptionForm] = useState<DealScheduleException>(() => emptyException());
  const [panelError, setPanelError] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => schedule.dateRangeStart ? `${schedule.dateRangeStart.slice(0, 7)}-01` : `${new Date().toISOString().slice(0, 7)}-01`);
  const departures = generateDealDepartures(schedule, { seatsAvailable: defaultSeats, adultPrice: schedule.defaultAdultPrice, returnDayOffset: schedule.returnDayOffset });
  const departuresByDate = new Map(departures.map(departure => [departure.date, departure]));
  const overlapWarning = hasOverlappingSameTypeExceptions(schedule.exceptions);
  const openNew = (date = '') => {
    setExceptionForm(emptyException('single-date', date));
    setEditingId(null);
    setPanelError('');
    setPanelOpen(true);
  };
  const openEdit = (exception: DealScheduleException) => {
    setExceptionForm({ ...exception, daysOfWeek: [...exception.daysOfWeek] });
    setEditingId(exception.id);
    setPanelError('');
    setPanelOpen(true);
  };
  const saveException = () => {
    if (exceptionForm.type === 'single-date' && !exceptionForm.date) { setPanelError('Choose a date.'); return; }
    if (exceptionForm.type !== 'single-date' && (!exceptionForm.startDate || !exceptionForm.endDate || exceptionForm.startDate > exceptionForm.endDate)) { setPanelError('Choose a valid date range.'); return; }
    if (exceptionForm.type === 'weekday-range' && !exceptionForm.daysOfWeek.length) { setPanelError('Choose at least one weekday.'); return; }
    if (exceptionForm.seatsAvailable !== undefined && (!Number.isInteger(exceptionForm.seatsAvailable) || exceptionForm.seatsAvailable < 0)) { setPanelError('Seats must be a whole number of zero or more.'); return; }
    if (exceptionForm.returnDayOffset !== undefined && (!Number.isInteger(exceptionForm.returnDayOffset) || exceptionForm.returnDayOffset < 1)) { setPanelError('Return after must be a positive whole number of days.'); return; }
    if (exceptionForm.adultPriceOverride !== undefined && (!Number.isFinite(exceptionForm.adultPriceOverride) || exceptionForm.adultPriceOverride < 0)) { setPanelError('Price must be zero or more.'); return; }
    const exceptions = editingId
      ? schedule.exceptions.map(exception => exception.id === editingId ? exceptionForm : exception)
      : [...schedule.exceptions, exceptionForm];
    onScheduleChange({ ...schedule, exceptions });
    setPanelOpen(false);
  };
  const duplicateException = (exception: DealScheduleException) => {
    setExceptionForm({ ...exception, id: `exception-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, daysOfWeek: [...exception.daysOfWeek], note: exception.note ? `${exception.note} (copy)` : '' });
    setEditingId(null);
    setPanelError('');
    setPanelOpen(true);
  };
  const monthStart = new Date(`${calendarMonth}T00:00:00Z`);
  const monthDays = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).getUTCDate();
  const monthOffset = monthStart.getUTCDay();
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(monthStart);

  return <section className="space-y-5">
    <div className="flex items-center justify-between border-b border-gray-100 pb-2"><div><h3 className="text-sm font-semibold text-gray-900">Departures and exceptions</h3><p className="mt-1 text-xs text-gray-500">Set the repeating defaults once. Exceptions only store what changes.</p></div><CalendarDays size={17} className="text-gray-400" /></div>
    <div className="rounded-lg border border-gray-200 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Defaults</h4>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>Travel date range start<input type="date" value={schedule.dateRangeStart} onChange={event => onScheduleChange({ ...schedule, dateRangeStart: event.target.value })} className={inputClass} /></label>
        <label className={labelClass}>Travel date range end<input type="date" value={schedule.dateRangeEnd} onChange={event => onScheduleChange({ ...schedule, dateRangeEnd: event.target.value })} className={inputClass} /></label>
      </div>
      <fieldset className="mt-4"><legend className={labelClass}>Days of the week</legend><div className="mt-2 flex flex-wrap gap-2">{weekdays.map((day, index) => <label key={day} className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs ${schedule.daysOfWeek.includes(index) ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}><input type="checkbox" checked={schedule.daysOfWeek.includes(index)} onChange={event => onScheduleChange({ ...schedule, daysOfWeek: event.target.checked ? [...schedule.daysOfWeek, index].sort() : schedule.daysOfWeek.filter(dayOfWeek => dayOfWeek !== index) })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />{day}</label>)}</div></fieldset>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className={labelClass}>Seats per departure<input type="number" min="0" step="1" value={defaultSeats} onChange={event => onDefaultSeatsChange(Number(event.target.value))} className={inputClass} /></label>
        <label className={labelClass}>Return after (days)<input type="number" min="1" step="1" value={schedule.returnDayOffset} onChange={event => onScheduleChange({ ...schedule, returnDayOffset: Number(event.target.value) })} className={inputClass} /></label>
        <label className={labelClass}>Default adult price ({currency})<input type="number" min="0" step="0.01" value={schedule.defaultAdultPrice} onChange={event => onDefaultPriceChange(Number(event.target.value))} className={inputClass} /></label>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h4 className="text-sm font-semibold text-gray-900">Exceptions <span className="font-normal text-gray-500">({schedule.exceptions.length})</span></h4><p className="mt-1 text-xs text-gray-500">Single dates take precedence over date ranges, then weekday rules.</p></div>
      <button type="button" onClick={() => openNew()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary-200 px-3 text-xs font-semibold text-primary-700 hover:bg-primary-50"><Plus size={14} /> Add exception</button>
    </div>
    {overlapWarning && <p role="status" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={15} className="mt-0.5 shrink-0" />Two exceptions of the same type overlap. Resolve the overlap to avoid ambiguous rules.</p>}
    {schedule.exceptions.length ? <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">{schedule.exceptions.map(exception => <li key={exception.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0"><p className="text-xs font-semibold text-gray-800">{exception.closed ? 'No sales' : exceptionDescription(exception)}</p><p className="truncate text-[11px] text-gray-500">{exception.closed ? 'Closed dates' : [exception.seatsAvailable !== undefined && `${exception.seatsAvailable} seats`, exception.returnDayOffset !== undefined && `${exception.returnDayOffset} days return`, exception.adultPriceOverride !== undefined && money(exception.adultPriceOverride, currency)].filter(Boolean).join(' · ') || 'No field overrides'}{exception.note && ` · ${exception.note}`}</p></div>
      <div className="flex gap-1"><button type="button" onClick={() => openEdit(exception)} aria-label={`Edit exception ${exceptionDescription(exception)}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-primary-600"><Edit2 size={14} /></button><button type="button" onClick={() => duplicateException(exception)} aria-label={`Duplicate exception ${exceptionDescription(exception)}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-primary-600"><Copy size={14} /></button><button type="button" onClick={() => onScheduleChange({ ...schedule, exceptions: schedule.exceptions.filter(item => item.id !== exception.id) })} aria-label={`Delete exception ${exceptionDescription(exception)}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button></div>
    </li>)}</ul> : <p className="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-center text-xs text-gray-500">No exceptions added. All selected default departures use the defaults above.</p>}
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><div><h4 className="text-sm font-semibold text-gray-900">Calendar preview</h4><p className="mt-1 text-xs text-gray-500">Read-only · select a departure date to add an exception</p></div><div className="flex items-center gap-2"><button type="button" aria-label="Previous calendar month" onClick={() => setCalendarMonth(new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1)).toISOString().slice(0, 10))} className="rounded border border-gray-200 p-1.5 text-gray-600"><ChevronLeft size={15} /></button><span className="min-w-28 text-center text-xs font-medium text-gray-700">{monthTitle}</span><button type="button" aria-label="Next calendar month" onClick={() => setCalendarMonth(new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)).toISOString().slice(0, 10))} className="rounded border border-gray-200 p-1.5 text-gray-600"><ChevronRight size={15} /></button></div></div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-500">{weekdays.map(day => <span key={day} className="py-1">{day}</span>)}{Array.from({ length: monthOffset }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: monthDays }, (_, index) => {
        const date = `${calendarMonth.slice(0, 7)}-${String(index + 1).padStart(2, '0')}`;
        const departure = departuresByDate.get(date);
        const className = departure?.closed ? 'bg-red-100 text-red-800' : departure?.exception ? 'bg-amber-100 text-amber-900' : departure ? 'bg-primary-100 text-primary-800' : 'text-gray-400';
        return <button key={date} type="button" disabled={!departure} onClick={() => { if (departure) { onPreviewDate(date); openNew(date); } }} aria-label={`${date}${departure?.closed ? ', closed' : departure?.exception ? ', exception' : departure ? ', default departure' : ''}`} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs ${className} ${departure ? 'cursor-pointer hover:ring-2 hover:ring-primary-300' : 'cursor-default'}`}>{index + 1}</button>;
      })}</div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-600"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-primary-200" />Default dates</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-200" />Exception dates</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-200" />Closed dates</span></div>
    </div>
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    {panelOpen && <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onMouseDown={event => { if (event.target === event.currentTarget) setPanelOpen(false); }}>
      <aside aria-label={editingId ? 'Edit exception' : 'Add exception'} className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h3 className="text-base font-semibold text-gray-900">{editingId ? 'Edit exception' : 'Add exception'}</h3><p className="mt-1 text-xs text-gray-500">Only fill the values that differ from defaults.</p></div><button type="button" onClick={() => setPanelOpen(false)} aria-label="Close exception panel" className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button></div>
        <div className="flex-1 space-y-4 p-5">
          <label className={labelClass}>Applies to<select value={exceptionForm.type} onChange={event => setExceptionForm({ ...exceptionForm, type: event.target.value as DealExceptionType })} className={inputClass}><option value="single-date">Single date</option><option value="date-range">Date range</option><option value="weekday-range">Days of the week within a range</option></select></label>
          {exceptionForm.type === 'single-date' ? <label className={labelClass}>Date<input type="date" value={exceptionForm.date} onChange={event => setExceptionForm({ ...exceptionForm, date: event.target.value, startDate: event.target.value, endDate: event.target.value })} className={inputClass} /></label> : <>
            <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Range start<input type="date" value={exceptionForm.startDate} onChange={event => setExceptionForm({ ...exceptionForm, startDate: event.target.value })} className={inputClass} /></label><label className={labelClass}>Range end<input type="date" value={exceptionForm.endDate} onChange={event => setExceptionForm({ ...exceptionForm, endDate: event.target.value })} className={inputClass} /></label></div>
            {exceptionForm.type === 'weekday-range' && <fieldset><legend className={labelClass}>Weekdays</legend><div className="mt-2 flex flex-wrap gap-2">{weekdays.map((day, index) => <label key={day} className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-xs ${exceptionForm.daysOfWeek.includes(index) ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}><input type="checkbox" checked={exceptionForm.daysOfWeek.includes(index)} onChange={event => setExceptionForm({ ...exceptionForm, daysOfWeek: event.target.checked ? [...exceptionForm.daysOfWeek, index].sort() : exceptionForm.daysOfWeek.filter(item => item !== index) })} className="rounded border-gray-300 text-primary-600" />{day}</label>)}</div></fieldset>}
          </>}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-800"><input type="checkbox" checked={exceptionForm.closed} onChange={event => setExceptionForm({ ...exceptionForm, closed: event.target.checked })} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />No sales on these dates</label>
          {!exceptionForm.closed && <div className="space-y-3 rounded-lg border border-gray-200 p-3"><p className="text-xs font-semibold text-gray-700">Changed fields <span className="font-normal text-gray-500">(leave blank to use defaults)</span></p>
            <label className={labelClass}>Seats per departure<input type="number" min="0" step="1" placeholder={`${defaultSeats} default`} value={exceptionForm.seatsAvailable ?? ''} onChange={event => setExceptionForm({ ...exceptionForm, seatsAvailable: event.target.value === '' ? undefined : Number(event.target.value) })} className={inputClass} /></label>
            <label className={labelClass}>Return after (days)<input type="number" min="1" step="1" placeholder={`${schedule.returnDayOffset} default`} value={exceptionForm.returnDayOffset ?? ''} onChange={event => setExceptionForm({ ...exceptionForm, returnDayOffset: event.target.value === '' ? undefined : Number(event.target.value) })} className={inputClass} /></label>
            <label className={labelClass}>Adult price ({currency})<input type="number" min="0" step="0.01" placeholder={`${schedule.defaultAdultPrice} default`} value={exceptionForm.adultPriceOverride ?? ''} onChange={event => setExceptionForm({ ...exceptionForm, adultPriceOverride: event.target.value === '' ? undefined : Number(event.target.value) })} className={inputClass} /></label>
          </div>}
          <label className={labelClass}>Optional note<textarea rows={2} maxLength={240} value={exceptionForm.note} onChange={event => setExceptionForm({ ...exceptionForm, note: event.target.value })} className={inputClass} /></label>
          <p className="rounded-lg bg-gray-50 p-3 text-xs font-medium text-gray-700">This affects {getExceptionDepartureDates(schedule, exceptionForm).length} departures</p>
          {panelError && <p role="alert" className="text-xs text-red-600">{panelError}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 p-4"><button type="button" onClick={() => setPanelOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700">Cancel</button><button type="button" onClick={saveException} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Save exception</button></div>
      </aside>
    </div>}
  </section>;
}

function SearchResultPreview({ draft, date, minimumConnectionMinutes }: { draft: AirlineDealDraft; date: string; minimumConnectionMinutes: number }) {
  const outbound = draft.outboundJourney ?? blankJourney();
  const outboundMetrics = calculateJourneyMetrics(outbound, date, minimumConnectionMinutes);
  const previewDeal: AirlineDeal = { ...draft, id: 'preview', status: 'Active', createdAt: '', updatedAt: '' };
  const departure = draft.schedule
    ? getCustomerSearchDepartures(previewDeal).find(item => item.date === date)
      ?? generateDealDepartures(draft.schedule, { seatsAvailable: draft.seatsAvailable, adultPrice: draft.schedule.defaultAdultPrice, returnDayOffset: draft.schedule.returnDayOffset }).find(item => item.date === date)
    : undefined;
  const returnOffset = departure?.returnDayOffset ?? 7;
  const returnDate = shiftDate(date, returnOffset);
  const returnJourney = draft.returnJourney;
  const returnMetrics = returnJourney ? calculateJourneyMetrics(returnJourney, returnDate, minimumConnectionMinutes) : null;
  const first = outbound.segments[0];
  const last = outbound.segments[outbound.segments.length - 1];
  const adultPrice = departure?.adultPrice ?? (draft.fares.adult.baseFare ?? 0) + (draft.fares.adult.taxes ?? 0);

  const renderJourney = (label: string, journey: DealJourney, departureDate: string, metrics: ReturnType<typeof calculateJourneyMetrics>) => <div className="space-y-2">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label} · {departureDate || 'Date not selected'}</p>
    {journey.segments.map((segment, index) => <div key={segment.id}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border border-gray-100 bg-gray-50/70 p-3">
        <div><p className="font-semibold text-gray-900">{segment.departureTime || '--:--'}{segment.departureDayOffset > 0 ? ` +${segment.departureDayOffset}d` : ''}</p><p className="text-xs text-gray-600">{(getDealAirportLabel(segment.origin) ?? segment.origin) || 'Origin'}</p></div>
        <div className="text-center text-[11px] text-gray-500"><span className="block">{segment.airline || 'Airline'} · {segment.flightNumber || 'Flight'}</span><Plane size={15} className="mx-auto my-1 text-primary-600" /><span>{segment.cabin}</span></div>
        <div className="text-right"><p className="font-semibold text-gray-900">{segment.arrivalTime || '--:--'}{segment.arrivalDayOffset > 0 ? ` +${segment.arrivalDayOffset}d` : ''}</p><p className="text-xs text-gray-600">{(getDealAirportLabel(segment.destination) ?? segment.destination) || 'Destination'}</p></div>
        <div className="col-span-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">{segment.operatingAirline && <span>Operated by {segment.operatingAirline}</span>}{segment.aircraft && <span>{segment.aircraft}</span>}{segment.departureTerminal && <span>Dep terminal {segment.departureTerminal}</span>}{segment.arrivalTerminal && <span>Arr terminal {segment.arrivalTerminal}</span>}{segment.cabinBaggage && <span>{describeSegmentBaggage({ ...segment, checkedBaggage: undefined }).join(' · ')}</span>}{segment.checkedBaggage && <span>{describeSegmentBaggage({ ...segment, cabinBaggage: undefined }).join(' · ')}</span>}</div>
      </div>
      {index < journey.segments.length - 1 && <div className="my-2 ml-3 border-l-2 border-dashed border-gray-300 py-1 pl-3 text-xs text-gray-600">{formatDuration(metrics.connections[index]?.layoverMinutes)} connection at {getDealAirportLabel(segment.destination) ?? segment.destination}{metrics.connections[index]?.airportChange ? ` · airport change to ${metrics.connections[index]?.to}` : ''}{metrics.connections[index]?.overnight ? ' · overnight' : ''}{metrics.connections[index]?.over24Hours ? ' · over 24 hours' : ''}</div>}
    </div>)}
    <p className="text-xs text-gray-500">{metrics.stops} {metrics.stops === 1 ? 'stop' : 'stops'} · {formatDuration(metrics.totalMinutes)} · Arrival {metrics.arrivalDayOffset === null ? '' : metrics.arrivalDayOffset === 0 ? 'same day' : `+${metrics.arrivalDayOffset} day${metrics.arrivalDayOffset === 1 ? '' : 's'}`}</p>
  </div>;

  return <section className="space-y-3 rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-gray-900">Preview as search result</h3><p className="mt-1 text-xs text-gray-500">Customer-facing offer preview</p></div><span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase text-amber-800">Special offer</span></div>
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {draft.image && <img src={draft.image} alt="" className="h-36 w-full object-cover" />}
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold text-gray-900">{draft.title || 'Your deal title'}</h4><p className="mt-1 text-xs text-gray-500">{getDealAirportLabel(first?.origin ?? '') ?? first?.origin ?? 'Origin'} <ArrowRight size={12} className="mx-1 inline" /> {getDealAirportLabel(last?.destination ?? '') ?? last?.destination ?? 'Destination'} · {draft.tripType}</p></div><div className="text-right"><p className="text-xs text-gray-500">From</p><p className="text-lg font-bold text-gray-900">{money(adultPrice, draft.currency)}</p><p className="text-[11px] text-gray-500">per adult · taxes included</p></div></div>
        {renderJourney('Outbound', outbound, date, outboundMetrics)}
        {draft.tripType === 'Return' && returnJourney && returnMetrics && renderJourney('Return', returnJourney, returnDate, returnMetrics)}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3"><p className="text-xs text-gray-500">{draft.description || 'Deal description'}{date ? ` · Depart ${date}` : ''}</p><button type="button" disabled className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white opacity-60">Book now</button></div>
      </div>
    </div>
  </section>;
}

export default function AirlineDeals() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeDealId } = useParams();
  const [deals, setDeals] = useState<AirlineDeal[]>(getAirlineDeals);
  const routeDeal = routeDealId ? deals.find(deal => deal.id === routeDealId) ?? null : null;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DealStatus>('All');
  const [editingDeal, setEditingDeal] = useState<AirlineDeal | null>(() => routeDeal);
  const [draft, setDraft] = useState<AirlineDealDraft>(() => routeDeal ? {
    ...routeDeal,
    outboundJourney: routeDeal.outboundJourney ?? blankJourney(),
    returnJourney: routeDeal.tripType === 'Return' ? routeDeal.returnJourney ?? blankReturnJourney(routeDeal.outboundJourney, routeDeal.routes) : undefined,
    minimumConnectionMinutes: routeDeal.minimumConnectionMinutes ?? 60,
    schedule: routeDeal.schedule ?? blankSchedule(),
  } : blankDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [previewDate, setPreviewDate] = useState('');
  const scheduleDates = draft.schedule ? getScheduledDepartureDates(draft.schedule) : [];
  const selectedPreviewDate = scheduleDates.includes(previewDate) ? previewDate : scheduleDates[0] ?? '';
  const isEditor = location.pathname !== '/flights/deals' && location.pathname !== '/flights/deals/';

  const visibleDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deals.filter(deal => (statusFilter === 'All' || deal.status === statusFilter)
      && (!needle || `${deal.title} ${deal.airline} ${deal.flightNumber} ${deal.routes.map(route => `${getDealAirportLabel(route.origin) ?? route.origin} ${getDealAirportLabel(route.destination) ?? route.destination}`).join(' ')}`.toLowerCase().includes(needle)))
      .sort((left, right) => left.displayOrder - right.displayOrder || left.title.localeCompare(right.title));
  }, [deals, search, statusFilter]);

  const openNew = () => { setEditingDeal(null); setDraft(blankDraft()); setErrors({}); setPreviewDate(''); navigate('/flights/deals/new'); };
  const openEdit = (deal: AirlineDeal) => {
    setEditingDeal(deal);
    setDraft({
      ...deal,
      outboundJourney: deal.outboundJourney ?? blankJourney(),
      returnJourney: deal.tripType === 'Return' ? deal.returnJourney ?? blankReturnJourney(deal.outboundJourney, deal.routes) : undefined,
      minimumConnectionMinutes: deal.minimumConnectionMinutes ?? 60,
      schedule: deal.schedule ?? blankSchedule(),
    });
    setErrors({});
    setPreviewDate('');
    navigate(`/flights/deals/${encodeURIComponent(deal.id)}/edit`);
  };
  const updateDraft = <K extends keyof AirlineDealDraft>(key: K, value: AirlineDealDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
    setErrors(current => { const next = { ...current }; delete next[key]; delete next.activeDetails; return next; });
  };
  const updateFare = (passenger: 'adult' | 'child' | 'infant', part: keyof DealFare, value: number | undefined) => {
    setDraft(current => ({ ...current, fares: { ...current.fares, [passenger]: { ...current.fares[passenger], [part]: value } } }));
    setErrors(current => { const next = { ...current }; delete next[`fare-${passenger}-${part}`]; delete next.activeDetails; return next; });
  };
  const updateFareCondition = <K extends keyof DealFareConditions>(key: K, value: DealFareConditions[K]) => {
    setDraft(current => ({ ...current, fareConditions: { ...current.fareConditions, [key]: value } }));
    setErrors(current => { const next = { ...current }; delete next.activeDetails; return next; });
  };
  const updateJourney = (journey: 'outboundJourney' | 'returnJourney', value: DealJourney) => {
    setDraft(current => ({ ...current, [journey]: value }));
    setErrors(current => { const next = { ...current }; delete next[journey]; return next; });
  };
  const updateSchedule = (updates: Partial<DealSchedule>) => {
    setDraft(current => ({ ...current, schedule: { ...(current.schedule ?? blankSchedule()), ...updates } }));
    setErrors(current => { const next = { ...current }; delete next.schedule; return next; });
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateDraft(draft, editingDeal?.id);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    const outboundSegments = draft.outboundJourney?.segments ?? [];
    const firstSegment = outboundSegments[0];
    const lastSegment = outboundSegments[outboundSegments.length - 1];
    const updated = saveAirlineDeal({
      ...draft,
      airline: firstSegment?.airline ?? draft.airline,
      cabin: firstSegment?.cabin ?? draft.cabin,
      routes: outboundSegments.map(segment => ({ origin: segment.origin, destination: segment.destination })),
      flightNumber: firstSegment?.flightNumber ?? draft.flightNumber,
      departureTime: firstSegment?.departureTime ?? draft.departureTime,
      arrivalTime: lastSegment?.arrivalTime ?? draft.arrivalTime,
      stops: Math.max(0, outboundSegments.length - 1),
      baggage: Array.from(new Set(outboundSegments.flatMap(segment => describeSegmentBaggage(segment)))).join(' · '),
      travelStartDate: draft.schedule?.dateRangeStart ?? '',
      travelEndDate: draft.schedule?.dateRangeEnd ?? '',
      seatsAvailable: draft.seatsAvailable,
      schedule: draft.schedule ?? blankSchedule(),
    }, editingDeal?.id);
    setDeals(updated);
    setNotice(editingDeal ? 'Deal updated.' : 'Deal created.');
    navigate('/flights/deals');
  };
  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrors(current => ({ ...current, image: 'Choose an image file.' })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(current => ({ ...current, image: 'Image must be 5 MB or smaller.' })); return; }
    const reader = new FileReader();
    reader.onload = () => { updateDraft('image', String(reader.result ?? '')); setErrors(current => { const next = { ...current }; delete next.image; return next; }); };
    reader.readAsDataURL(file);
  };
  const handleDelete = (deal: AirlineDeal) => {
    if (!window.confirm(`Delete “${deal.title}”?`)) return;
    setDeals(deleteAirlineDeal(deal.id));
    setNotice('Deal deleted.');
  };

  return <div className="space-y-6 animate-in fade-in duration-300">
    {!isEditor && <>
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-xl font-bold text-gray-800">Airline Deals</h1><p className="mt-1 text-sm text-gray-500">{deals.length} deals configured</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search deals" className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500 sm:w-52" /></label>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'All' | DealStatus)} aria-label="Filter deals by status" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500"><option value="All">All statuses</option>{statuses.map(status => <option key={status}>{status}</option>)}</select>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Add deal</button>
      </div>
    </div>

    {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15} /></button></div>}

    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-soft">
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm text-gray-600">
        <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500"><tr>
          <th className="px-4 py-4">Image</th><th className="px-4 py-4">Deal</th><th className="px-4 py-4">Airline</th><th className="px-4 py-4">Route</th><th className="px-4 py-4">Travel dates</th><th className="px-4 py-4">Price from</th><th className="px-4 py-4">Default seats</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-center">Featured</th><th className="px-4 py-4 text-right">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-gray-50">
          {visibleDeals.map(deal => <tr key={deal.id} className="align-middle hover:bg-gray-50/60">
            <td className="px-4 py-3">{deal.image ? <img src={deal.image} alt={deal.imageAlt || deal.title} className="h-12 w-16 rounded-md object-cover" /> : <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gray-100 text-gray-400"><Plane size={18} /></div>}</td>
            <td className="max-w-56 px-4 py-3"><span className="block truncate font-semibold text-gray-900" title={deal.title}>{deal.title}</span><span className="text-xs text-gray-500">{deal.flightNumber} · {deal.cabin}</span></td>
            <td className="px-4 py-3">{deal.airline}</td>
            <td className="px-4 py-3">{deal.routes.map(route => `${route.origin} → ${route.destination}`).join(' · ')}</td>
            <td className="px-4 py-3">{deal.travelStartDate} – {deal.travelEndDate}</td>
            <td className="px-4 py-3 font-semibold text-gray-900">{money(deal.schedule?.defaultAdultPrice ?? (deal.fares.adult.baseFare ?? 0) + (deal.fares.adult.taxes ?? 0), deal.currency)}</td>
            <td className="px-4 py-3">{deal.seatsAvailable}</td>
            <td className="px-4 py-3"><div className="flex flex-col items-start gap-1"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(deal.status)}`}>{deal.status}</span>{getMissingDealDetails(deal).length > 0 && <span title={`Required to activate: ${getMissingDealDetails(deal).join(', ')}`} className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">Missing details</span>}</div></td>
            <td className="px-4 py-3 text-center"><button type="button" role="switch" aria-checked={deal.featured} aria-label={`${deal.featured ? 'Remove from' : 'Feature on'} website: ${deal.title}`} onClick={() => setDeals(updateAirlineDeal(deal.id, { featured: !deal.featured }))} className={`inline-flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${deal.featured ? 'bg-primary-600' : 'bg-gray-300'}`}><span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${deal.featured ? 'translate-x-4' : ''}`} /></button></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1">
              <button type="button" onClick={() => openEdit(deal)} title="Edit deal" aria-label={`Edit ${deal.title}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-primary-600"><Edit2 size={14} /></button>
              <button type="button" onClick={() => { setDeals(duplicateAirlineDeal(deal.id)); setNotice('Deal duplicated as a draft.'); }} title="Duplicate deal" aria-label={`Duplicate ${deal.title}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-primary-600"><Copy size={14} /></button>
              <button type="button" disabled={!['Active', 'Paused'].includes(deal.status)} onClick={() => setDeals(updateAirlineDeal(deal.id, { status: deal.status === 'Active' ? 'Paused' : 'Active' }))} title={deal.status === 'Active' ? 'Pause deal' : 'Resume deal'} aria-label={`${deal.status === 'Active' ? 'Pause' : 'Resume'} ${deal.title}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-35"><Pause size={14} /></button>
              <button type="button" onClick={() => handleDelete(deal)} title="Delete deal" aria-label={`Delete ${deal.title}`} className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
            </div></td>
          </tr>)}
          {!visibleDeals.length && <tr><td colSpan={10} className="px-4 py-14 text-center text-sm text-gray-500">No deals match these filters.</td></tr>}
        </tbody>
      </table></div>
    </div>
    </>}

    {isEditor && <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-xl font-bold text-gray-800">{editingDeal ? 'Edit airline deal' : routeDealId ? 'Deal not found' : 'Add airline deal'}</h1><p className="mt-1 text-sm text-gray-500">{editingDeal ? 'Update itinerary, schedule, and offer details.' : 'Configure the itinerary, departures, and offer details.'}</p></div>
        <button type="button" onClick={() => navigate('/flights/deals')} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><ArrowLeft size={16} /> Back to deals</button>
      </div>
      {routeDealId && !editingDeal ? <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This deal no longer exists.</div> : <form onSubmit={submit} noValidate className="space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-soft">
        <section className="space-y-4"><h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">Deal details</h3>
          <label className={labelClass}>Title<input value={draft.title} onChange={event => updateDraft('title', event.target.value)} className={inputClass} />{errors.title && <span className="mt-1 block text-xs text-red-600">{errors.title}</span>}</label>
          <label className={labelClass}>Short description<textarea value={draft.description} onChange={event => updateDraft('description', event.target.value)} rows={2} maxLength={240} className={inputClass} />{errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description}</span>}</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Trip type<select value={draft.tripType} onChange={event => { const tripType = event.target.value as DealTripType; updateDraft('tripType', tripType); setDraft(current => ({ ...current, returnJourney: tripType === 'Return' ? current.returnJourney ?? blankJourney() : undefined })); }} className={inputClass}><option>One-way</option><option>Return</option></select></label>
            <label className={labelClass}>Status<select value={draft.status} onChange={event => { const status = event.target.value as DealStatus; setDraft(current => ({ ...current, status })); setErrors(status === 'Active' ? validateDraft({ ...draft, status }, editingDeal?.id) : current => { const next = { ...current }; delete next.activeDetails; return next; }); }} className={inputClass}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
          </div>
          {errors.activeDetails && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{errors.activeDetails}</p>}
        </section>

        <ScheduleEditor schedule={draft.schedule ?? blankSchedule()} currency={draft.currency} defaultSeats={draft.seatsAvailable} error={errors.schedule} onScheduleChange={updateSchedule} onDefaultSeatsChange={seats => { updateDraft('seatsAvailable', seats); setErrors(current => { const next = { ...current }; delete next.schedule; return next; }); }} onPreviewDate={setPreviewDate} onDefaultPriceChange={price => updateSchedule({ defaultAdultPrice: price })} />

        <section className="space-y-6 rounded-lg border border-gray-200 p-4">
          <label className={labelClass}>Minimum connection time (minutes)<input type="number" min="0" step="1" value={draft.minimumConnectionMinutes ?? 60} onChange={event => updateDraft('minimumConnectionMinutes', Number(event.target.value))} className={inputClass} />{errors.minimumConnectionMinutes && <span className="mt-1 block text-xs text-red-600">{errors.minimumConnectionMinutes}</span>}</label>
          <JourneyEditor label="Outbound" journey={draft.outboundJourney ?? blankJourney()} departureDate={selectedPreviewDate} minimumConnectionMinutes={draft.minimumConnectionMinutes ?? 60} error={errors.outboundJourney} onChange={journey => updateJourney('outboundJourney', journey)} />
          {draft.tripType === 'Return' && <JourneyEditor label="Return" journey={draft.returnJourney ?? blankJourney()} departureDate={shiftDate(selectedPreviewDate, draft.schedule ? generateDealDepartures(draft.schedule, { seatsAvailable: draft.seatsAvailable, adultPrice: draft.schedule.defaultAdultPrice, returnDayOffset: draft.schedule.returnDayOffset }).find(item => item.date === selectedPreviewDate)?.returnDayOffset ?? draft.schedule.returnDayOffset : 7)} minimumConnectionMinutes={draft.minimumConnectionMinutes ?? 60} error={errors.returnJourney} onChange={journey => updateJourney('returnJourney', journey)} />}
        </section>

        <section className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><h3 className="text-sm font-semibold text-gray-900">Passenger fares</h3><p className="mt-1 text-[10px] text-gray-500">Base fare and taxes are required for every passenger type before activation.</p></div><label className={labelClass}>Currency<select value={draft.currency} onChange={event => updateDraft('currency', event.target.value)} className={inputClass}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></label></div>
          <div className="space-y-3">{(['adult', 'child', 'infant'] as const).map(passenger => <FareFields key={passenger} passenger={passenger} fare={draft.fares[passenger]} currency={draft.currency} onChange={updateFare} errors={errors} />)}</div>
        </section>

        <section className="space-y-4"><div><h3 className="text-sm font-semibold text-gray-900">Fare conditions</h3><p className="mt-1 text-[10px] text-gray-500">Required before activation. These conditions are shown to customers.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Refundable<select value={draft.fareConditions?.refundable ?? ''} onChange={event => updateFareCondition('refundable', (event.target.value || undefined) as DealFareConditionType | undefined)} className={inputClass}><option value="">Choose condition</option><option value="yes">Yes</option><option value="no">No</option><option value="with-fee">With a fee</option></select></label>
            {draft.fareConditions?.refundable === 'with-fee' && <label className={labelClass}>Refund fee ({draft.currency})<input type="number" min="0" step="0.01" value={draft.fareConditions.refundFee ?? ''} onChange={event => updateFareCondition('refundFee', event.target.value === '' ? undefined : Number(event.target.value))} className={inputClass} /></label>}
            <label className={labelClass}>Changes allowed<select value={draft.fareConditions?.changesAllowed ?? ''} onChange={event => updateFareCondition('changesAllowed', (event.target.value || undefined) as DealFareConditionType | undefined)} className={inputClass}><option value="">Choose condition</option><option value="yes">Yes</option><option value="no">No</option><option value="with-fee">With a fee</option></select></label>
            {draft.fareConditions?.changesAllowed === 'with-fee' && <label className={labelClass}>Change fee ({draft.currency})<input type="number" min="0" step="0.01" value={draft.fareConditions.changeFee ?? ''} onChange={event => updateFareCondition('changeFee', event.target.value === '' ? undefined : Number(event.target.value))} className={inputClass} /></label>}
          </div>
          <label className={labelClass}>Fare notes<textarea rows={3} value={draft.fareConditions?.notes ?? ''} onChange={event => updateFareCondition('notes', event.target.value)} className={inputClass} /></label>
        </section>

        <section className="space-y-4"><h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">Availability and sales</h3>
          <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Booking cut-off (hours)<input type="number" min="0" step="1" value={draft.bookingCutOffHours} onChange={event => updateDraft('bookingCutOffHours', Number(event.target.value))} className={inputClass} />{errors.bookingCutOffHours && <span className="mt-1 block text-xs text-red-600">{errors.bookingCutOffHours}</span>}</label><label className={labelClass}>Display order<input type="number" min="0" step="1" value={draft.displayOrder} onChange={event => updateDraft('displayOrder', Number(event.target.value))} className={inputClass} />{errors.displayOrder && <span className="mt-1 block text-xs text-red-600">{errors.displayOrder}</span>}</label></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Sales start<input type="date" value={draft.salesStartDate} onChange={event => updateDraft('salesStartDate', event.target.value)} className={inputClass} /></label><label className={labelClass}>Sales end<input type="date" value={draft.salesEndDate} onChange={event => updateDraft('salesEndDate', event.target.value)} className={inputClass} /></label></div>
          {errors.salesDates && <p className="text-xs text-red-600">{errors.salesDates}</p>}
        </section>

        <section className="space-y-4"><h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">Website and internal details</h3>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.featured} onChange={event => updateDraft('featured', event.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /> Featured on website</label>
          <label className={labelClass}>Deal image <span className="text-[10px] text-gray-400">Required for Active</span><input type="file" accept="image/*" onChange={event => handleImage(event.target.files?.[0])} className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs`} />{errors.image && <span className="mt-1 block text-xs text-red-600">{errors.image}</span>}</label>
          {draft.image && <div className="relative w-fit"><img src={draft.image} alt={draft.imageAlt || 'Deal image preview'} className="h-32 w-56 rounded-lg border border-gray-200 object-cover" /><button type="button" onClick={() => updateDraft('image', '')} aria-label="Remove image" title="Remove image" className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow hover:text-red-600"><X size={15} /></button></div>}
          <label className={labelClass}>Image alt text <span className="text-[10px] text-gray-400">Required for Active</span><input value={draft.imageAlt ?? ''} onChange={event => updateDraft('imageAlt', event.target.value)} className={inputClass} />{errors.imageAlt && <span className="mt-1 block text-xs text-red-600">{errors.imageAlt}</span>}</label>
          <label className={labelClass}>Internal notes<textarea value={draft.internalNotes} onChange={event => updateDraft('internalNotes', event.target.value)} rows={3} className={inputClass} /></label>
        </section>

        <SearchResultPreview draft={draft} date={selectedPreviewDate} minimumConnectionMinutes={draft.minimumConnectionMinutes ?? 60} />

        <div className="flex justify-end gap-2 border-t border-gray-100 bg-white py-4"><button type="button" onClick={() => navigate('/flights/deals')} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">{editingDeal ? 'Save changes' : 'Create deal'}</button></div>
      </form>
    }</div>}
  </div>;
}