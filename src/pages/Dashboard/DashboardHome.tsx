import { 
  TrendingUp, CreditCard, Users, PlaneTakeoff, 
  CheckCircle, Clock, XCircle 
} from 'lucide-react';

const stats = [
  { title: "Revenue Today", value: "$4,250.00", icon: TrendingUp, trend: "+12.5%", positive: true },
  { title: "Revenue This Month", value: "$124,500.00", icon: CreditCard, trend: "+8.2%", positive: true },
  { title: "Today's Bookings", value: "38", icon: PlaneTakeoff, trend: "-2.4%", positive: false },
  { title: "New Customers", value: "12", icon: Users, trend: "+4.1%", positive: true },
];

const bookingStatuses = [
  { title: "Confirmed", count: 145, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Pending", count: 24, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  { title: "Cancelled", count: 7, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is what's happening today.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
              </div>
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
              <span className="text-gray-400 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Cards */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
          <div className="space-y-4">
            {bookingStatuses.map((status, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${status.bg} ${status.color}`}>
                    <status.icon size={18} />
                  </div>
                  <span className="font-medium text-gray-700">{status.title}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Table Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Booking Activity</h3>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock Data Row */}
                <tr className="border-b border-gray-50 last:border-none">
                  <td className="px-4 py-4 font-medium text-gray-900">#BKG-8492</td>
                  <td className="px-4 py-4">Sarah Jenkins</td>
                  <td className="px-4 py-4">Flight (LHR - DXB)</td>
                  <td className="px-4 py-4 font-medium">$840.00</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">Confirmed</span>
                  </td>
                </tr>
                {/* Add more mock rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}