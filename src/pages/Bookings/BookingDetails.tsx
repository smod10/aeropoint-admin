import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle2, Pencil, RotateCcw } from 'lucide-react';
import { mockBookings } from '../../data/mockBookings';
import { findManagedBooking, updateManagedBooking } from '../../utils/bookingStorage';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import type { ManagedBooking } from '../../types/booking';
import { useCurrency } from '../../context/CurrencyContext';
import type { Currency } from '../../context/CurrencyContext';

type StatusOverride = { bookingStatus?: string; paymentStatus?: string; price?: string; customerName?: string; customerEmail?: string };

export default function BookingDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { convertFromAndFormat } = useCurrency();
  const [booking, setBooking] = useState<ManagedBooking | undefined>(() => findManagedBooking(id));
  const mockBooking = booking ? undefined : mockBookings.find(item => item.invoice === id);
  const mockOverrides = JSON.parse(localStorage.getItem('aeropoint-booking-overrides') || '{}') as Record<string, StatusOverride>;
  const actorRole = getCurrentActorRole();
  const canManage = canManageTeam(actorRole);
  const bookingStatus = booking?.bookingStatus ?? mockOverrides[id]?.bookingStatus ?? mockBooking?.booking.split('\n')[0] ?? '';
  const paymentStatus = booking?.paymentStatus ?? mockOverrides[id]?.paymentStatus ?? mockBooking?.payment ?? '';
  const customer = booking?.customerName ?? mockOverrides[id]?.customerName ?? mockBooking?.user.split('\n')[0] ?? '';
  const email = booking?.customerEmail ?? mockOverrides[id]?.customerEmail ?? mockBooking?.user.split('\n')[1] ?? '';
  const type = booking?.bookingType ?? mockBooking?.moduleType ?? '';

  const saveStatus = (updates: StatusOverride) => {
    if (booking) {
      const updated = updateManagedBooking(booking.bookingId, {
        bookingStatus: (updates.bookingStatus ?? booking.bookingStatus) as ManagedBooking['bookingStatus'],
        paymentStatus: (updates.paymentStatus ?? booking.paymentStatus) as ManagedBooking['paymentStatus'],
      });
      setBooking(updated);
      return;
    }
    const current = JSON.parse(localStorage.getItem('aeropoint-booking-overrides') || '{}') as Record<string, StatusOverride>;
    current[id] = { ...current[id], ...updates };
    localStorage.setItem('aeropoint-booking-overrides', JSON.stringify(current));
    window.location.reload();
  };

  if (!booking && !mockBooking) return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Booking not found.</div>;

  const details = booking?.details ?? mockBooking?.details ?? {};
  const displayValue = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value);
  const editUrl = booking ? `/bookings/create/${booking.bookingType}?edit=${encodeURIComponent(booking.bookingId)}` : `/bookings/edit/${mockBooking?.invoice}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><Link to="/bookings" aria-label="Back to bookings" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link><div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Bookings / {type}</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Booking {booking?.bookingId ?? mockBooking?.invoice}</h1></div></div>
        {canManage && <div className="flex flex-wrap gap-2"><button onClick={() => navigate(editUrl)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Pencil size={15} /> Edit</button><button onClick={() => saveStatus({ bookingStatus: 'Confirmed' })} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"><CheckCircle2 size={15} /> Confirm</button><button onClick={() => saveStatus({ bookingStatus: 'Cancelled' })} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"><Ban size={15} /> Cancel</button></div>}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Customer</p><p className="mt-2 font-medium text-gray-900">{customer}</p><p className="mt-1 text-xs text-gray-500">{email || (booking?.guestBooking ? 'Guest booking' : '')}</p></div>
        <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Booking type</p><p className="mt-2 font-medium capitalize text-gray-900">{type === 'stays' ? 'Stay' : type}</p></div>
        <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Booking status</p>{canManage ? <select aria-label="Booking status" value={bookingStatus} onChange={event => saveStatus({ bookingStatus: event.target.value })} className="mt-1.5 w-full rounded border border-gray-200 px-2 py-1.5 text-sm"><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select> : <p className="mt-2 font-medium text-gray-900">{bookingStatus}</p>}</div>
        <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Payment status</p>{canManage ? <select aria-label="Payment status" value={paymentStatus} onChange={event => saveStatus({ paymentStatus: event.target.value })} className="mt-1.5 w-full rounded border border-gray-200 px-2 py-1.5 text-sm"><option>Pending</option><option>Paid</option><option>Refunded</option><option>UNPAID</option></select> : <p className="mt-2 font-medium text-gray-900">{paymentStatus}</p>}</div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4"><div><h2 className="text-base font-semibold text-gray-900">Booking details</h2><p className="mt-1 text-sm text-gray-500">Created {new Date(booking?.createdAt ?? mockBooking?.createdAt ?? '').toLocaleString()}</p></div><p className="text-xl font-semibold text-gray-900">{booking ? convertFromAndFormat(booking.amount, booking.currency as Currency) : convertFromAndFormat(Number(mockOverrides[id]?.price ?? mockBooking?.price ?? 0), 'USD')}</p></div>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">{Object.entries(details).map(([key, value]) => <div key={key} className="border-b border-gray-100 pb-3"><dt className="text-xs font-medium capitalize text-gray-500">{key === 'hotel' ? 'Stay' : key.replaceAll(/([A-Z])/g, ' $1')}</dt><dd className="mt-1 break-words text-sm text-gray-900">{displayValue(value)}</dd></div>)}</dl>
        {booking?.guestBooking && <p className="mt-4 flex items-center gap-2 text-sm text-amber-700"><RotateCcw size={15} /> This booking was recorded as a guest and is not attached to an account.</p>}
      </section>
    </div>
  );
}