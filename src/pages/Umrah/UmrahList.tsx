import { useState } from 'react';
import { Search, Eye, Filter, Download, Plane, Building2, FileText, CheckCircle, Clock } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

const mockUmrahBookings = [
  {
    id: 'UMR-2055',
    pilgrim: 'Tariq Al-Fayed',
    package: '14-Day Premium Umrah',
    flightPnr: 'EK3092',
    hotelMecca: 'Fairmont Makkah Clock Royal',
    hotelMedina: 'Pullman Zamzam Madina',
    visaStatus: 'Approved',
    flightStatus: 'Ticketed',
    hotelStatus: 'Confirmed',
    paymentStatus: 'Paid',
    amount: '$4,500.00'
  },
  {
    id: 'UMR-2056',
    pilgrim: 'Fatima Zahra',
    package: '7-Day Express Umrah',
    flightPnr: 'SV1209',
    hotelMecca: 'Swissôtel Al Maqam',
    hotelMedina: 'N/A',
    visaStatus: 'Pending Docs',
    flightStatus: 'Confirmed',
    hotelStatus: 'Pending',
    paymentStatus: 'Deposit Paid',
    amount: '$2,100.00'
  }
];

const getStatusBadge = (status: string) => {
  if (['Approved', 'Ticketed', 'Confirmed', 'Paid'].includes(status)) {
    return <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle size={12}/> {status}</span>;
  }
  return <span className="flex items-center gap-1 text-amber-600 text-xs font-medium"><Clock size={12}/> {status}</span>;
};

export default function UmrahList() {
  const [selectedBooking, setSelectedBooking] = useState<typeof mockUmrahBookings[0] | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Umrah Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage pilgrim packages, visas, flights, and accommodations in one place.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Export Manifest
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search pilgrims or Booking ID..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Booking ID</th>
                <th className="px-6 py-4 font-medium">Pilgrim & Package</th>
                <th className="px-6 py-4 font-medium">Flight Status</th>
                <th className="px-6 py-4 font-medium">Hotel Status</th>
                <th className="px-6 py-4 font-medium">Visa Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockUmrahBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary-600">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.pilgrim}</div>
                    <div className="text-xs text-gray-400">{booking.package}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(booking.flightStatus)}</td>
                  <td className="px-6 py-4">{getStatusBadge(booking.hotelStatus)}</td>
                  <td className="px-6 py-4">{getStatusBadge(booking.visaStatus)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedBooking(booking); setIsSlideOverOpen(true); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                    >
                      <Eye size={14} /> Full Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} title="Umrah Pilgrim Record">
        {selectedBooking && (
          <div className="space-y-6 pb-20">
            <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pilgrim</p>
                <p className="text-lg font-bold text-gray-900">{selectedBooking.pilgrim}</p>
                <p className="text-sm text-gray-500">{selectedBooking.package}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Flight Module inside Umrah */}
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Plane size={16} className="text-blue-500" /> Flights</h4>
                  {getStatusBadge(selectedBooking.flightStatus)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="block"><strong className="text-gray-900">PNR:</strong> {selectedBooking.flightPnr}</span>
                </div>
              </div>

              {/* Hotel Module inside Umrah */}
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Building2 size={16} className="text-emerald-500" /> Accommodations</h4>
                  {getStatusBadge(selectedBooking.hotelStatus)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <span className="block"><strong className="text-gray-900">Makkah:</strong> {selectedBooking.hotelMecca}</span>
                  <span className="block"><strong className="text-gray-900">Madinah:</strong> {selectedBooking.hotelMedina}</span>
                </div>
              </div>

              {/* Visa Module inside Umrah */}
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><FileText size={16} className="text-purple-500" /> Visa Application</h4>
                  {getStatusBadge(selectedBooking.visaStatus)}
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}