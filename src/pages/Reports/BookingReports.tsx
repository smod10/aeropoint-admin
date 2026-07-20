import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Columns, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockBookings } from '../../data/mockBookings';

type BookingReportSortKey = 'invoice' | 'module' | 'firstName' | 'lastName' | 'email' | 'bookingStatus' | 'paymentStatus' | 'currency' | 'basePrice' | 'markup' | 'tax' | 'dateTime';

const formatDateTime = (date: string) => `${date} 14:30:00`;

export default function BookingReports() {
  const navigate = useNavigate();
  const [bookings] = useState(mockBookings);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    invoice: true,
    module: true,
    firstName: true,
    lastName: true,
    email: true,
    bookingStatus: true,
    paymentStatus: true,
    currency: true,
    basePrice: true,
    markup: true,
    tax: true,
    dateTime: true,
  });
  const [sortKey, setSortKey] = useState<BookingReportSortKey>('dateTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const tableRows = useMemo(() => {
    return bookings.map((booking, index) => {
      const nameParts = booking.user.split('\n')[0].split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      const email = booking.user.split('\n')[1];
      const totalPrice = Number(booking.price);
      const markup = Number(booking.earning);
      const basePrice = totalPrice - markup;
      const bookingStatus = booking.booking.split('\n')[0].toLowerCase();
      const paymentStatus = booking.payment.toLowerCase();

      return {
        booking,
        index,
        firstName,
        lastName,
        email,
        totalPrice,
        markup,
        basePrice,
        tax: Number((basePrice * 0.05).toFixed(2)),
        bookingStatus,
        paymentStatus,
        currency: index % 5 === 0 ? 'EUR' : 'USD',
      };
    });
  }, [bookings]);

  const sortedRows = useMemo(() => {
    return [...tableRows].sort((left, right) => {
      const leftValue = sortKey === 'invoice' ? left.booking.invoice :
        sortKey === 'module' ? left.booking.moduleType :
        sortKey === 'firstName' ? left.firstName :
        sortKey === 'lastName' ? left.lastName :
        sortKey === 'email' ? left.email :
        sortKey === 'bookingStatus' ? left.bookingStatus :
        sortKey === 'paymentStatus' ? left.paymentStatus :
        sortKey === 'currency' ? left.currency :
        sortKey === 'basePrice' ? left.basePrice :
        sortKey === 'markup' ? left.markup :
        sortKey === 'tax' ? left.tax : left.booking.createdAt;

      const rightValue = sortKey === 'invoice' ? right.booking.invoice :
        sortKey === 'module' ? right.booking.moduleType :
        sortKey === 'firstName' ? right.firstName :
        sortKey === 'lastName' ? right.lastName :
        sortKey === 'email' ? right.email :
        sortKey === 'bookingStatus' ? right.bookingStatus :
        sortKey === 'paymentStatus' ? right.paymentStatus :
        sortKey === 'currency' ? right.currency :
        sortKey === 'basePrice' ? right.basePrice :
        sortKey === 'markup' ? right.markup :
        sortKey === 'tax' ? right.tax : right.booking.createdAt;

      if (sortKey === 'basePrice' || sortKey === 'markup' || sortKey === 'tax') {
        return sortDirection === 'asc' ? Number(leftValue) - Number(rightValue) : Number(rightValue) - Number(leftValue);
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [sortDirection, sortKey, tableRows]);

  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: BookingReportSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: BookingReportSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-[#0d6efd]" />
      : <ArrowDown size={12} className="text-[#0d6efd]" />;
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(previous => ({ ...previous, [column]: !previous[column] }));
  };

  const showAllColumns = () => {
    setVisibleColumns({
      invoice: true,
      module: true,
      firstName: true,
      lastName: true,
      email: true,
      bookingStatus: true,
      paymentStatus: true,
      currency: true,
      basePrice: true,
      markup: true,
      tax: true,
      dateTime: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Booking Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {bookings.length} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnMenuOpen(previous => !previous)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 max-h-80 overflow-y-auto">
                <button type="button" onClick={showAllColumns} className="w-full text-left text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded px-2 py-1.5 mb-1">
                  Show All Columns
                </button>
                {([
                  ['invoice', 'Invoice'],
                  ['module', 'Module'],
                  ['firstName', 'First Name'],
                  ['lastName', 'Last Name'],
                  ['email', 'Email'],
                  ['bookingStatus', 'Booking Status'],
                  ['paymentStatus', 'Payment Status'],
                  ['currency', 'Currency'],
                  ['basePrice', 'Base Price'],
                  ['markup', 'Markup'],
                  ['tax', 'Tax'],
                  ['dateTime', 'Date & Time'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[key]} onChange={() => toggleColumn(key)} className="rounded border-gray-300" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg text-sm">
            <span className="text-gray-500">Show</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-transparent font-medium outline-none cursor-pointer">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="text-gray-500">entries</span>
          </div>
          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-[#0d6efd] w-48" />
            <button className="bg-[#0d6efd] text-white px-4 py-2.5 rounded-r-lg hover:bg-blue-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.invoice && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('invoice')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">INVOICE ID {sortIcon('invoice')}</button></th>}
                {visibleColumns.module && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('module')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">MODULE {sortIcon('module')}</button></th>}
                {visibleColumns.firstName && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('firstName')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">FIRST NAME {sortIcon('firstName')}</button></th>}
                {visibleColumns.lastName && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('lastName')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">LAST NAME {sortIcon('lastName')}</button></th>}
                {visibleColumns.email && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('email')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">EMAIL {sortIcon('email')}</button></th>}
                {visibleColumns.bookingStatus && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('bookingStatus')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">BOOKING STATUS {sortIcon('bookingStatus')}</button></th>}
                {visibleColumns.paymentStatus && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('paymentStatus')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">PAYMENT STATUS {sortIcon('paymentStatus')}</button></th>}
                {visibleColumns.currency && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('currency')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">CURRENCY {sortIcon('currency')}</button></th>}
                {visibleColumns.basePrice && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('basePrice')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">BASE PRICE {sortIcon('basePrice')}</button></th>}
                {visibleColumns.markup && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('markup')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">MARKUP {sortIcon('markup')}</button></th>}
                {visibleColumns.tax && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('tax')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">TAX (5%) {sortIcon('tax')}</button></th>}
                {visibleColumns.dateTime && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('dateTime')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">DATE & TIME {sortIcon('dateTime')}</button></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedRows.map((row, i) => {
                const { booking, firstName, lastName, email, bookingStatus, paymentStatus, currency, basePrice, markup, tax } = row;

                return (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>

                    {visibleColumns.invoice && (
                      <td className="px-4 py-3 font-mono">
                        <button
                          onClick={() => navigate(`/bookings/view/${booking.invoice}`)}
                          className="text-[#0d6efd] hover:text-blue-800 font-bold transition-colors"
                        >
                          {booking.invoice}
                        </button>
                      </td>
                    )}

                    {visibleColumns.module && <td className="px-4 py-3 text-gray-600 capitalize">{booking.moduleType}</td>}
                    {visibleColumns.firstName && <td className="px-4 py-3 text-gray-800">{firstName}</td>}
                    {visibleColumns.lastName && <td className="px-4 py-3 text-gray-800">{lastName}</td>}
                    {visibleColumns.email && <td className="px-4 py-3 text-gray-600">{email}</td>}
                    {visibleColumns.bookingStatus && <td className="px-4 py-3"><span className={`lowercase text-xs ${bookingStatus.includes('confirmed') ? 'text-gray-800' : 'text-gray-500'}`}>{bookingStatus}</span></td>}
                    {visibleColumns.paymentStatus && <td className="px-4 py-3"><span className={`lowercase text-xs ${paymentStatus === 'paid' ? 'text-gray-800' : 'text-gray-500'}`}>{paymentStatus}</span></td>}
                    {visibleColumns.currency && <td className="px-4 py-3 text-gray-500 font-medium">{currency}</td>}
                    {visibleColumns.basePrice && <td className="px-4 py-3 text-gray-800">{basePrice.toFixed(2)}</td>}
                    {visibleColumns.markup && <td className="px-4 py-3 text-gray-800">{markup.toFixed(2)}</td>}
                    {visibleColumns.tax && <td className="px-4 py-3 text-gray-800">{tax.toFixed(2)}</td>}
                    {visibleColumns.dateTime && <td className="px-4 py-3 text-gray-600">{formatDateTime(booking.createdAt)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#0d6efd] cursor-pointer text-sm">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? 'bg-[#0d6efd] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {number}
              </button>
            ))}
            <button onClick={() => setCurrentPage(previous => Math.min(previous + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 h-8 flex items-center justify-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}