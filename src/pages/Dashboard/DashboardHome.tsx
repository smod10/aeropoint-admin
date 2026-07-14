import { 
  Calendar, Users, TrendingUp, Landmark, FileX, AlertOctagon, 
  XCircle, Banknote, UserMinus, BookOpen, Plane, Building2, Flag, FileText, BarChart3, Settings, PenTool
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Aeropoint Express Travel Management System</p>
      </div>

      {/* Row 1: Overview */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
          <BarChart3 size={16} className="text-gray-500" /> Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => navigate('/bookings')} className="border border-gray-100 rounded-xl p-5 flex items-center gap-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Calendar size={24} /></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Bookings</p><h4 className="text-2xl font-bold text-gray-900">208</h4></div>
          </div>
          <div onClick={() => navigate('/users')} className="border border-gray-100 rounded-xl p-5 flex items-center gap-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Users size={24} /></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Users</p><h4 className="text-2xl font-bold text-gray-900">198</h4></div>
          </div>
          <div onClick={() => navigate('/bookings')} className="border border-gray-100 rounded-xl p-5 flex items-center gap-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors"><TrendingUp size={24} /></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">This Month Bookings</p><h4 className="text-2xl font-bold text-gray-900">208</h4></div>
          </div>
          <div onClick={() => navigate('/reports')} className="border border-gray-100 rounded-xl p-5 flex items-center gap-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors"><Landmark size={24} /></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">This Month Revenue</p><h4 className="text-2xl font-bold text-gray-900">USD 114</h4></div>
          </div>
        </div>
      </div>

      {/* Row 2: Actions & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Actions Required */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><AlertOctagon size={16} className="text-gray-500" /> Actions (required)</h3>
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">364 Pending</span>
          </div>
          <div className="space-y-3">
            <div onClick={() => navigate('/bookings')} className="flex justify-between items-center p-4 bg-red-50/50 border border-red-100 rounded-xl cursor-pointer hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3"><FileX className="text-red-500" size={20} /><div><h4 className="text-sm font-bold text-red-700 uppercase tracking-wider">Unpaid Bookings</h4><p className="text-xs text-red-600 mt-0.5">Payment Pending</p></div></div>
              <span className="text-2xl font-black text-red-600">193</span>
            </div>
            <div onClick={() => navigate('/payments')} className="flex justify-between items-center p-4 bg-rose-50/50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors">
              <div className="flex items-center gap-3"><AlertOctagon className="text-rose-500" size={20} /><div><h4 className="text-sm font-bold text-rose-700 uppercase tracking-wider">Failed Payments</h4><p className="text-xs text-rose-600 mt-0.5">Require Attention</p></div></div>
              <span className="text-2xl font-black text-rose-600">0</span>
            </div>
            <div onClick={() => navigate('/bookings')} className="flex justify-between items-center p-4 bg-orange-50/50 border border-orange-100 rounded-xl cursor-pointer hover:bg-orange-50 transition-colors">
              <div className="flex items-center gap-3"><XCircle className="text-orange-500" size={20} /><div><h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider">Cancellation Requests</h4><p className="text-xs text-orange-600 mt-0.5">Process Cancellation</p></div></div>
              <span className="text-2xl font-black text-orange-600">20</span>
            </div>
            <div onClick={() => navigate('/payments')} className="flex justify-between items-center p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
              <div className="flex items-center gap-3"><Banknote className="text-emerald-500" size={20} /><div><h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Pending Deposits</h4><p className="text-xs text-emerald-600 mt-0.5">Deposit Approval (required)</p></div></div>
              <span className="text-2xl font-black text-emerald-600">1</span>
            </div>
            <div onClick={() => navigate('/users')} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3"><UserMinus className="text-gray-500" size={20} /><div><h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Inactive Users</h4><p className="text-xs text-gray-500 mt-0.5">Review Inactive Accounts</p></div></div>
              <span className="text-2xl font-black text-gray-800">150</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={16} className="text-gray-500" /> Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BookOpen, title: 'Bookings', desc: 'Manage Bookings', path: '/bookings' },
              { icon: Users, title: 'Users', desc: 'Manage Users', path: '/users' }, // Corrected path
              { icon: Plane, title: 'Flights', desc: 'Manage Flights', path: '/flights', active: true },
              { icon: Building2, title: 'Stays', desc: 'Manage Stays', path: '/hotels' },
              { icon: Flag, title: 'Tours', desc: 'Manage Tours', path: '/tours' },
              { icon: FileText, title: 'Pages', desc: 'Manage Pages', path: '/' },
              { icon: PenTool, title: 'Blogs', desc: 'Manage Blogs', path: '/blog' },
              { icon: BarChart3, title: 'Finance', desc: 'Transactions', path: '/payments' },
              { icon: Settings, title: 'Settings', desc: 'System Info', path: '/settings' },
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-xl border text-left flex gap-3 transition-colors ${action.active ? 'border-primary-200 bg-primary-50/50 hover:bg-primary-100' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
              >
                <action.icon size={20} className={action.active ? 'text-primary-600' : 'text-gray-400'} />
                <div><h4 className={`text-sm font-bold ${action.active ? 'text-primary-700' : 'text-gray-800'}`}>{action.title}</h4><p className="text-xs text-gray-500 mt-0.5">{action.desc}</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Bookings Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
            <Calendar size={16} className="text-gray-500" /> This Month Bookings Performance
          </h3>
          <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-800">July 2026</span><span className="text-xs text-gray-500">Jul 1 - Jul 14</span></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-600 flex items-center gap-1 mb-1"><Calendar size={12}/> Bookings</p>
              <p className="text-2xl font-bold text-gray-900">208</p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mb-1"><Banknote size={12}/> Revenue</p>
              <p className="text-2xl font-bold text-gray-900">USD 113.92</p>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By Module</p>
          <div className="space-y-1">
            {[ 
              {name: 'Flights', val: 67, path: '/bookings/type/flights'}, 
              {name: 'Visa', val: 19, path: '/bookings/type/visa'}, 
              {name: 'Umrah', val: 7, path: '/bookings/type/umrah'}, 
              {name: 'Tours', val: 20, path: '/bookings/type/tours'}, 
              {name: 'Stays', val: 33, path: '/bookings/type/stays'} 
            ].map(m => (
              <div key={m.name} onClick={() => navigate(m.path)} className="flex justify-between items-center py-2 px-3 border border-transparent rounded-lg hover:bg-gray-50 hover:border-gray-100 cursor-pointer transition-colors text-sm group">
                <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:text-blue-700"><Plane size={14}/> {m.name}</span>
                <span className="font-bold text-gray-800">{m.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
            <Calendar size={16} className="text-gray-500" /> Last Month Bookings Performance
          </h3>
          <div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-gray-800">June 2026</span><span className="text-xs text-gray-500">Jun 1 - Jun 30</span></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
              <p className="text-xs font-medium text-purple-600 flex items-center gap-1 mb-1"><Calendar size={12}/> Bookings</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mb-1"><Banknote size={12}/> Revenue</p>
              <p className="text-2xl font-bold text-gray-900">USD 0.00</p>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By Module</p>
          <div className="space-y-1">
            {[ 
              {name: 'Flights', val: 0, path: '/bookings/type/flights'}, 
              {name: 'Visa', val: 0, path: '/bookings/type/visa'}, 
              {name: 'Umrah', val: 0, path: '/bookings/type/umrah'}, 
              {name: 'Tours', val: 0, path: '/bookings/type/tours'}, 
              {name: 'Stays', val: 0, path: '/bookings/type/stays'} 
            ].map(m => (
              <div key={m.name} onClick={() => navigate(m.path)} className="flex justify-between items-center py-2 px-3 border border-transparent rounded-lg hover:bg-gray-50 hover:border-gray-100 cursor-pointer transition-colors text-sm group">
                <span className="text-blue-600 font-medium flex items-center gap-2 group-hover:text-blue-700"><Plane size={14}/> {m.name}</span>
                <span className="font-bold text-gray-800">{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}