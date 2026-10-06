import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

type StayBooking = {
  id: string;
  guest: string;
  hotel: string;
  location: string;
  address: string;
  room: string;
  checkIn: string;
  checkOut: string;
  amount: string;
  status: string;
  paymentStatus: string;
  provider: string;
  email: string;
  phone: string;
  rooms: number;
  adults: number;
  children: number;
  ratePerNight: number;
  currency: string;
  managed: true;
};

type StayForm = Omit<StayBooking, 'id' | 'amount' | 'provider' | 'managed' | 'rooms' | 'adults' | 'children' | 'ratePerNight'> & {
  rooms: string;
  adults: string;
  children: string;
  ratePerNight: string;
};

const emptyForm: StayForm = {
  guest: '', hotel: '', location: '', address: '', room: '', checkIn: '', checkOut: '',
  status: 'Pending', paymentStatus: 'Unpaid', email: '', phone: '', rooms: '1', adults: '1',
  children: '0', ratePerNight: '', currency: 'USD',
};

function getNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.ceil((new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) / 86400000));
}

function nextDate(date: string) {
  if (!date) return undefined;
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(year, month - 1, day + 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

export default function HotelEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const savedBookings = JSON.parse(localStorage.getItem('aeropoint-hotel-bookings') || '[]') as StayBooking[];
  const existing = savedBookings.find(booking => booking.id === id);
  const [form, setForm] = useState<StayForm>(() => existing ? {
    guest: existing.guest, hotel: existing.hotel, location: existing.location, address: existing.address,
    room: existing.room, checkIn: existing.checkIn, checkOut: existing.checkOut, status: existing.status,
    paymentStatus: existing.paymentStatus, email: existing.email, phone: existing.phone,
    rooms: String(existing.rooms), adults: String(existing.adults), children: String(existing.children),
    ratePerNight: String(existing.ratePerNight), currency: existing.currency,
  } : emptyForm);

  const nights = getNights(form.checkIn, form.checkOut);
  const total = nights * Number(form.rooms || 0) * Number(form.ratePerNight || 0);
  const update = <K extends keyof StayForm>(key: K, value: StayForm[K]) => setForm(current => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const booking: StayBooking = {
      ...form,
      id: existing?.id ?? `HTL-${Date.now()}`,
      amount: `${form.currency} ${total.toFixed(2)}`,
      provider: 'Manual booking',
      rooms: Number(form.rooms),
      adults: Number(form.adults),
      children: Number(form.children),
      ratePerNight: Number(form.ratePerNight),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      managed: true,
    };
    const nextBookings = existing
      ? savedBookings.map(item => item.id === existing.id ? booking : item)
      : [booking, ...savedBookings];
    localStorage.setItem('aeropoint-hotel-bookings', JSON.stringify(nextBookings));
    navigate('/hotels');
  };

  if (!isNew && !existing) {
    return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Hotel booking not found.</div>;
  }

  const inputClass = 'mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/hotels" aria-label="Back to hotel bookings" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link>
          <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Hotels / Stay booking</p><h1 className="mt-1 text-2xl font-bold text-gray-900">{isNew ? 'Create stay booking' : 'Edit stay booking'}</h1></div>
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save booking</button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Guest details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Guest full name<input required value={form.guest} onChange={event => update('guest', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Email<input required type="email" value={form.email} onChange={event => update('email', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Phone<input required type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} className={inputClass} /></label>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Hotel and stay</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Hotel name<input required value={form.hotel} onChange={event => update('hotel', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">City and country<input required value={form.location} onChange={event => update('location', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Street address<textarea required rows={2} value={form.address} onChange={event => update('address', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Room type<input required value={form.room} onChange={event => update('room', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Rooms<input required min="1" type="number" value={form.rooms} onChange={event => update('rooms', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Check-in<input required type="date" value={form.checkIn} onChange={event => update('checkIn', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Check-out<input required min={nextDate(form.checkIn)} type="date" value={form.checkOut} onChange={event => update('checkOut', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Adults<input required min="1" type="number" value={form.adults} onChange={event => update('adults', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Children<input required min="0" type="number" value={form.children} onChange={event => update('children', event.target.value)} className={inputClass} /></label>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Pricing and booking status</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Currency<select value={form.currency} onChange={event => update('currency', event.target.value)} className={inputClass}><option value="USD">USD</option><option value="NGN">NGN</option><option value="GBP">GBP</option><option value="EUR">EUR</option></select></label>
          <label className="text-sm font-medium text-gray-700">Price per room / night<input required min="0" step="0.01" type="number" value={form.ratePerNight} onChange={event => update('ratePerNight', event.target.value)} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Booking status<select value={form.status} onChange={event => update('status', event.target.value)} className={inputClass}><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></label>
          <label className="text-sm font-medium text-gray-700">Payment status<select value={form.paymentStatus} onChange={event => update('paymentStatus', event.target.value)} className={inputClass}><option>Unpaid</option><option>Paid</option><option>Refunded</option></select></label>
          <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2"><p className="text-xs font-medium uppercase text-gray-500">Stay total</p><p className="mt-1 text-xl font-semibold text-gray-900">{form.currency} {total.toFixed(2)}</p><p className="mt-1 text-xs text-gray-500">{nights} night{nights === 1 ? '' : 's'} × {form.rooms || 0} room{Number(form.rooms) === 1 ? '' : 's'} × {form.currency} {Number(form.ratePerNight || 0).toFixed(2)}</p></div>
        </div>
      </section>
    </form>
  );
}