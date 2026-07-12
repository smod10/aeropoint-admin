import { useState } from 'react';
import { Search, Filter, Download, Eye, Plane, Building2, Package, Moon, CheckCircle, Clock, XCircle } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data combining different modules
const mockBookings = [
  {
    id: 'BKG-8492',
    customer: 'Sarah Jenkins',
    module: 'Flight',
    details: 'LHR → DXB (Emirates)',
    date: '14 Jul 2026',
    amount: '$840.00',
    status: 'Confirmed',
  },
  {
    id: 'HTL-9022',
    customer: 'Amanda Huggins',
    module: 'Hotel',
    details: 'Marriott Marquis, NYC',
    date: '22 Jul 2026',
    amount: '$1,400.00',
    status: 'Pending',
  },
  {
    id: 'PKG-003',
    customer: 'Marcus Johnson',
    module: 'Package',
    details: 'Swiss Alps Winter Wonderland',
    date: '10 Aug 2026',
    amount: '$3,100.00',
    status: 'Confirmed',
  },
  {
    id: 'UMR-2055',
    customer: 'Tariq Al-Fayed',
    module: 'Umrah',
    details: '14-Day Premium Umrah',
    date: '01 Sep 2026',
    amount: '$4,500.00',
    status: 'Confirmed',
  },
  {
    id: 'BKG-8494',
    customer: 'Emma Wilson',
    module: 'Flight',
    details: 'DXB → SIN (Singapore Airlines)',
    date: '16 Jul 2026',
    amount: '$650.00',
    status: 'Cancelled',
  }
];

const getModuleIcon = (module: string) => {
  switch (module) {
    case 'Flight': return <Plane size={14} className="text-blue-500" />;
    case 'Hotel': return <Building2 size={14} className="text-purple-500" />;
    case 'Package': return <Package size={14} className="text-amber-500" />;
    case 'Umrah': return <Moon size={14} className="text-emerald-500" />;
    default: return null;
  }
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Confirmed: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Cancelled: 'bg-red-50 text-red-600'
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export default function BookingList() {
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Master view of all reservations across flights, hotels, and packages.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Export All
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search all bookings..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none px-3 py-2">
            <option value="">All Modules</option>
            <option value="Flight">Flights</option>
            <option value="Hotel">Hotels</option>
            <option value="Package">Packages</option>
            <option value="Umrah">Umrah</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Booking ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Service / Module</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary-600">{booking.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{booking.customer}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-gray-900">
                      {getModuleIcon(booking.module)} {booking.module}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{booking.details}</div>
                  </td>
                  <td className="px-6 py-4">{booking.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{booking.amount}</td>
                  <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedBooking(booking); setIsSlideOverOpen(true); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} title="Master Booking Record">
        {selectedBooking && (
          <div className="space-y-6 pb-20">
            <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Booking Ref</p>
                <p className="text-lg font-bold text-gray-900">{selectedBooking.id}</p>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                  {getModuleIcon(selectedBooking.module)} {selectedBooking.module}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                {getStatusBadge(selectedBooking.status)}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium text-gray-900">{selectedBooking.customer}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Details</span>
                  <span className="font-medium text-gray-900">{selectedBooking.details}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Travel Date</span>
                  <span className="font-medium text-gray-900">{selectedBooking.date}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-medium text-emerald-600">{selectedBooking.amount}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-800">
              <p>To perform specific actions like issuing tickets or modifying rooms, please navigate to the dedicated <strong>{selectedBooking.module}</strong> module.</p>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}