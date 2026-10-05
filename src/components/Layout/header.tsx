import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, CalendarCheck, CreditCard, UserRoundPlus, LogOut, CircleUserRound } from 'lucide-react';
import { useCurrency, type Currency } from '../../context/CurrencyContext';

const notifications = [
  { id: 'booking', title: 'New flight booking', detail: 'A booking is waiting for review.', time: '10 min ago', icon: CalendarCheck, path: '/bookings' },
  { id: 'payment', title: 'Payment received', detail: 'A transaction has been completed.', time: '32 min ago', icon: CreditCard, path: '/payments' },
  { id: 'user', title: 'New customer registered', detail: 'Review the latest customer profile.', time: '1 hour ago', icon: UserRoundPlus, path: '/users' },
];

export default function Header() {
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'profile' | null>(null);
  const [unread, setUnread] = useState(() => notifications.map(item => item.id));
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openNotification = (id: string, path: string) => {
    setUnread(current => current.filter(notificationId => notificationId !== id));
    setOpenMenu(null);
    navigate(path);
  };

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
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-700 outline-none cursor-pointer focus:ring-2 focus:ring-primary-500"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>

        <div ref={menuRef} className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={openMenu === 'notifications'}
              onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}
              className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Bell size={20} />
              {unread.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary-500 rounded-full border-2 border-white" />}
            </button>
            {openMenu === 'notifications' && (
              <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                  {unread.length > 0 && <button onClick={() => setUnread([])} className="text-xs font-medium text-primary-600 hover:text-primary-800">Mark all read</button>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.map(item => {
                    const Icon = item.icon;
                    const isUnread = unread.includes(item.id);
                    return (
                      <button key={item.id} onClick={() => openNotification(item.id, item.path)} className="w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600"><Icon size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2 text-sm font-medium text-gray-900">{item.title}{isUnread && <span className="h-2 w-2 rounded-full bg-secondary-500" />}</span>
                          <span className="block mt-0.5 text-xs text-gray-500">{item.detail}</span>
                          <span className="block mt-1 text-[11px] text-gray-400">{item.time}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 text-right">
                  <button onClick={() => { setOpenMenu(null); navigate('/bookings'); }} className="text-xs font-medium text-primary-600 hover:text-primary-800">View bookings</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="User menu"
              aria-expanded={openMenu === 'profile'}
              onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
              className="flex items-center gap-3 rounded-lg p-1.5 text-left hover:bg-gray-50"
            >
              <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold"><User size={16} /></span>
              <span className="hidden md:block">
                <span className="block text-sm font-bold text-gray-800">Super Admin</span>
                <span className="block text-xs text-gray-500">System Owner</span>
              </span>
            </button>
            {openMenu === 'profile' && (
              <div className="absolute right-0 top-12 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1">
                <button onClick={() => { setOpenMenu(null); navigate('/users/edit/1'); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><CircleUserRound size={16} /> View profile</button>
                <button onClick={() => { setOpenMenu(null); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><LogOut size={16} /> Log out</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}