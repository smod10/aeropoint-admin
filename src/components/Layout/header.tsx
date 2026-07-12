import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center w-96">
        <Search className="text-gray-400 absolute ml-3" size={18} />
        <input 
          type="text" 
          placeholder="Search bookings, customers, or flights..." 
          className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            AD
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}