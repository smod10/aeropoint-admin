import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Columns, Edit2, Trash2, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockBookings } from '../../data/mockBookings'; 

export default function BookingList() {
  const navigate = useNavigate();
  const { moduleType } = useParams(); 
  
  // Pagination & Filter States
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the module type (URL) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [moduleType]);

  // 1. Filter the data based on module type
  const filteredBookings = moduleType 
    ? mockBookings.filter(b => b.moduleType === moduleType) 
    : mockBookings;

  // 2. Calculate Pagination Math
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  // 3. Slice the data for the current page
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

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

          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>
          
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
                <th className="px-4 py-4">Invoice</th>
                <th className="px-4 py-4">Module</th>
                <th className="px-4 py-4">Booking</th>
                <th className="px-4 py-4">Payment</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4 text-center">Ref / PNR</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((b, i) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                    
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/bookings/view/${b.invoice}`)} className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
                        {b.invoice} <ArrowUpRight size={14} />
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800">{b.moduleName.split('\n')[0]}</div>
                      <div className="text-xs text-gray-500">{b.moduleName.split('\n')[1]}</div>
                    </td>

                    <td className="px-4 py-3 space-y-1">
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
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border 
                        ${b.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                          b.payment === 'REFUNDED' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {b.payment}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">USD {b.price}</div>
                      <div className="text-xs font-semibold text-emerald-600">Earn USD {b.earning}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{b.user.split('\n')[0]}</div>
                      <div className="text-xs text-gray-500">{b.user.split('\n')[1]}</div>
                    </td>

                    <td className="px-4 py-3 text-center text-gray-400 italic text-xs font-mono">{b.ref}</td>
                    <td className="px-4 py-3 text-gray-800 text-sm font-medium">{b.createdAt}</td>
                    
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