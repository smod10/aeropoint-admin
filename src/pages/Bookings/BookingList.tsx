import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Columns, Edit2, Eye, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import { mockBookings } from '../../data/mockBookings'; 
import { useCurrency } from '../../context/CurrencyContext';
import { readManagedBookings } from '../../utils/bookingStorage';
import type { BookingType } from '../../types/booking';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';

type BookingColumn = 'invoice' | 'module' | 'booking' | 'payment' | 'price' | 'customer' | 'ref' | 'createdAt';
type BookingSortKey = BookingColumn;

type BookingRow = {
  id: string;
  invoice: string;
  moduleType: string;
  moduleName: string;
  booking: string;
  payment: string;
  price: string;
  earning: string;
  user: string;
  ref: string;
  createdAt: string;
  managed: boolean;
  currency: string;
};

const creationTypes: { type: BookingType; label: string; path: string }[] = [
  { type: 'flights', label: 'Flight', path: 'flights' },
  { type: 'stays', label: 'Stay', path: 'stays' },
  { type: 'tours', label: 'Tour / Package', path: 'tours' },
  { type: 'visa', label: 'Visa', path: 'visa' },
  { type: 'umrah', label: 'Umrah', path: 'umrah' },
];

export default function BookingList() {
  const navigate = useNavigate();
  const { moduleType } = useParams(); 
  const { convertFromAndFormat } = useCurrency();
  const canManage = canManageTeam(getCurrentActorRole());
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  
  // Pagination & Filter States
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<BookingSortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<BookingColumn, boolean>>({
    invoice: true,
    module: true,
    booking: true,
    payment: true,
    price: true,
    customer: true,
    ref: false,
    createdAt: true,
  });

  // Reset to page 1 whenever the module type (URL) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [moduleType]);

  // 1. Filter the data based on module type
  const bookingOverrides = JSON.parse(localStorage.getItem('aeropoint-booking-overrides') || '{}') as Record<string, { bookingStatus?: string; paymentStatus?: string; price?: string; customerName?: string; customerEmail?: string }>;
  const bookings: BookingRow[] = [
    ...mockBookings.map(booking => ({
      ...booking,
      id: String(booking.id),
      booking: bookingOverrides[booking.invoice]?.bookingStatus ?? booking.booking,
      payment: bookingOverrides[booking.invoice]?.paymentStatus ?? booking.payment,
      price: bookingOverrides[booking.invoice]?.price ?? booking.price,
      user: `${bookingOverrides[booking.invoice]?.customerName ?? booking.user.split('\n')[0]}\n${bookingOverrides[booking.invoice]?.customerEmail ?? booking.user.split('\n')[1]}`,
      managed: false,
      currency: 'USD',
    })),
    ...readManagedBookings().map(booking => ({
      id: booking.bookingId,
      invoice: booking.bookingId,
      moduleType: booking.bookingType,
      moduleName: `${booking.bookingType === 'stays' ? 'Stay' : booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}\nManual booking`,
      booking: booking.bookingStatus.toUpperCase(),
      payment: booking.paymentStatus.toUpperCase(),
      price: String(booking.amount),
      earning: '0',
      user: `${booking.customerName}${booking.customerEmail ? `\n${booking.customerEmail}` : ''}`,
      ref: booking.guestBooking ? 'Guest booking' : booking.customerId ? `Customer #${booking.customerId}` : 'New customer',
      createdAt: booking.createdAt,
      managed: true,
      currency: booking.currency,
    })),
  ];
  const filteredBookings = moduleType
    ? bookings.filter(booking => booking.moduleType === (moduleType === 'hotels' ? 'stays' : moduleType))
    : bookings;

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((left, right) => {
      const leftValue = sortKey === 'invoice' ? left.invoice
        : sortKey === 'module' ? left.moduleType
        : sortKey === 'booking' ? left.booking
        : sortKey === 'payment' ? left.payment
        : sortKey === 'price' ? Number(left.price)
        : sortKey === 'customer' ? left.user
        : sortKey === 'ref' ? left.ref
        : left.createdAt;

      const rightValue = sortKey === 'invoice' ? right.invoice
        : sortKey === 'module' ? right.moduleType
        : sortKey === 'booking' ? right.booking
        : sortKey === 'payment' ? right.payment
        : sortKey === 'price' ? Number(right.price)
        : sortKey === 'customer' ? right.user
        : sortKey === 'ref' ? right.ref
        : right.createdAt;

      if (sortKey === 'price') {
        return sortDirection === 'asc'
          ? Number(left.price) - Number(right.price)
          : Number(right.price) - Number(left.price);
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [filteredBookings, sortDirection, sortKey]);

  // 2. Calculate Pagination Math
  const totalItems = sortedBookings.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  // 3. Slice the data for the current page
  const paginatedBookings = sortedBookings.slice(startIndex, endIndex);

  // Dynamic Handlers
  const handleRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing rows per page
  };

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(e.target.value);
  };

  const createBooking = () => {
    const directType = creationTypes.find(item => item.path === moduleType);
    if (directType) navigate(`/bookings/create/${directType.type}`);
    else setIsTypePickerOpen(true);
  };

  const pageTitle = moduleType 
    ? `${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Bookings` 
    : 'All Bookings';

  // Generate an array of page numbers to render the pagination buttons
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visibleColumnCount = 3 + Object.values(visibleColumns).filter(Boolean).length;

  const toggleColumn = (column: BookingColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const handleSort = (key: BookingSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: BookingSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-primary-600" />
      : <ArrowDown size={12} className="text-primary-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Top Filters */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {totalItems} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canManage && <button onClick={createBooking} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><Plus size={16} /> Create New Booking</button>}
          
          {/* Module Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
            <span className="text-gray-500"></span>
            <select 
              value={moduleType ? `/bookings/type/${moduleType}` : '/bookings'} 
              onChange={handleModuleChange}
              className="bg-transparent font-medium outline-none cursor-pointer"
            >
              <option value="/bookings">All Bookings</option>
              <option value="/bookings/type/flights">Flights</option>
              <option value="/bookings/type/stays">Stays</option>
              <option value="/bookings/type/tours">Tours</option>
              <option value="/bookings/type/visa">Visa</option>
              <option value="/bookings/type/umrah">Umrah</option>
              <option value="/bookings/type/bus">Bus</option>
            </select>
          </div>

          {/* Top Rows Per Page Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
            <span className="text-gray-500">Show</span>
            <select 
              value={rowsPerPage} 
              onChange={handleRowsChange}
              className="bg-transparent font-medium outline-none cursor-pointer"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnMenuOpen(prev => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
                {[
                  { key: 'invoice', label: 'Booking ID' },
                  { key: 'module', label: 'Booking Type' },
                  { key: 'booking', label: 'Booking Status' },
                  { key: 'payment', label: 'Payment Status' },
                  { key: 'price', label: 'Amount' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'ref', label: 'Booking Reference' },
                  { key: 'createdAt', label: 'Date' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key as BookingColumn]}
                      onChange={() => toggleColumn(col.key as BookingColumn)}
                      className="rounded border-gray-300"
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {isTypePickerOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setIsTypePickerOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="booking-type-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between"><div><h2 id="booking-type-title" className="text-lg font-semibold text-gray-900">Choose booking type</h2><p className="mt-1 text-sm text-gray-500">Select the form to open.</p></div><button onClick={() => setIsTypePickerOpen(false)} aria-label="Close" className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button></div>
          <div className="mt-5 grid gap-2">{creationTypes.map(item => <button key={item.type} onClick={() => navigate(`/bookings/create/${item.type}`)} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:border-primary-300 hover:bg-primary-50">{item.label}<ArrowUpRight size={16} className="text-gray-400" /></button>)}</div>
        </section>
      </div>}

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.invoice && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('invoice')} className="inline-flex items-center gap-1 hover:text-primary-600">Booking ID {sortIcon('invoice')}</button></th>}
                {visibleColumns.customer && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('customer')} className="inline-flex items-center gap-1 hover:text-primary-600">Customer {sortIcon('customer')}</button></th>}
                {visibleColumns.module && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('module')} className="inline-flex items-center gap-1 hover:text-primary-600">Booking Type {sortIcon('module')}</button></th>}
                {visibleColumns.createdAt && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('createdAt')} className="inline-flex items-center gap-1 hover:text-primary-600">Date {sortIcon('createdAt')}</button></th>}
                {visibleColumns.price && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('price')} className="inline-flex items-center gap-1 hover:text-primary-600">Amount {sortIcon('price')}</button></th>}
                {visibleColumns.payment && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('payment')} className="inline-flex items-center gap-1 hover:text-primary-600">Payment Status {sortIcon('payment')}</button></th>}
                {visibleColumns.booking && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('booking')} className="inline-flex items-center gap-1 hover:text-primary-600">Booking Status {sortIcon('booking')}</button></th>}
                {visibleColumns.ref && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('ref')} className="inline-flex items-center gap-1 hover:text-primary-600 justify-center">Booking Reference {sortIcon('ref')}</button></th>}
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((b, i) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                    
                    {visibleColumns.invoice && <td className="px-4 py-3">
                      <button onClick={() => navigate(`/bookings/view/${b.invoice}`)} className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
                        {b.invoice} <ArrowUpRight size={14} />
                      </button>
                    </td>}

                    {visibleColumns.customer && <td className="px-4 py-3"><div className="font-bold text-gray-900">{b.user.split('\n')[0]}</div><div className="text-xs text-gray-500">{b.user.split('\n')[1] || 'Guest booking'}</div></td>}
                    {visibleColumns.module && <td className="px-4 py-3"><div className="font-bold capitalize text-gray-800">{b.moduleType === 'stays' ? 'Stay' : b.moduleType}</div><div className="text-xs text-gray-500">{b.moduleName.split('\n')[1]}</div></td>}
                    {visibleColumns.createdAt && <td className="px-4 py-3 text-gray-800 text-sm font-medium">{b.createdAt}</td>}
                    {visibleColumns.price && <td className="px-4 py-3"><div className="font-bold text-gray-900">{convertFromAndFormat(Number(b.price), b.currency as 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD')}</div></td>}
                    {visibleColumns.payment && <td className="px-4 py-3"><span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border ${b.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : b.payment === 'REFUNDED' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{b.payment}</span></td>}

                    {visibleColumns.booking && <td className="px-4 py-3 space-y-1">
                      <span className={`block w-max px-2.5 py-1 text-[10px] uppercase font-bold rounded 
                        ${b.booking.includes('CONFIRMED') ? 'bg-emerald-100 text-emerald-700' : 
                          b.booking.includes('CANCELLED') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {b.booking.split('\n')[0]}
                      </span>
                      {b.booking.includes('CANCELLATION') && (
                        <span className="block w-max px-2.5 py-1 text-[10px] uppercase font-bold rounded bg-orange-100 text-orange-700 border border-orange-200">
                          Cancel Requested
                        </span>
                      )}
                    </td>}

                    {visibleColumns.ref && <td className="px-4 py-3 text-center text-gray-400 italic text-xs font-mono">{b.ref}</td>}
                    
                    <td className="px-4 py-3 text-center space-x-1">
                      <button onClick={() => navigate(`/bookings/view/${b.invoice}`)} className="inline-flex p-1.5 text-gray-400 hover:text-primary-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="View details" aria-label={`View booking ${b.invoice}`}>
                        <Eye size={14} />
                      </button>
                      {canManage && <button onClick={() => navigate(b.managed ? `/bookings/create/${b.moduleType}?edit=${encodeURIComponent(b.invoice)}` : `/bookings/edit/${b.invoice}`)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                        <Edit2 size={14} />
                      </button>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumnCount} className="px-4 py-12 text-center text-gray-500">
                    No bookings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
            </span>
            
            {/* Bottom Rows Per Page Dropdown */}
            <select 
              value={rowsPerPage}
              onChange={handleRowsChange}
              className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer text-sm"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            {pageNumbers.map(number => (
              <button 
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === number 
                    ? 'bg-primary-500 text-white shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 h-8 flex items-center justify-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}