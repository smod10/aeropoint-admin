import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutIcon, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type FlightColumn = 'status' | 'flightNumber' | 'airline' | 'origin' | 'destination' | 'time' | 'type' | 'adult' | 'child' | 'infant';
type FlightSortKey = 'status' | 'flightNumber' | 'airline' | 'origin' | 'destination' | 'time' | 'type' | 'adult' | 'child' | 'infant';

// Mock Data matching the inventory-style screenshot
const initialFlights = [
  { id: 1, status: true, flightNumber: 'PK304', airline: 'AST Pakistan Airways', origin: 'Lahore', destination: 'Dubai', time: '06:00:00', type: 'recurring', adult: '155.00 USD', child: '116.00 USD', infant: '39.00 USD' },
  { id: 2, status: true, flightNumber: 'LH778', airline: 'Lufthansa', origin: 'Frankfurt', destination: 'Singapore', time: '22:05:00', type: 'fixed', adult: '730.00 USD', child: '547.50 USD', infant: '73.00 USD' },
  { id: 3, status: true, flightNumber: 'EK382', airline: 'Emirates', origin: 'Dubai', destination: 'Hong Kong', time: '03:45:00', type: 'fixed', adult: '560.00 USD', child: '420.00 USD', infant: '56.00 USD' },
  { id: 4, status: true, flightNumber: 'EK398', airline: 'Emirates', origin: 'Dubai', destination: 'Denpasar', time: '02:35:00', type: 'fixed', adult: '580.00 USD', child: '435.00 USD', infant: '58.00 USD' },
  { id: 5, status: true, flightNumber: 'TG910', airline: 'Thai Airways', origin: 'Bangkok', destination: 'London', time: '23:30:00', type: 'fixed', adult: '650.00 USD', child: '487.50 USD', infant: '65.00 USD' },
  { id: 6, status: true, flightNumber: 'TG676', airline: 'Thai Airways', origin: 'Bangkok', destination: 'Tokyo', time: '07:35:00', type: 'fixed', adult: '430.00 USD', child: '322.50 USD', infant: '43.00 USD' },
  { id: 7, status: true, flightNumber: 'QF011', airline: 'Qantas', origin: 'Sydney', destination: 'Los Angeles', time: '09:40:00', type: 'fixed', adult: '1100.00 USD', child: '825.00 USD', infant: '110.00 USD' },
];

export default function FlightList() {
  const [flights, setFlights] = useState(initialFlights);
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<FlightSortKey>('flightNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Record<FlightColumn, boolean>>({
    status: true,
    flightNumber: true,
    airline: true,
    origin: true,
    destination: true,
    time: true,
    type: true,
    adult: true,
    child: true,
    infant: true,
  });

  // Toggle the active/inactive status switch
  const toggleStatus = (id: number) => {
    setFlights(flights.map(f => f.id === id ? { ...f, status: !f.status } : f));
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this flight record?')) {
      setFlights(flights.filter(f => f.id !== id));
    }
  };

  const sortedFlights = useMemo(() => {
    return [...flights].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (sortKey === 'status') {
        return sortDirection === 'asc'
          ? Number(left.status) - Number(right.status)
          : Number(right.status) - Number(left.status);
      }

      if (sortKey === 'adult' || sortKey === 'child' || sortKey === 'infant') {
        return sortDirection === 'asc'
          ? Number(String(leftValue).replace(/[^0-9.]/g, '')) - Number(String(rightValue).replace(/[^0-9.]/g, ''))
          : Number(String(rightValue).replace(/[^0-9.]/g, '')) - Number(String(leftValue).replace(/[^0-9.]/g, ''));
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [flights, sortDirection, sortKey]);

  const totalItems = sortedFlights.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const paginatedFlights = sortedFlights.slice(startIndex, endIndex);

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: FlightSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: FlightSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-primary-600" />
      : <ArrowDown size={12} className="text-primary-600" />;
  };

  const toggleColumn = (column: FlightColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Flights Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {flights.length} records</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button type="button" onClick={() => setIsColumnMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <LayoutIcon size={16} />
              View Columns
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
                {[
                  { key: 'status', label: 'Status' },
                  { key: 'flightNumber', label: 'Flight Number' },
                  { key: 'airline', label: 'Airline' },
                  { key: 'origin', label: 'Origin Airport' },
                  { key: 'destination', label: 'Destination Airport' },
                  { key: 'time', label: 'Departure Time' },
                  { key: 'type', label: 'Flight Type' },
                  { key: 'adult', label: 'Economy Adult Price' },
                  { key: 'child', label: 'Economy Child Price' },
                  { key: 'infant', label: 'Economy Infant Price' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[col.key as FlightColumn]} onChange={() => toggleColumn(col.key as FlightColumn)} className="rounded border-gray-300" />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/flights/edit/new')}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create New
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.status && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-primary-600">Status {sortIcon('status')}</button></th>}
                {visibleColumns.flightNumber && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('flightNumber')} className="inline-flex items-center gap-1 hover:text-primary-600">Flight Number {sortIcon('flightNumber')}</button></th>}
                {visibleColumns.airline && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('airline')} className="inline-flex items-center gap-1 hover:text-primary-600">Airline {sortIcon('airline')}</button></th>}
                {visibleColumns.origin && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('origin')} className="inline-flex items-center gap-1 hover:text-primary-600">Origin Airport {sortIcon('origin')}</button></th>}
                {visibleColumns.destination && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('destination')} className="inline-flex items-center gap-1 hover:text-primary-600">Destination Airport {sortIcon('destination')}</button></th>}
                {visibleColumns.time && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('time')} className="inline-flex items-center gap-1 hover:text-primary-600">Departure Time {sortIcon('time')}</button></th>}
                {visibleColumns.type && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('type')} className="inline-flex items-center gap-1 hover:text-primary-600">Flight Type {sortIcon('type')}</button></th>}
                {visibleColumns.adult && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('adult')} className="inline-flex items-center gap-1 hover:text-primary-600">Economy Adult Price {sortIcon('adult')}</button></th>}
                {visibleColumns.child && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('child')} className="inline-flex items-center gap-1 hover:text-primary-600">Economy Child Price {sortIcon('child')}</button></th>}
                {visibleColumns.infant && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('infant')} className="inline-flex items-center gap-1 hover:text-primary-600">Economy Infant Price {sortIcon('infant')}</button></th>}
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedFlights.map((flight, index) => (
                <tr key={flight.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                  <td className="px-4 py-3 text-gray-500">{startIndex + index + 1}</td>
                  
                  {/* Status Toggle Switch */}
                  {visibleColumns.status && <td className="px-4 py-3">
                    <button 
                      onClick={() => toggleStatus(flight.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${flight.status ? 'bg-primary-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${flight.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>}

                  {visibleColumns.flightNumber && <td className="px-4 py-3 font-medium text-gray-900">{flight.flightNumber}</td>}
                  {visibleColumns.airline && <td className="px-4 py-3">{flight.airline}</td>}
                  {visibleColumns.origin && <td className="px-4 py-3">{flight.origin}</td>}
                  {visibleColumns.destination && <td className="px-4 py-3">{flight.destination}</td>}
                  {visibleColumns.time && <td className="px-4 py-3">{flight.time}</td>}
                  {visibleColumns.type && <td className="px-4 py-3">{flight.type}</td>}
                  {visibleColumns.adult && <td className="px-4 py-3 font-medium text-emerald-600 bg-emerald-50/30">{flight.adult}</td>}
                  {visibleColumns.child && <td className="px-4 py-3 font-medium text-emerald-600 bg-emerald-50/30">{flight.child}</td>}
                  {visibleColumns.infant && <td className="px-4 py-3 font-medium text-emerald-600 bg-emerald-50/30">{flight.infant}</td>}
                  
                  {/* Actions Column */}
                  <td className="px-4 py-3 text-center space-x-1">
                    <button 
                      onClick={() => navigate(`/flights/view/${flight.flightNumber}`)} 
                      className="inline-flex p-1.5 text-gray-400 hover:text-primary-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" 
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => navigate(`/flights/edit/${flight.flightNumber}`)} 
                      className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" 
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(flight.id)} 
                      className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer text-sm">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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