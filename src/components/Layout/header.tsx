import { Search, Bell, User } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function Header() {
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left: Global Search */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64 md:w-96">
        <Search size={16} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search bookings, users, packages..." 
          className="bg-transparent border-none outline-none ml-2 text-sm w-full text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-6">
        
        {/* GLOBAL CURRENCY SWITCHER */}
        <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Currency</span>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-primary-500"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>

        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">3</span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-gray-800">Super Admin</p>
            <p className="text-xs text-gray-500">System Owner</p>
          </div>
        </div>

      </div>
    </header>
  );
}