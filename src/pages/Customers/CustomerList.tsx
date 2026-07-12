import { useState } from 'react';
import { Search, Filter, Download, Eye, Mail, Phone, ShoppingBag, MapPin, LifeBuoy, History } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data
const mockCustomers = [
  {
    id: 'CUS-8021',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+44 7700 900077',
    location: 'London, UK',
    status: 'Active',
    totalBookings: 12,
    totalSpent: '$14,250.00',
    joinedDate: '12 Jan 2024',
    recentActivity: 'Booked Flight LHR → DXB',
    supportTickets: 0
  },
  {
    id: 'CUS-8022',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '+1 212 555 0198',
    location: 'New York, USA',
    status: 'Active',
    totalBookings: 3,
    totalSpent: '$4,100.00',
    joinedDate: '05 Mar 2025',
    recentActivity: 'Cancelled Hotel in Paris',
    supportTickets: 1
  },
  {
    id: 'CUS-8023',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE',
    status: 'Inactive',
    totalBookings: 1,
    totalSpent: '$850.00',
    joinedDate: '22 Nov 2025',
    recentActivity: 'Completed Umrah Package',
    supportTickets: 0
  }
];

export default function CustomerList() {
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const openProfile = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer);
    setIsSlideOverOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">View client profiles, travel history, and total revenue.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Bookings</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-400">ID: {customer.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{customer.email}</div>
                    <div className="text-xs text-gray-400">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{customer.totalBookings}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{customer.totalSpent}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openProfile(customer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Eye size={14} /> Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Profile */}
      <SlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} title="Customer Profile">
        {selectedCustomer && (
          <div className="space-y-6 pb-20">
            {/* Profile Header */}
            <div className="text-center bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h3>
              <p className="text-sm text-gray-500 flex justify-center items-center gap-1 mt-1">
                <MapPin size={14} /> {selectedCustomer.location}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-emerald-600">{selectedCustomer.totalSpent}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bookings</p>
                <p className="text-xl font-bold text-gray-900">{selectedCustomer.totalBookings}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-900">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-900">{selectedCustomer.phone}</span>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Account Status</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Customer Since</span>
                  <span className="font-medium text-gray-900">{selectedCustomer.joinedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Recent Action</span>
                  <span className="font-medium text-gray-900">{selectedCustomer.recentActivity}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                <ShoppingBag size={16} /> View All Bookings
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <LifeBuoy size={16} /> Support Tickets ({selectedCustomer.supportTickets})
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}