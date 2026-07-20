import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Columns, Edit2, Trash2, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockBookings } from '../../data/mockBookings'; 
import { useCurrency } from '../../context/CurrencyContext';

type BookingColumn = 'invoice' | 'module' | 'booking' | 'payment' | 'price' | 'customer' | 'ref' | 'createdAt';
type BookingSortKey = BookingColumn;

export default function BookingList() {
  const navigate = useNavigate();
  const { moduleType } = useParams(); 
  const { convertFromAndFormat } = useCurrency();
  
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
    ref: true,
    createdAt: true,
  });

  // Reset to page 1 whenever the module type (URL) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [moduleType]);

  // 1. Filter the data based on module type
  const filteredBookings = moduleType 
    ? mockBookings.filter(b => b.moduleType === moduleType) 
    : mockBookings;

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

  const pageTitle = moduleType 
    ? `${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Bookings` 
    : 'All Bookings';

  // Generate an array of page numbers to render the pagination buttons
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

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

  const showAllColumns = () => {
    setVisibleColumns({
      invoice: true,
      module: true,
      booking: true,
      payment: true,
      price: true,
      customer: true,
      ref: true,
      createdAt: true,
    });
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
            <span className="text-gray-500">entries</span>
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
                <button type="button" onClick={showAllColumns} className="w-full text-left text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded px-2 py-1.5 mb-1">
                  Show All Columns
                </button>
                {[
                  { key: 'invoice', label: 'Invoice' },
                  { key: 'module', label: 'Module' },
                  { key: 'booking', label: 'Booking' },
                  { key: 'payment', label: 'Payment' },
                  { key: 'price', label: 'Price' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'ref', label: 'Ref / PNR' },
                  { key: 'createdAt', label: 'Created At' },
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

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.invoice && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('invoice')} className="inline-flex items-center gap-1 hover:text-primary-600">Invoice {sortIcon('invoice')}</button></th>}
                {visibleColumns.module && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('module')} className="inline-flex items-center gap-1 hover:text-primary-600">Module {sortIcon('module')}</button></th>}
                {visibleColumns.booking && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('booking')} className="inline-flex items-center gap-1 hover:text-primary-600">Booking {sortIcon('booking')}</button></th>}
                {visibleColumns.payment && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('payment')} className="inline-flex items-center gap-1 hover:text-primary-600">Payment {sortIcon('payment')}</button></th>}
                {visibleColumns.price && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('price')} className="inline-flex items-center gap-1 hover:text-primary-600">Price {sortIcon('price')}</button></th>}
                {visibleColumns.customer && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('customer')} className="inline-flex items-center gap-1 hover:text-primary-600">Customer {sortIcon('customer')}</button></th>}
                {visibleColumns.ref && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('ref')} className="inline-flex items-center gap-1 hover:text-primary-600 justify-center">Ref / PNR {sortIcon('ref')}</button></th>}
                {visibleColumns.createdAt && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('createdAt')} className="inline-flex items-center gap-1 hover:text-primary-600">Created At {sortIcon('createdAt')}</button></th>}
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

                    {visibleColumns.module && <td className="px-4 py-3">
                      <div className="font-bold text-gray-800">{b.moduleName.split('\n')[0]}</div>
                      <div className="text-xs text-gray-500">{b.moduleName.split('\n')[1]}</div>
                    </td>}

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

                    {visibleColumns.payment && <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border 
                        ${b.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                          b.payment === 'REFUNDED' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {b.payment}
                      </span>
                    </td>}

                    {visibleColumns.price && <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{convertFromAndFormat(Number(b.price), 'USD')}</div>
                      <div className="text-xs font-semibold text-emerald-600">Earn {convertFromAndFormat(Number(b.earning), 'USD')}</div>
                    </td>}

                    {visibleColumns.customer && <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{b.user.split('\n')[0]}</div>
                      <div className="text-xs text-gray-500">{b.user.split('\n')[1]}</div>
                    </td>}

                    {visibleColumns.ref && <td className="px-4 py-3 text-center text-gray-400 italic text-xs font-mono">{b.ref}</td>}
                    {visibleColumns.createdAt && <td className="px-4 py-3 text-gray-800 text-sm font-medium">{b.createdAt}</td>}
                    
                    <td className="px-4 py-3 text-center space-x-1">
                      <button onClick={() => navigate(`/bookings/edit/${b.invoice}`)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
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