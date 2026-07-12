import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Plane, Building2, Package, 
  FileText, Moon, Users, CreditCard, Plug, PenTool, 
  Image as ImageIcon, BarChart3, Settings, LogOut, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Bookings', path: '/bookings', icon: BookOpen },
  { name: 'Flights', path: '/flights', icon: Plane },
  { name: 'Hotels', path: '/hotels', icon: Building2 },
  { name: 'Packages', path: '/packages', icon: Package },
  { name: 'Visa', path: '/visa', icon: FileText },
  { name: 'Umrah', path: '/umrah', icon: Moon },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Integrations', path: '/integrations', icon: Plug },
  { name: 'Blog', path: '/blog', icon: PenTool },
  { name: 'Media', path: '/media', icon: ImageIcon },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isExpanded, toggleSidebar }: { isExpanded: boolean, toggleSidebar: () => void }) {
  return (
    <aside className={`bg-sidebar text-slate-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between h-16 border-b border-slate-800">
        {isExpanded && <h1 className="text-xl font-bold text-white tracking-tight truncate pr-2">Aeropoint<span className="text-primary-500">.</span></h1>}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mx-auto">
          {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg transition-colors group relative ${
                isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              } ${!isExpanded && 'justify-center'}`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {isExpanded && <span className="ml-3 text-sm font-medium truncate">{item.name}</span>}
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-3 mt-auto border-t border-slate-800">
        <button className={`flex items-center px-3 py-2.5 w-full rounded-lg hover:bg-slate-800 transition-colors text-red-400 hover:text-red-300 ${!isExpanded && 'justify-center'}`}>
          <LogOut size={20} className="flex-shrink-0" />
          {isExpanded && <span className="ml-3 text-sm font-medium truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
}