import { useEffect, useMemo, useState } from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import apiClient from '../../services/apiClient';
import { mockBookings } from '../../data/mockBookings';
import { useCurrency } from '../../context/CurrencyContext';
import type { Currency } from '../../context/CurrencyContext';

type DatePeriod = 'today' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
type BookingType = 'all' | 'flights' | 'hotels' | 'tours' | 'visa' | 'umrah' | 'bus';
type BookingStatus = 'all' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
type PaymentStatus = 'all' | 'paid' | 'pending' | 'refunded';

type ReportSummary = {
  totalBookings: number;
  totalBookingValue: number;
  totalPaid: number;
  totalRefunded: number;
  netRevenue: number;
};

type RevenueRow = {
  bookingType: string;
  bookings: number;
  bookingValue: number;
  paid: number;
  refunded: number;
  netRevenue: number;
};

type BookingBreakdown = {
  totalBookings: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  refunded: number;
  pending: number;
};

type MonthlyRevenue = { month: string; bookings: number; revenue: number };

type ReportData = {
  summary: ReportSummary;
  revenueByBookingType: RevenueRow[];
  bookingBreakdown: BookingBreakdown;
  monthlyRevenue: MonthlyRevenue[];
  currency?: string;
};

const emptyReport: ReportData = {
  summary: { totalBookings: 0, totalBookingValue: 0, totalPaid: 0, totalRefunded: 0, netRevenue: 0 },
  revenueByBookingType: [],
  bookingBreakdown: { totalBookings: 0, confirmed: 0, completed: 0, cancelled: 0, refunded: 0, pending: 0 },
  monthlyRevenue: [],
};

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDateRange(period: DatePeriod, customFrom: string, customTo: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'custom') return { dateFrom: customFrom, dateTo: customTo };
  if (period === 'today') return { dateFrom: isoDate(today), dateTo: isoDate(today) };
  if (period === 'thisMonth') return { dateFrom: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)), dateTo: isoDate(today) };
  if (period === 'lastMonth') return { dateFrom: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)), dateTo: isoDate(new Date(now.getFullYear(), now.getMonth(), 0)) };
  return { dateFrom: isoDate(new Date(now.getFullYear(), 0, 1)), dateTo: isoDate(today) };
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function buildReportFromBookings(dateFrom: string, dateTo: string, bookingType: BookingType, bookingStatus: BookingStatus, paymentStatus: PaymentStatus, currency: Currency, exchangeRates: Record<Currency, number>): ReportData {
  const bookings = mockBookings.filter(booking => {
    const moduleType = booking.moduleType === 'stays' ? 'hotels' : booking.moduleType;
    const status = booking.booking.split('\n')[0].toLowerCase();
    const payment = booking.payment === 'PAID' ? 'paid' : booking.payment === 'REFUNDED' ? 'refunded' : 'pending';
    const date = booking.createdAt.slice(0, 10);
    return (bookingType === 'all' || moduleType === bookingType)
      && (bookingStatus === 'all' || status === bookingStatus)
      && (paymentStatus === 'all' || payment === paymentStatus)
      && (!dateFrom || date >= dateFrom)
      && (!dateTo || date <= dateTo);
  });

  const byType = new Map<string, RevenueRow>();
  const byMonth = new Map<string, MonthlyRevenue>();
  let totalBookingValue = 0;
  let totalPaid = 0;
  let totalRefunded = 0;
  let confirmed = 0;
  let completed = 0;
  let cancelled = 0;
  let refunded = 0;
  let pending = 0;

  bookings.forEach(booking => {
    const amount = (Number(booking.price) || 0) * exchangeRates.USD / exchangeRates[currency];
    const moduleType = booking.moduleType;
    const status = booking.booking.split('\n')[0].toLowerCase();
    const isPaid = booking.payment === 'PAID';
    const isRefunded = booking.payment === 'REFUNDED';
    const monthKey = booking.createdAt.slice(0, 7);
    const monthDate = new Date(`${monthKey}-01T00:00:00`);

    totalBookingValue += amount;
    if (isPaid) totalPaid += amount;
    if (isRefunded) totalRefunded += amount;
    if (status === 'confirmed') confirmed += 1;
    if (status === 'completed') completed += 1;
    if (status === 'cancelled') cancelled += 1;
    if (isRefunded) refunded += 1;
    if (status === 'pending' || booking.payment === 'UNPAID') pending += 1;

    const typeRow = byType.get(moduleType) ?? { bookingType: moduleType, bookings: 0, bookingValue: 0, paid: 0, refunded: 0, netRevenue: 0 };
    typeRow.bookings += 1;
    typeRow.bookingValue += amount;
    if (isPaid) typeRow.paid += amount;
    if (isRefunded) typeRow.refunded += amount;
    typeRow.netRevenue = typeRow.paid - typeRow.refunded;
    byType.set(moduleType, typeRow);

    const month = byMonth.get(monthKey) ?? { month: monthDate.toLocaleDateString(undefined, { month: 'short' }), bookings: 0, revenue: 0 };
    month.bookings += 1;
    if (isPaid) month.revenue += amount;
    byMonth.set(monthKey, month);
  });

  return {
    summary: { totalBookings: bookings.length, totalBookingValue, totalPaid, totalRefunded, netRevenue: totalPaid - totalRefunded },
    revenueByBookingType: [...byType.values()].sort((left, right) => left.bookingType.localeCompare(right.bookingType)),
    bookingBreakdown: { totalBookings: bookings.length, confirmed, completed, cancelled, refunded, pending },
    monthlyRevenue: [...byMonth.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, row]) => row),
    currency,
  };
}

export default function RevenueReport() {
  const [period, setPeriod] = useState<DatePeriod>('thisYear');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>('all');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('all');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('all');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'bookings'>('revenue');
  const [report, setReport] = useState<ReportData>(emptyReport);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [error, setError] = useState('');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const { currency: baseCurrency, exchangeRates } = useCurrency();
  const dateRange = useMemo(() => getDateRange(period, customFrom, customTo), [period, customFrom, customTo]);
  const currency = baseCurrency || report.currency || 'NGN';
  const formatMoney = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value || 0);
  const periodLabel = dateRange.dateFrom && dateRange.dateTo ? `${dateRange.dateFrom} to ${dateRange.dateTo}` : 'Custom date range';

  useEffect(() => {
    if (period === 'custom' && (!customFrom || !customTo)) {
      setIsLoading(false);
      setError('Choose both dates to run this report.');
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    apiClient.get('/reports', {
      params: {
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        bookingType,
        bookingStatus,
        paymentStatus,
      },
      signal: controller.signal,
    }).then(response => {
      const payload = response.data?.data ?? response.data;
      setReport(payload as ReportData);
      setUsingSampleData(false);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setReport(buildReportFromBookings(dateRange.dateFrom, dateRange.dateTo, bookingType, bookingStatus, paymentStatus, baseCurrency, exchangeRates));
      setUsingSampleData(true);
      setError('');
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [baseCurrency, bookingStatus, bookingType, dateRange.dateFrom, dateRange.dateTo, exchangeRates, paymentStatus, period, customFrom, customTo, refreshCount]);

  const filterDescription = `Period: ${periodLabel}; Booking type: ${bookingType}; Booking status: ${bookingStatus}; Payment status: ${paymentStatus}`;

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Aeropoint Express', 'Bookings and Revenue Report'],
      ['Reporting period', periodLabel],
      ['Applied filters', filterDescription],
      ['Date generated', new Date().toLocaleString()],
      [],
      ['Summary', 'Value'],
      ['Total Bookings', report.summary.totalBookings],
      ['Total Booking Value', formatMoney(report.summary.totalBookingValue)],
      ['Total Paid', formatMoney(report.summary.totalPaid)],
      ['Total Refunded', formatMoney(report.summary.totalRefunded)],
      ['Net Revenue', formatMoney(report.summary.netRevenue)],
      [],
      ['Revenue by Booking Type', 'Bookings', 'Booking Value', 'Paid', 'Refunded', 'Net Revenue'],
      ...report.revenueByBookingType.map(row => [row.bookingType, row.bookings, formatMoney(row.bookingValue), formatMoney(row.paid), formatMoney(row.refunded), formatMoney(row.netRevenue)]),
      [],
      ['Booking Breakdown', 'Count'],
      ['Total bookings', report.bookingBreakdown.totalBookings],
      ['Confirmed', report.bookingBreakdown.confirmed],
      ['Completed', report.bookingBreakdown.completed],
      ['Cancelled', report.bookingBreakdown.cancelled],
      ['Refunded', report.bookingBreakdown.refunded],
      ['Pending', report.bookingBreakdown.pending],
      [],
      ['Monthly Revenue', 'Bookings', 'Revenue'],
      ...report.monthlyRevenue.map(row => [row.month, row.bookings, formatMoney(row.revenue)]),
    ];
    const content = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aeropoint-booking-revenue-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const metrics = [
    ['Total Bookings', String(report.summary.totalBookings)],
    ['Total Booking Value', formatMoney(report.summary.totalBookingValue)],
    ['Total Paid', formatMoney(report.summary.totalPaid)],
    ['Total Refunded', formatMoney(report.summary.totalRefunded)],
    ['Net Revenue', formatMoney(report.summary.netRevenue)],
  ];
  const breakdown = [
    ['Total bookings', report.bookingBreakdown.totalBookings],
    ['Confirmed', report.bookingBreakdown.confirmed],
    ['Completed', report.bookingBreakdown.completed],
    ['Cancelled', report.bookingBreakdown.cancelled],
    ['Refunded', report.bookingBreakdown.refunded],
    ['Pending', report.bookingBreakdown.pending],
  ];

  return (
    <div className="space-y-6">
      <style>{'@media print { .report-controls { display: none !important; } .report-shell { border: 0 !important; box-shadow: none !important; } body { background: white !important; } }'}</style>
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Booking & Revenue</h1><p className="mt-1 text-sm text-gray-500">{periodLabel} · Generated {new Date().toLocaleDateString()}</p></div>
        <div className="report-controls flex flex-wrap gap-2">
          <button onClick={() => window.print()} disabled={isLoading || Boolean(error)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"><Printer size={16} /> Export PDF</button>
          <button onClick={exportCsv} disabled={isLoading || Boolean(error)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"><Download size={16} /> Export CSV</button>
        </div>
      </header>

      <section className="report-controls grid gap-4 border-b border-gray-200 pb-5 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-semibold uppercase text-gray-500">Date range<select value={period} onChange={event => setPeriod(event.target.value as DatePeriod)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="today">Today</option><option value="thisMonth">This Month</option><option value="lastMonth">Last Month</option><option value="thisYear">This Year</option><option value="custom">Custom Date Range</option></select></label>
        {period === 'custom' ? <>
          <label className="text-xs font-semibold uppercase text-gray-500">From<input type="date" value={customFrom} onChange={event => setCustomFrom(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-800" /></label>
          <label className="text-xs font-semibold uppercase text-gray-500">To<input type="date" min={customFrom || undefined} value={customTo} onChange={event => setCustomTo(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-800" /></label>
        </> : <div className="self-end pb-2 text-sm text-gray-500 lg:col-span-2">{periodLabel}</div>}
        <label className="text-xs font-semibold uppercase text-gray-500">Booking type<select value={bookingType} onChange={event => setBookingType(event.target.value as BookingType)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="all">All</option><option value="flights">Flights</option><option value="hotels">Stays</option><option value="tours">Tours / Packages</option><option value="visa">Visa</option><option value="umrah">Umrah</option><option value="bus">Bus</option></select></label>
        <label className="text-xs font-semibold uppercase text-gray-500">Booking status<select value={bookingStatus} onChange={event => setBookingStatus(event.target.value as BookingStatus)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="all">All</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select></label>
        <label className="text-xs font-semibold uppercase text-gray-500">Payment status<select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value as PaymentStatus)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal normal-case text-gray-800"><option value="all">All</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="refunded">Refunded</option></select></label>
      </section>

      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button onClick={() => setRefreshCount(count => count + 1)} aria-label="Retry report" className="report-controls inline-flex items-center gap-1 font-semibold"><RefreshCw size={14} /> Retry</button></div>}
      {isLoading && <p role="status" className="text-sm text-gray-500">Loading report data…</p>}
      {usingSampleData && <p role="status" className="text-xs text-gray-500">Showing report totals generated from the booking records currently available in this workspace.</p>}
      <p className="text-xs text-gray-500">Applied filters: {filterDescription}. Paid totals include successful payments only; net revenue subtracts refunds.</p>

      <div className="report-shell grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value]) => <article key={label} className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-2 text-xl font-semibold text-gray-900">{value}</p></article>)}
      </div>

      <section className="report-shell border-y border-gray-200 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-gray-900">Monthly trend</h2><p className="mt-1 text-xs text-gray-500">{chartMetric === 'revenue' ? 'Revenue' : 'Number of bookings'} by month</p></div><div className="report-controls inline-flex rounded-lg border border-gray-200 p-1"><button onClick={() => setChartMetric('revenue')} className={`rounded-md px-3 py-1.5 text-sm ${chartMetric === 'revenue' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}>Revenue</button><button onClick={() => setChartMetric('bookings')} className={`rounded-md px-3 py-1.5 text-sm ${chartMetric === 'bookings' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}>Bookings</button></div></div>
        <div className="h-64 w-full" aria-label={`Monthly ${chartMetric} chart`}><ResponsiveContainer width="100%" height="100%"><BarChart data={report.monthlyRevenue} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e5e7eb" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={value => chartMetric === 'revenue' ? `${currency} ${value}` : value} /><Tooltip formatter={value => chartMetric === 'revenue' ? formatMoney(Number(value)) : Number(value)} /><Bar dataKey={chartMetric} fill="#0d6efd" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>

      <section className="report-shell border-b border-gray-200 pb-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Revenue by booking type</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-gray-200 text-xs uppercase text-gray-500"><tr><th className="py-3 pr-4">Booking Type</th><th className="py-3 px-3 text-right">Bookings</th><th className="py-3 px-3 text-right">Booking Value</th><th className="py-3 px-3 text-right">Paid</th><th className="py-3 px-3 text-right">Refunded</th><th className="py-3 pl-3 text-right">Net Revenue</th></tr></thead><tbody className="divide-y divide-gray-100">{report.revenueByBookingType.map(row => <tr key={row.bookingType}><td className="py-3 pr-4 font-medium capitalize text-gray-900">{row.bookingType}</td><td className="py-3 px-3 text-right text-gray-700">{row.bookings}</td><td className="py-3 px-3 text-right text-gray-700">{formatMoney(row.bookingValue)}</td><td className="py-3 px-3 text-right text-gray-700">{formatMoney(row.paid)}</td><td className="py-3 px-3 text-right text-gray-700">{formatMoney(row.refunded)}</td><td className="py-3 pl-3 text-right font-semibold text-gray-900">{formatMoney(row.netRevenue)}</td></tr>)}{!report.revenueByBookingType.length && <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-500">No booking-type data for these filters.</td></tr>}</tbody></table></div>
      </section>

      <section className="report-shell pb-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Booking breakdown</h2>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 xl:grid-cols-6">{breakdown.map(([label, value]) => <div key={label} className="border-t border-gray-200 py-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-semibold text-gray-900">{value}</p></div>)}</div>
      </section>

    </div>
  );
}