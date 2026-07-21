import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, DollarSign, TrendingUp, 
  ArrowUpRight, Plane, Building2, Package, Ticket
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { mockBookings } from '../../data/mockBookings';

export default function DashboardHome() {
  const navigate = useNavigate();
  
  // FIXED: Changed convertFromAndFormat to convertAndFormat
  const { convertAndFormat, currency } = useCurrency(); 
  
  // Grab the 5 most recent bookings for the dashboard table
  const [recentBookings] = useState(mockBookings.slice(0, 5));

  // Simulated Base Metrics (in NGN)
  const totalRevenueNGN = 125430000; 
  const monthlyRevenueNGN = 14500000;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here is what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/bookings')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            View All Bookings
          </button>
          <button onClick={() => navigate('/reports/transactions')} className="bg-[#0d6efd] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Stat 1: Total Revenue (Dynamic Currency) */}
        <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-800">{convertAndFormat(totalRevenueNGN)}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp size={14}/> +14.5%</span>
            <span className="text-gray-400 ml-2">vs last year</span>
          </div>
        </div>

        {/* Stat 2: Monthly Revenue (Dynamic Currency) */}
        <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Revenue</p>
              <h3 className="text-2xl font-black text-gray-800">{convertAndFormat(monthlyRevenueNGN)}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-[#0d6efd] rounded-full flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp size={14}/> +8.2%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* Stat 3: Total Bookings */}
        <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Bookings</p>
              <h3 className="text-2xl font-black text-gray-800">8,432</h3>
            </div>
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp size={14}/> +12%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* Stat 4: Active Users */}
        <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Users</p>
              <h3 className="text-2xl font-black text-gray-800">1,249</h3>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp size={14}/> +4.1%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

      </div>

      {/* Quick Links & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
            <button onClick={() => navigate('/bookings')} className="text-sm font-medium text-[#0d6efd] hover:text-blue-800 flex items-center gap-1 transition-colors">
              View All <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Amount ({currency})</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking) => {
                  const bStatus = booking.booking.split('\n')[0].toLowerCase();
                  const customerName = booking.user.split('\n')[0];
                  
                  // Extract base price and markup
                  const totalPrice = Number(booking.price);
                  const markup = Number(booking.earning);
                  const basePrice = totalPrice - markup;

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/bookings/view/${booking.invoice}`)}>
                      <td className="px-6 py-4 font-mono text-[#0d6efd] font-bold">{booking.invoice}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{customerName}</td>
                      <td className="px-6 py-4 text-gray-600 capitalize">{booking.moduleType}</td>
                      <td className="px-6 py-4 text-gray-800 font-bold">{convertAndFormat(basePrice)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${bStatus.includes('confirmed') ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {bStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h3>
          
          <div className="space-y-3">
            <button onClick={() => navigate('/flights/edit/new')} className="w-full flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-[#0d6efd] rounded-lg flex items-center justify-center group-hover:bg-[#0d6efd] group-hover:text-white transition-colors">
                  <Plane size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Add Flight</h4>
                  <p className="text-xs text-gray-500">Create a new flight route</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#0d6efd] transition-colors"/>
            </button>

            <button onClick={() => navigate('/packages/edit/new')} className="w-full flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Package size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Create Package</h4>
                  <p className="text-xs text-gray-500">Build a new tour itinerary</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors"/>
            </button>

            <button onClick={() => navigate('/visa/edit/new')} className="w-full flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Ticket size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Add Visa</h4>
                  <p className="text-xs text-gray-500">Configure new destination</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors"/>
            </button>

            <button onClick={() => navigate('/hotels')} className="w-full flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Building2 size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-gray-800">Manage Hotels</h4>
                  <p className="text-xs text-gray-500">View and edit properties</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors"/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}