import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, FileText, TicketCheck } from 'lucide-react';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { readManagedBookings, updateDealTicketing } from '../../utils/bookingStorage';
import type { DealTicketingStatus, ETicketFile, ManagedBooking } from '../../types/booking';

const inputClass = 'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
const statuses: DealTicketingStatus[] = ['Pending ticketing', 'Ticketed', 'Cannot ticket'];

function isDealBooking(booking: ManagedBooking): boolean {
  return booking.bookingType === 'flights' && Boolean(booking.dealId || booking.details.airlineDealId);
}

function passengerCountOf(booking: ManagedBooking): number {
  return Math.max(booking.passengers?.length ?? 0, booking.passengerCount ?? (Number(booking.details.passengerCount) || 0));
}

function deadlineText(deadline: string | undefined, now: number): { label: string; overdue: boolean } {
  if (!deadline) return { label: 'No deadline set', overdue: false };
  const timestamp = Date.parse(deadline);
  if (!Number.isFinite(timestamp)) return { label: 'Invalid deadline', overdue: false };
  const difference = timestamp - now;
  const minutes = Math.floor(Math.abs(difference) / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;
  const countdown = [days > 0 ? `${days}d` : '', hours > 0 ? `${hours}h` : '', `${remainingMinutes}m`].filter(Boolean).join(' ');
  return difference < 0
    ? { label: `Overdue by ${countdown}`, overdue: true }
    : { label: `Due in ${countdown}`, overdue: false };
}

function statusClass(status: DealTicketingStatus): string {
  if (status === 'Ticketed') return 'bg-emerald-100 text-emerald-800';
  if (status === 'Cannot ticket') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

async function readTicketFile(file: File): Promise<ETicketFile> {
  if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
    throw new Error(`${file.name}: upload a PDF or image file.`);
  }
  if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name}: e-ticket files must be 2 MB or smaller.`);
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve({ name: file.name, mimeType: file.type, dataUrl: reader.result })
      : reject(new Error(`Unable to read ${file.name}.`));
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function DealBookingDetails({ booking, canManage, now, onSaved }: { booking: ManagedBooking; canManage: boolean; now: number; onSaved: (booking: ManagedBooking) => void }) {
  const passengerCount = passengerCountOf(booking);
  const currentStatus = booking.ticketingStatus ?? 'Pending ticketing';
  const [reference, setReference] = useState(booking.bookingReference ?? '');
  const [ticketNumbers, setTicketNumbers] = useState(() => Array.from({ length: passengerCount }, (_, index) => booking.ticketNumbers?.[index] ?? ''));
  const [eTicketFiles, setETicketFiles] = useState(booking.eTicketFiles ?? []);
  const [cannotTicketReason, setCannotTicketReason] = useState(booking.cannotTicketReason ?? '');
  const [notice, setNotice] = useState('');
  const deadline = deadlineText(booking.ticketingDeadline, now);

  const persistTicketing = (status: DealTicketingStatus) => {
    try {
      const updated = updateDealTicketing(booking.bookingId, { status, bookingReference: reference, ticketNumbers, eTicketFiles, cannotTicketReason });
      onSaved(updated);
      setNotice(status === 'Pending ticketing' ? 'Ticket details saved.' : `Ticketing status updated to ${status}.`);
    } catch (error) {
      const quotaExceeded = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      setNotice(quotaExceeded
        ? 'Browser storage is full. Ticketing changes and attachments remain on this page; remove stored data or reduce attachments, then retry.'
        : error instanceof Error ? error.message : 'Unable to save ticketing details.');
    }
  };

  const appendFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const newFiles = await Promise.all(Array.from(files).map(readTicketFile));
      setETicketFiles(current => [...current, ...newFiles]);
      setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to read e-ticket files.');
    }
  };

  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div><Link to="/bookings/deals" className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700"><ArrowLeft size={16} /> Deal Bookings</Link><p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{booking.details.dealTitle ?? 'Airline deal'}</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Booking {booking.bookingId}</h1></div>
      <div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(currentStatus)}`}>{currentStatus}</span><span className={`inline-flex items-center gap-1 text-sm font-medium ${deadline.overdue && currentStatus === 'Pending ticketing' ? 'text-red-700' : 'text-gray-600'}`}><Clock3 size={15} />{deadline.label}</span></div>
    </header>

    {notice && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</p>}

    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Customer</p><p className="mt-2 font-medium text-gray-900">{booking.customerName}</p><p className="mt-1 text-xs text-gray-500">{booking.customerEmail || 'No email recorded'}</p></div>
      <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Passengers</p><p className="mt-2 font-medium text-gray-900">{passengerCount}</p><p className="mt-1 text-xs text-gray-500">Payment status: {booking.paymentStatus}</p></div>
      <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">Ticketing deadline</p><p className={`mt-2 font-medium ${deadline.overdue && currentStatus === 'Pending ticketing' ? 'text-red-700' : 'text-gray-900'}`}>{booking.ticketingDeadline ? new Date(booking.ticketingDeadline).toLocaleString() : 'Not set'}</p><p className="mt-1 text-xs text-gray-500">{booking.bookingReference ? `PNR: ${booking.bookingReference}` : 'PNR not entered'}</p></div>
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><TicketCheck size={18} className="text-primary-700" /><div><h2 className="font-semibold text-gray-900">Ticketing details</h2><p className="mt-1 text-xs text-gray-500">Ticketing status is independent of payment status.</p></div></div>
      {canManage ? <div className="space-y-5">
        <label className="block text-sm font-medium text-gray-700">Airline booking reference (PNR)<input value={reference} onChange={event => setReference(event.target.value)} className={inputClass} /></label>
        <fieldset><legend className="text-sm font-medium text-gray-700">Ticket numbers <span className="text-xs font-normal text-gray-500">One per passenger ({passengerCount})</span></legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">{Array.from({ length: passengerCount }, (_, index) => <label key={index} className="text-xs font-medium text-gray-600">Passenger {index + 1}<input value={ticketNumbers[index] ?? ''} onChange={event => setTicketNumbers(current => current.map((ticket, ticketIndex) => ticketIndex === index ? event.target.value : ticket))} className={inputClass} /></label>)}</div>
        </fieldset>
        <label className="block text-sm font-medium text-gray-700">E-ticket files <span className="text-xs font-normal text-gray-500">PDF or image, up to 2 MB per file</span><input type="file" accept="application/pdf,image/*" multiple onChange={event => { void appendFiles(event.target.files); event.target.value = ''; }} className={inputClass} /></label>
        {eTicketFiles.length > 0 && <ul className="space-y-2">{eTicketFiles.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"><a href={file.dataUrl} download={file.name} className="inline-flex min-w-0 items-center gap-2 truncate text-primary-700 hover:underline"><FileText size={15} />{file.name}</a><button type="button" onClick={() => setETicketFiles(current => current.filter((_, fileIndex) => fileIndex !== index))} className="text-xs font-medium text-red-600 hover:underline">Remove</button></li>)}</ul>}
        <label className="block text-sm font-medium text-gray-700">Reason if unable to ticket<textarea rows={3} value={cannotTicketReason} onChange={event => setCannotTicketReason(event.target.value)} className={inputClass} /></label>
        {booking.ticketedBy && <p className="text-xs text-gray-500">Ticketed by {booking.ticketedBy}{booking.ticketedAt ? ` · ${new Date(booking.ticketedAt).toLocaleString()}` : ''}</p>}
        {booking.cannotTicketReason && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Cannot ticket reason: {booking.cannotTicketReason}</p>}
        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          <button type="button" onClick={() => persistTicketing(currentStatus)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Save ticket details</button>
          <button type="button" onClick={() => persistTicketing('Ticketed')} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Mark Ticketed</button>
          <button type="button" onClick={() => persistTicketing('Cannot ticket')} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Cannot ticket</button>
        </div>
      </div> : <div className="space-y-3 text-sm text-gray-700"><p>PNR: {booking.bookingReference || '—'}</p><p>Ticket numbers: {booking.ticketNumbers?.join(', ') || '—'}</p><p>Reason: {booking.cannotTicketReason || '—'}</p>{(booking.eTicketFiles ?? []).map((file, index) => <a key={`${file.name}-${index}`} href={file.dataUrl} download={file.name} className="block text-primary-700 hover:underline">{file.name}</a>)}</div>}
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-gray-900">Ticketing activity</h2>
      {booking.ticketingActivity?.length ? <ol className="mt-4 space-y-3">{[...booking.ticketingActivity].reverse().map((entry, index) => <li key={`${entry.at}-${index}`} className="border-l-2 border-primary-200 pl-4"><p className="text-sm text-gray-800"><span className="font-medium">{entry.actor}</span> changed status from <span className="font-medium">{entry.fromStatus}</span> to <span className="font-medium">{entry.toStatus}</span></p><p className="mt-1 text-xs text-gray-500">{new Date(entry.at).toLocaleString()}</p></li>)}</ol> : <p className="mt-3 text-sm text-gray-500">No ticketing status changes recorded.</p>}
    </section>
  </div>;
}

export default function DealBookings() {
  const { id } = useParams();
  const canManage = canManageTeam(getCurrentActorRole());
  const [bookings, setBookings] = useState<ManagedBooking[]>(readManagedBookings);
  const [statusFilter, setStatusFilter] = useState<'All' | DealTicketingStatus>('All');
  const [now, setNow] = useState(0);
  const booking = id ? bookings.find(item => item.bookingId === id && isDealBooking(item)) : undefined;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    const initialUpdate = window.setTimeout(() => setNow(Date.now()), 0);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(initialUpdate);
    };
  }, []);

  const filteredBookings = useMemo(() => bookings
    .filter(isDealBooking)
    .filter(item => statusFilter === 'All' || (item.ticketingStatus ?? 'Pending ticketing') === statusFilter)
    .sort((left, right) => (left.ticketingDeadline ?? '').localeCompare(right.ticketingDeadline ?? '')), [bookings, statusFilter]);


  if (id && !booking) return <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Deal booking not found.</div>;

  if (booking) return <DealBookingDetails key={booking.bookingId} booking={booking} canManage={canManage} now={now} onSaved={updated => setBookings(current => current.map(item => item.bookingId === updated.bookingId ? updated : item))} />;

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-bold text-gray-900">Deal Bookings</h1><p className="mt-1 text-sm text-gray-500">{filteredBookings.length} deal bookings</p></div><label className="text-sm font-medium text-gray-600">Ticketing status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'All' | DealTicketingStatus)} className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2"><option>All</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label></header>
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-soft"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm text-gray-600"><thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Deal</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Ticketing</th><th className="px-4 py-3">Deadline</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredBookings.map(item => {
      const status = item.ticketingStatus ?? 'Pending ticketing';
      const deadline = deadlineText(item.ticketingDeadline, now);
      return <tr key={item.bookingId} className="hover:bg-gray-50"><td className="px-4 py-3"><Link to={`/bookings/deals/${encodeURIComponent(item.bookingId)}`} className="font-semibold text-primary-700 hover:underline">{item.bookingId}</Link></td><td className="px-4 py-3">{item.details.dealTitle ?? 'Airline deal'}</td><td className="px-4 py-3">{item.customerName}</td><td className="px-4 py-3">{item.paymentStatus}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{status}</span></td><td className={`px-4 py-3 font-medium ${deadline.overdue && status === 'Pending ticketing' ? 'bg-red-50 text-red-800' : 'text-gray-700'}`}>{deadline.label}</td></tr>;
    })}{!filteredBookings.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No deal bookings match this status.</td></tr>}</tbody></table></div></section>
  </div>;
}
