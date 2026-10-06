import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, UserRound } from 'lucide-react';
import { mockPackages } from '../../data/mockPackages';
import { mockUsers } from '../../data/mockUsers';
import { findManagedBooking, saveManagedBooking } from '../../utils/bookingStorage';
import { readHotelListings } from '../../utils/hotelStorage';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import type { BookingType, ManagedBooking } from '../../types/booking';

type Customer = { id: number; firstName: string; lastName: string; email: string; phone: string };
type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[]; rows?: number };

const typeLabels: Record<BookingType, string> = {
  flights: 'Flight', stays: 'Hotel', tours: 'Tour / Package', visa: 'Visa', umrah: 'Umrah',
};

const fieldsByType: Record<BookingType, Field[]> = {
  flights: [
    { key: 'passengerName', label: 'Passenger full name', required: true },
    { key: 'from', label: 'Departure city / airport', required: true },
    { key: 'to', label: 'Destination city / airport', required: true },
    { key: 'flightNumber', label: 'Flight number' },
    { key: 'departureDate', label: 'Departure date', type: 'date', required: true },
    { key: 'returnDate', label: 'Return date', type: 'date' },
    { key: 'baggage', label: 'Baggage allowance', options: ['Cabin only', '1 checked bag', '2 checked bags', 'Other'] },
    { key: 'specialRequests', label: 'Special requests', rows: 3 },
  ],
  stays: [
    { key: 'hotel', label: 'Hotel / property', required: true },
    { key: 'room', label: 'Room type', required: true },
    { key: 'checkIn', label: 'Check-in', type: 'date', required: true },
    { key: 'checkOut', label: 'Check-out', type: 'date', required: true },
    { key: 'adults', label: 'Adults', type: 'number', required: true },
    { key: 'children', label: 'Children', type: 'number' },
    { key: 'specialRequests', label: 'Special requests', rows: 3 },
  ],
  tours: [
    { key: 'package', label: 'Tour / package', required: true },
    { key: 'travelDate', label: 'Travel date', type: 'date', required: true },
    { key: 'travellers', label: 'Number of travellers', type: 'number', required: true },
    { key: 'requirements', label: 'Requirements', rows: 3 },
  ],
  visa: [
    { key: 'applicantName', label: 'Applicant full name', required: true },
    { key: 'destination', label: 'Destination country', required: true },
    { key: 'visaType', label: 'Visa type', options: ['Tourist', 'Business', 'Transit', 'Student', 'Work', 'Other'], required: true },
    { key: 'travelDate', label: 'Planned travel date', type: 'date', required: true },
    { key: 'passportNumber', label: 'Passport number', required: true },
    { key: 'requiredDocuments', label: 'Required documents / notes', rows: 3 },
  ],
  umrah: [
    { key: 'package', label: 'Umrah / Hajj package', required: true },
    { key: 'departureDate', label: 'Departure date', type: 'date', required: true },
    { key: 'returnDate', label: 'Return date', type: 'date', required: true },
    { key: 'travellers', label: 'Number of travellers', type: 'number', required: true },
    { key: 'makkahAccommodation', label: 'Makkah accommodation' },
    { key: 'madinahAccommodation', label: 'Madinah accommodation' },
    { key: 'transport', label: 'Transport requirements' },
    { key: 'requirements', label: 'Additional requirements', rows: 3 },
  ],
};

const inputClass = 'mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

function readCustomers(): Customer[] {
  const saved = JSON.parse(localStorage.getItem('aeropoint-booking-customers') || '[]') as Customer[];
  const existing = mockUsers.filter(user => user.role === 'customer').map(user => ({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }));
  return [...saved, ...existing];
}

function makeBookingId() {
  return `AEP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export default function BookingCreate() {
  const { bookingType: routeType } = useParams();
  const navigate = useNavigate();
  const canManage = canManageTeam(getCurrentActorRole());
  const [searchParams] = useSearchParams();
  const bookingType = (routeType || 'flights') as BookingType;
  const editId = searchParams.get('edit');
  const existing = editId ? findManagedBooking(editId) : undefined;
  const customers = useMemo(readCustomers, []);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new' | 'guest'>(existing?.guestBooking ? 'guest' : existing?.customerId ? 'existing' : 'existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(existing?.customerId ?? null);
  const [customerName, setCustomerName] = useState(existing?.customerName ?? '');
  const [customerEmail, setCustomerEmail] = useState(existing?.customerEmail ?? '');
  const [customerPhone, setCustomerPhone] = useState(existing?.customerPhone ?? '');
  const [details, setDetails] = useState<Record<string, string>>(() => {
    if (existing) return existing.details;
    const selectedHotel = searchParams.get('hotel');
    return selectedHotel ? { hotel: selectedHotel } : {};
  });
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [currency, setCurrency] = useState(existing?.currency || localStorage.getItem('aeropoint-base-currency') || 'NGN');
  const [bookingStatus, setBookingStatus] = useState<ManagedBooking['bookingStatus']>(existing?.bookingStatus ?? 'Pending');
  const [paymentStatus, setPaymentStatus] = useState<ManagedBooking['paymentStatus']>(existing?.paymentStatus ?? 'Pending');
  const [documentNames, setDocumentNames] = useState(existing?.details.documentNames || '');

  const filteredCustomers = customers.filter(customer => `${customer.firstName} ${customer.lastName} ${customer.email}`.toLowerCase().includes(customerSearch.toLowerCase()));
  const packages = mockPackages.filter(item => bookingType === 'umrah' ? item.module === 'umrah' : item.module === 'tour');
  const hotels = readHotelListings().filter(hotel => hotel.status === 'Published');
  const activeFields = fieldsByType[bookingType] ?? fieldsByType.flights;

  const selectCustomer = (id: number) => {
    const customer = customers.find(item => item.id === id);
    if (!customer) return;
    setCustomerId(customer.id);
    setCustomerName(`${customer.firstName} ${customer.lastName}`);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone);
  };

  const updateDetail = (key: string, value: string) => setDetails(current => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let linkedCustomerId = customerMode === 'existing' ? customerId : null;
    if (customerMode === 'new') {
      const savedCustomers = JSON.parse(localStorage.getItem('aeropoint-booking-customers') || '[]') as Customer[];
      linkedCustomerId = Math.max(30, ...customers.map(customer => customer.id), ...savedCustomers.map(customer => customer.id)) + 1;
      const [firstName, ...lastNameParts] = customerName.trim().split(/\s+/);
      savedCustomers.unshift({ id: linkedCustomerId, firstName, lastName: lastNameParts.join(' '), email: customerEmail, phone: customerPhone });
      localStorage.setItem('aeropoint-booking-customers', JSON.stringify(savedCustomers));
    }
    const bookingId = existing?.bookingId ?? makeBookingId();
    const booking: ManagedBooking = {
      id: existing?.id ?? bookingId,
      bookingId,
      bookingType,
      customerId: linkedCustomerId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      guestBooking: customerMode === 'guest',
      amount: Number(amount),
      currency,
      bookingStatus,
      paymentStatus,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      details: Object.fromEntries(Object.entries({ ...details, documentNames }).filter(([, value]) => value.trim())),
    };
    saveManagedBooking(booking);
    navigate(`/bookings/view/${booking.bookingId}`);
  };

  const renderField = (field: Field) => {
    const packagesForType = packages.map(item => item.title);
    const selectedHotel = hotels.find(hotel => hotel.name === details.hotel);
    const options = field.key === 'package' ? packagesForType : field.key === 'hotel' ? hotels.map(item => item.name) : field.key === 'room' && bookingType === 'stays' ? selectedHotel?.rooms?.map(room => room.name) ?? [] : field.options;
    return (
      <label key={field.key} className={`text-sm font-medium text-gray-700 ${field.rows ? 'sm:col-span-2' : ''}`}>
        {field.label}{field.required && ' *'}
        {field.key === 'requiredDocuments' ? <>
          <textarea rows={field.rows || 3} value={details[field.key] || ''} onChange={event => updateDetail(field.key, event.target.value)} className={inputClass} />
          <input type="file" multiple onChange={event => setDocumentNames(Array.from(event.target.files || []).map(file => file.name).join(', '))} className="mt-2 block w-full text-xs text-gray-600" />
          {documentNames && <span className="mt-1 block text-xs text-gray-500">Selected: {documentNames}</span>}
        </> : field.rows ? <textarea rows={field.rows} required={field.required} value={details[field.key] || ''} onChange={event => updateDetail(field.key, event.target.value)} className={inputClass} /> : options ? <>
          <input list={`${bookingType}-${field.key}-options`} required={field.required} type={field.type || 'text'} value={details[field.key] || ''} onChange={event => updateDetail(field.key, event.target.value)} className={inputClass} />
          <datalist id={`${bookingType}-${field.key}-options`}>{options.map(option => <option key={option} value={option} />)}</datalist>
        </> : <input required={field.required} type={field.type || 'text'} min={field.type === 'number' ? '0' : undefined} value={details[field.key] || ''} onChange={event => updateDetail(field.key, event.target.value)} className={inputClass} />}
      </label>
    );
  };

  if (!['flights', 'stays', 'tours', 'visa', 'umrah'].includes(bookingType)) {
    return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Choose a supported booking type.</div>;
  }
  if (!canManage) return <div role="alert" className="rounded-lg border border-red-200 bg-white p-8 text-center text-gray-600">You do not have permission to create or edit bookings.</div>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><Link to="/bookings" aria-label="Back to bookings" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Bookings / {typeLabels[bookingType]}</p><h1 className="mt-1 text-2xl font-bold text-gray-900">{existing ? 'Edit' : 'Create'} {typeLabels[bookingType]} booking</h1></div></div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> {existing ? 'Save changes' : 'Create booking'}</button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3"><UserRound size={18} className="mt-0.5 text-primary-600" /><div><h2 className="text-sm font-semibold text-gray-900">Customer selection</h2><p className="mt-1 text-xs text-gray-500">Attach an existing customer, create an account, or record a guest booking.</p></div></div>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Customer booking type">
          {(['existing', 'new', 'guest'] as const).map(mode => <button type="button" key={mode} onClick={() => setCustomerMode(mode)} className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize ${customerMode === mode ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{mode === 'existing' ? 'Existing customer' : mode === 'new' ? 'New customer account' : 'Guest booking'}</button>)}
        </div>
        {customerMode === 'existing' && <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Search customers<input value={customerSearch} onChange={event => setCustomerSearch(event.target.value)} placeholder="Name or email" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Select customer<select required value={customerId ?? ''} onChange={event => selectCustomer(Number(event.target.value))} className={inputClass}><option value="">Choose customer</option>{filteredCustomers.map(customer => <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName} · {customer.email}</option>)}</select></label>
          {customerName && <p className="text-xs text-gray-500 sm:col-span-2">Selected: {customerName} · {customerEmail}</p>}
        </div>}
        {(customerMode === 'new' || customerMode === 'guest') && <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Full name<input required value={customerName} onChange={event => setCustomerName(event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Email<input required type="email" value={customerEmail} onChange={event => setCustomerEmail(event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Phone<input required type="tel" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} className={inputClass} /></label>
        </div>}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">{typeLabels[bookingType]} details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{activeFields.map(renderField)}</div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Payment and status</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Amount<input required min="0" step="0.01" type="number" value={amount} onChange={event => setAmount(event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Currency<select value={currency} onChange={event => setCurrency(event.target.value)} className={inputClass}><option>NGN</option><option>USD</option><option>GBP</option><option>EUR</option></select></label>
          <label className="text-sm font-medium text-gray-700">Booking status<select value={bookingStatus} onChange={event => setBookingStatus(event.target.value as ManagedBooking['bookingStatus'])} className={inputClass}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></label>
          <label className="text-sm font-medium text-gray-700">Payment status<select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value as ManagedBooking['paymentStatus'])} className={inputClass}><option>Pending</option><option>Paid</option><option>Refunded</option></select></label>
        </div>
      </section>
    </form>
  );
}