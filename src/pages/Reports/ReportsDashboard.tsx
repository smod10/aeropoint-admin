import { useState } from 'react';
import { Download, TrendingUp, DollarSign, Package, Building2, Plane } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

// Mock Data
const revenueData = [
  { name: 'Jan', flights: 4000, hotels: 2400, packages: 2400 },
  { name: 'Feb', flights: 3000, hotels: 1398, packages: 2210 },
  { name: 'Mar', flights: 2000, hotels: 9800, packages: 2290 },
  { name: 'Apr', flights: 2780, hotels: 3908, packages: 2000 },
  { name: 'May', flights: 1890, hotels: 4800, packages: 2181 },
  { name: 'Jun', flights: 2390, hotels: 3800, packages: 2500 },
  { name: 'Jul', flights: 3490, hotels: 4300, packages: 2100 },
];

const topDestinations = [
  { rank: 1, city: 'Dubai, UAE', bookings: 142, revenueUSD: 124500 },
  { rank: 2, city: 'London, UK', bookings: 98, revenueUSD: 89200 },
  { rank: 3, city: 'Paris, France', bookings: 85, revenueUSD: 76400 },
  { rank: 4, city: 'Mecca, KSA', bookings: 72, revenueUSD: 105000 },
];

export default function ReportsDashboard() {
  const [timeframe, setTimeframe] = useState('This Year');
  const { convertFromAndFormat } = useCurrency();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track company revenue, sales by module, and popular destinations.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
          >
            <option>This Month</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
          <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{convertFromAndFormat(342800, 'USD')}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign size={20} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 gap-1">
            <TrendingUp size={14} /> +14.5% <span className="text-gray-400 font-normal ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Flight Sales</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">1,245</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Plane size={20} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 gap-1">
            <TrendingUp size={14} /> +5.2% <span className="text-gray-400 font-normal ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Hotel Nights</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">892</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Building2 size={20} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 gap-1">
            <TrendingUp size={14} /> +8.1% <span className="text-gray-400 font-normal ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Packages Sold</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">156</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Package size={20} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 gap-1">
            <TrendingUp size={14} /> +12.3% <span className="text-gray-400 font-normal ml-1">vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Revenue Breakdown (by Module)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="flights" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="hotels" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="packages" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Flights</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Hotels</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Packages</span>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Destinations</h3>
          <div className="space-y-4">
            {topDestinations.map((dest) => (
              <div key={dest.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                    {dest.rank}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{dest.city}</h4>
                    <p className="text-xs text-gray-500">{dest.bookings} Bookings</p>
                  </div>
                </div>
                <div className="font-semibold text-emerald-600">{convertFromAndFormat(dest.revenueUSD, 'USD')}</div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            View All Destinations
          </button>
        </div>
      </div>
    </div>
  );
}