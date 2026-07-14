import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Plane, Building2, Package, 
  FileText, Moon, Users, PenTool, Image as ImageIcon, 
  BarChart3, Settings, LogOut, PanelLeftClose, 
  PanelLeftOpen, ChevronDown, ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { 
    name: 'Bookings', 
    icon: BookOpen,
    subItems: [
      { name: 'All Bookings', path: '/bookings' },
      { name: 'Flights Bookings', path: '/bookings/type/flights' },
      { name: 'Stays Bookings', path: '/bookings/type/stays' },
      { name: 'Tours Bookings', path: '/bookings/type/tours' },
      { name: 'Visa Bookings', path: '/bookings/type/visa' },
      { name: 'Umrah Bookings', path: '/bookings/type/umrah' },
      { name: 'Bus Bookings', path: '/bookings/type/bus' }
    ]
  },
  { 
    name: 'Users', 
    icon: Users,
    subItems: [
      { name: 'All Users', path: '/users' },
      { name: 'Admin', path: '/users/role/admin' },
      { name: 'Supplier', path: '/users/role/supplier' },
      { name: 'Employee', path: '/users/role/employee' },
      { name: 'Customer', path: '/users/role/customer' },
      { name: 'Agent', path: '/users/role/agent' }
    ]
  },
  { 
    name: 'Flights', 
    icon: Plane,
    subItems: [
      { name: 'All Flights', path: '/flights' },
      { name: 'Airlines', path: '/flights/airlines' },
      { name: 'Airports', path: '/flights/airports' }
    ]
  },
  { name: 'Hotels', path: '/hotels', icon: Building2 },
  { name: 'Packages', path: '/packages', icon: Package },
  { 
    name: 'Visa', 
    icon: FileText,
    subItems: [
      { name: 'All Visas', path: '/visa' },
      { name: 'Visa Settings', path: '/visa/settings' }
    ]
  },
  { name: 'Umrah', path: '/umrah', icon: Moon },
  { name: 'Blog', path: '/blog', icon: PenTool },
  { name: 'Media', path: '/media', icon: ImageIcon },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { 
    name: 'Settings', 
    icon: Settings,
    subItems: [
      { name: 'General Settings', path: '/settings' },
      { name: 'Payment Gateways', path: '/payments' },
      { name: 'Modules', path: '/modules' }
    ]
  },
];

export default function Sidebar({ isExpanded, toggleSidebar }: { isExpanded: boolean, toggleSidebar: () => void }) {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Set initial active menu based on URL and enforce accordion behavior
  useEffect(() => {
    const activeItem = navItems.find(item => 
      item.subItems && item.subItems.some(sub => location.pathname.includes(sub.path))
    );
    if (activeItem) setOpenMenu(activeItem.name);
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    if (isExpanded) {
      setOpenMenu(prev => prev === name ? null : name);
    }
  };

  return (
    <aside className={`bg-sidebar text-slate-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-visible transition-all duration-300 z-50 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between h-16 border-b border-slate-800">
        {isExpanded && <h1 className="text-xl font-bold text-white tracking-tight truncate pr-2">Aeropoint<span className="text-primary-500">.</span></h1>}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mx-auto">
          {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-visible hide-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
          const isOpen = openMenu === item.name;

          return (
            <div key={item.name} className="relative group">
              {item.subItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-900/50 text-white' : 'hover:bg-slate-800 hover:text-white'
                  } ${!isExpanded && 'justify-center'}`}
                >
                  <div className="flex items-center">
                    <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                    {isExpanded && <span className="ml-3 text-sm font-medium truncate">{item.name}</span>}
                  </div>
                  {isExpanded && (
                    isOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path!}
                  end
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
                    } ${!isExpanded && 'justify-center'}`
                  }
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {isExpanded && <span className="ml-3 text-sm font-medium truncate">{item.name}</span>}
                </NavLink>
              )}

              {isExpanded && item.subItems && isOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1 pb-2">
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      end
                      className={({ isActive }) =>
                        `block px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`
                      }
                    >
                      {sub.name}
                    </NavLink>
                  ))}
                </div>
              )}

              {!isExpanded && (
                <div className="absolute left-14 top-0 hidden group-hover:block bg-slate-800 text-white rounded-lg shadow-xl py-2 min-w-[160px] z-50 border border-slate-700">
                  {item.subItems ? (
                    <>
                      <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.name}</div>
                      {item.subItems.map((sub) => (
                        <NavLink key={sub.name} to={sub.path} end className={({ isActive }) => `block px-4 py-2 text-sm transition-colors ${isActive ? 'bg-primary-600' : 'hover:bg-slate-700'}`}>
                          {sub.name}
                        </NavLink>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-2 text-sm">{item.name}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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