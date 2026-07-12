import { useState } from 'react';
import { Search, Filter, Download, Eye, BedDouble, Calendar, MapPin, CheckCircle, Ban, Receipt } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data
const mockHotels = [
  {
    id: 'HTL-9021',
    guest: 'David Wallace',
    hotel: 'The Ritz-Carlton Dubai',
    location: 'Dubai, UAE',
    room: 'Deluxe Ocean View',
    checkIn: '20 Jul 2026',
    checkOut: '25 Jul 2026',
    amount: '$3,250.00',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    provider: 'Hotelbeds',
    email: 'd.wallace@example.com',
    phone: '+971 50 987 6543'
  },
  {
    id: 'HTL-9022',
    guest: 'Amanda Huggins',
    hotel: 'Marriott Marquis',
    location: 'New York, USA',
    room: 'Standard King',
    checkIn: '22 Jul 2026',
    checkOut: '26 Jul 2026',
    amount: '$1,400.00',
    status: 'Pending',
    paymentStatus: 'Unpaid',
    provider: 'Expedia Rapid',
    email: 'amanda.h@example.com',
    phone: '+1 212 555 8899'
  },
  {
    id: 'HTL-9023',
    guest: 'Marcus Johnson',
    hotel: 'Shangri-La Paris',
    location: 'Paris, France',
    room: 'Eiffel View Suite',
    checkIn: '10 Aug 2026',
    checkOut: '14 Aug 2026',
    amount: '$5,100.00',
    status: 'Cancelled',
    paymentStatus: 'Refunded',
    provider: 'Booking.com',
    email: 'm.johnson@example.com',
    phone: '+44 7700 900112'
  }
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Confirmed: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Cancelled: 'bg-red-50 text-red-600'
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

const getPaymentBadge = (status: string) => {
  const styles: Record<string, string> = {
    Paid: 'bg-blue-50 text-blue-600',
    Unpaid: 'bg-amber-50 text-amber-600',
    Refunded: 'bg-gray-100 text-gray-600'
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export default function HotelList() {
  const [selectedBooking, setSelectedBooking] = useState<typeof mockHotels[0] | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const openDetails = (booking: typeof mockHotels[0]) => {
    setSelectedBooking(booking);
    setIsSlideOverOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hotel Reservations</h2>
          <p className="text-sm text-gray-500 mt-1">Manage accommodation bookings and guest details.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Export Data
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search by Booking ID, Guest, or Hotel..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Booking ID</th>
                <th className="px-6 py-4 font-medium">Guest</th>
                <th className="px-6 py-4 font-medium">Hotel & Room</th>
                <th className="px-6 py-4 font-medium">Check-in / Out</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockHotels.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary-600">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.guest}</div>
                    <div className="text-xs text-gray-400">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.hotel}</div>
                    <div className="text-xs text-gray-400">{booking.room}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{booking.checkIn}</div>
                    <div className="text-xs text-gray-400">to {booking.checkOut}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.paymentStatus)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openDetails(booking)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Details Panel */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title="Reservation Details"
      >
        {selectedBooking && (
          <div className="space-y-6 pb-20">
            
            {/* Status & ID Summary */}
            <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Booking ID</p>
                <p className="text-lg font-bold text-gray-900">{selectedBooking.id}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                {getStatusBadge(selectedBooking.status)}
                {getPaymentBadge(selectedBooking.paymentStatus)}
              </div>
            </div>

            {/* Guest Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Guest Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-medium text-gray-900">{selectedBooking.guest}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{selectedBooking.email}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{selectedBooking.phone}</span>
                </div>
              </div>
            </div>

            {/* Hotel Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Accommodation</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><MapPin size={14}/> Hotel</span>
                  <span className="font-medium text-gray-900">{selectedBooking.hotel}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><BedDouble size={14}/> Room Type</span>
                  <span className="font-medium text-gray-900">{selectedBooking.room}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={14}/> Check-in</span>
                  <span className="font-medium text-gray-900">{selectedBooking.checkIn}</span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={14}/> Check-out</span>
                  <span className="font-medium text-gray-900">{selectedBooking.checkOut}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">API Provider</span>
                  <span className="font-medium text-gray-900">{selectedBooking.provider}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-medium text-emerald-600">{selectedBooking.amount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                <Receipt size={16} />
                Generate Invoice
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                  <CheckCircle size={16} />
                  Confirm
                </button>
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  <Ban size={16} />
                  {selectedBooking.paymentStatus === 'Paid' ? 'Cancel & Refund' : 'Cancel Booking'}
                </button>
              </div>
            </div>

          </div>
        )}
      </SlideOver>
    </div>
  );
}