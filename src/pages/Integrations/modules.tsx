import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Building2, Flag, FileText, Moon, Ship, Smartphone, Car, Settings, FileCode2, ArrowLeft, Key, Percent, Info, Save } from 'lucide-react';
import { readDefaultFlightPricing, writeDefaultFlightPricing } from '../../utils/amadeusMarkupRules';
import type { DefaultFlightPricing } from '../../types/markupRule';

type Module = {
  id: number;
  name: string;
  provider: string;
  category: string;
  status: boolean;
  b2c: string;
  currency: string;
  env: string;
  color: string;
};

// Complete module list reflecting screenshots and primary NGN currency
const initialModules: Module[] = [
  // Flights
  { id: 1, name: 'Flights', provider: 'Internal', category: 'Flights', status: true, b2c: '3', currency: 'NGN', env: 'Production', color: 'bg-blue-400' },
  { id: 6, name: 'Amadeus', provider: 'Amadeus', category: 'Flights', status: true, b2c: '2', currency: 'USD', env: 'Development', color: 'bg-[#005eb8]' },
  { id: 12, name: 'Kiwi', provider: 'Kiwi', category: 'Flights', status: true, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-[#00a991]' },
  { id: 15, name: 'Seeru', provider: 'Seeru', category: 'Flights', status: true, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-[#21b778]' },
  { id: 31, name: 'Travelpayouts', provider: 'Travelpayouts', category: 'Flights', status: true, b2c: '10', currency: 'USD', env: 'Production', color: 'bg-[#1b93d3]' },
  { id: 44, name: 'Duffel', provider: 'Duffel', category: 'Flights', status: true, b2c: '3', currency: 'NGN', env: 'Development', color: 'bg-[#ff7b88]' },
  { id: 50, name: 'Travelport', provider: 'Travelport', category: 'Flights', status: true, b2c: '0', currency: 'NGN', env: 'Production', color: 'bg-[#89d6d2]' },
  { id: 52, name: 'Kayak', provider: 'Kayak', category: 'Flights', status: false, b2c: '0', currency: 'USD', env: 'Development', color: 'bg-[#ff690f]' },
  { id: 60, name: 'Sabre', provider: 'Sabre', category: 'Flights', status: false, b2c: '5', currency: 'USD', env: 'Development', color: 'bg-[#e50000]' },
  { id: 65, name: 'Google Flights', provider: 'Google Flights', category: 'Flights', status: false, b2c: '2', currency: 'USD', env: 'Production', color: 'bg-[#4285f4]' },
  
  // Internal hotel inventory
  { id: 101, name: 'Hotels', provider: 'Internal', category: 'Hotels', status: true, b2c: '0', currency: 'NGN', env: 'Production', color: 'bg-rose-400' },
  { id: 102, name: 'Booking', provider: 'Booking.com', category: 'Hotels', status: true, b2c: '0', currency: 'USD', env: 'Production', color: 'bg-[#003580]' },
  { id: 103, name: 'Travelport', provider: 'Travelport', category: 'Hotels', status: true, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-[#89d6d2]' },
  { id: 104, name: 'Hotelbeds', provider: 'Hotelbeds', category: 'Hotels', status: true, b2c: '3', currency: 'NGN', env: 'Production', color: 'bg-[#0c1e3e]' },
  { id: 105, name: 'Amadeus', provider: 'Amadeus', category: 'Hotels', status: false, b2c: '10', currency: 'USD', env: 'Development', color: 'bg-[#005eb8]' },
  { id: 106, name: 'Hotelston', provider: 'Hotelston', category: 'Hotels', status: false, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-[#7bb342]' },
  { id: 107, name: 'Ratehawk', provider: 'Ratehawk', category: 'Hotels', status: false, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-[#f4a01c]' },
  { id: 108, name: 'Agoda', provider: 'Agoda', category: 'Hotels', status: false, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-white border border-gray-200 text-gray-800' },
  { id: 109, name: 'Stuba', provider: 'Stuba', category: 'Hotels', status: false, b2c: '3', currency: 'USD', env: 'Production', color: 'bg-[#182a30]' },

  // Tours
  { id: 201, name: 'Toursbms', provider: 'Toursbms', category: 'Tours', status: true, b2c: '10', currency: 'NGN', env: 'Production', color: 'bg-blue-300' },
  { id: 202, name: 'Tours', provider: 'Internal', category: 'Tours', status: true, b2c: '5', currency: 'NGN', env: 'Production', color: 'bg-rose-400' },
  { id: 203, name: 'Viator', provider: 'Viator', category: 'Tours', status: false, b2c: '10', currency: 'NGN', env: 'Production', color: 'bg-[#008768]' },
  { id: 204, name: 'Tiqets', provider: 'Tiqets', category: 'Tours', status: false, b2c: '10', currency: 'USD', env: 'Production', color: 'bg-[#00b4a7]' },

  // Visa & Umrah
  { id: 301, name: 'Visa', provider: 'Internal', category: 'Visa', status: true, b2c: '0', currency: 'NGN', env: 'Production', color: 'bg-gray-800' },
  { id: 401, name: 'Umrah', provider: 'Internal', category: 'Umrah', status: true, b2c: '0', currency: 'NGN', env: 'Production', color: 'bg-emerald-600' },
];

const categoryTypes = [
  { id: 'Flights', icon: Plane },
  { id: 'Hotels', icon: Building2 },
  { id: 'Tours', icon: Flag },
  { id: 'Visa', icon: FileText },
  { id: 'Umrah', icon: Moon },
  { id: 'Ferries', icon: Ship },
  { id: 'eSIM', icon: Smartphone },
  { id: 'Cars', icon: Car },
];

export default function Modules() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [activeCategory, setActiveCategory] = useState('Flights');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [configTab, setConfigTab] = useState<'api' | 'markup'>('api');
  const [pricingByModule, setPricingByModule] = useState<Record<number, DefaultFlightPricing>>({});

  const activeModule = modules.find(m => m.id === editingId);
  const defaultPricing = activeModule ? pricingByModule[activeModule.id] ?? readDefaultFlightPricing(activeModule.id, {
    markupTypeB2C: 'percentage', markupValueB2C: Number(activeModule.b2c),
    baseCurrency: activeModule.category === 'Flights' ? 'NGN' : activeModule.currency, taxType: 'percentage', taxValue: 0, minimumMarginPercent: 0,
  }) : null;
  const updateDefaultPricing = (updates: Partial<DefaultFlightPricing>) => {
    if (!activeModule || !defaultPricing) return;
    const next = { ...defaultPricing, ...updates };
    setPricingByModule(current => ({ ...current, [activeModule.id]: next }));
    writeDefaultFlightPricing(activeModule.id, next);
  };
  const markupSummary = (module: Module) => {
    const pricing = readDefaultFlightPricing(module.id, {
      markupTypeB2C: 'percentage', markupValueB2C: Number(module.b2c), baseCurrency: 'NGN', taxType: 'percentage', taxValue: 0, minimumMarginPercent: 0,
    });
    return pricing.markupTypeB2C === 'percentage' ? `${pricing.markupValueB2C}%` : `${pricing.baseCurrency} ${pricing.markupValueB2C.toFixed(2)}`;
  };
  const filteredModules = modules.filter(m => m.category === activeCategory);
  const activeCount = filteredModules.filter(m => m.status).length;
  const totalCount = filteredModules.length;

  const toggleStatus = (id: number) => {
    setModules(modules.map(m => m.id === id ? { ...m, status: !m.status } : m));
  };

  const handleSettingsClick = (mod: Module) => {
    if (mod.category === 'Visa') {
      navigate('/visa');
    } else if (mod.category === 'Umrah') {
      navigate('/umrah');
    } else {
      setEditingId(mod.id);
    }
  };

  // --- CONFIGURATION VIEW ---
  if (activeModule) {
    return (
      <div className="w-full max-w-none space-y-6 pb-24 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{activeModule.name} Configuration</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Plane size={14} /> {activeModule.category} Module • # ID: {activeModule.id}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Module Status</label>
              <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 block w-full p-2 outline-none shadow-sm">
                <option selected={activeModule.status}>Active</option>
                <option selected={!activeModule.status}>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Environment</label>
              <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 block w-full p-2 outline-none shadow-sm">
                <option selected={activeModule.env === 'Development'}>Development</option>
                <option selected={activeModule.env === 'Production'}>Production</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 flex gap-6">
          <button onClick={() => setConfigTab('api')} className={`pb-3 text-sm font-medium flex items-center gap-2 ${configTab === 'api' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Key size={16} /> API Credentials
          </button>
          <button onClick={() => setConfigTab('markup')} className={`pb-3 text-sm font-medium flex items-center gap-2 ${configTab === 'markup' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Percent size={16} /> Markup & Tax
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
          <div className="min-w-0 space-y-6 2xl:col-span-4">
            
            {/* TAB: API Credentials */}
            {configTab === 'api' && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Key size={16} className="text-gray-500" /> API Credentials</h3>
                    <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded">{activeModule.provider} Integration</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key <span className="text-red-500">*</span></label>
                      <input type="password" defaultValue="••••••••••••••••••••••••" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Secret <span className="text-red-500">*</span></label>
                      <input type="password" defaultValue="••••••••••••••••" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Settings size={16} className="text-gray-500" /> API Testing</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">Test your API credentials to ensure connectivity</p>
                    <button className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                      <Settings size={16} /> Test API Connection
                    </button>
                  </div>
                </div>

              </>
            )}

            {/* TAB: Markup & Tax */}
            {configTab === 'markup' && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Percent size={16} className="text-gray-500" /> Pricing Configuration</h3>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Markup Type B2C</label>
                        <select value={defaultPricing?.markupTypeB2C} onChange={event => updateDefaultPricing({ markupTypeB2C: event.target.value as DefaultFlightPricing['markupTypeB2C'] })} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Markup Value</label>
                        <input type="number" min="0" max={defaultPricing?.markupTypeB2C === 'percentage' ? 100 : undefined} value={defaultPricing?.markupValueB2C ?? 0} onChange={event => updateDefaultPricing({ markupValueB2C: Math.min(defaultPricing?.markupTypeB2C === 'percentage' ? 100 : Infinity, Math.max(0, Number(event.target.value))) })} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Currency</label>
                      <select value={defaultPricing?.baseCurrency} onChange={event => updateDefaultPricing({ baseCurrency: event.target.value })} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="NGN">NGN - Nigerian Naira</option>
                        <option value="USD">USD - United States Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText size={16} className="text-gray-500" /> Tax Configuration</h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                      <select value={defaultPricing?.taxType} onChange={event => updateDefaultPricing({ taxType: event.target.value as DefaultFlightPricing['taxType'] })} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax value</label>
                      <input type="number" min="0" max={defaultPricing?.taxType === 'percentage' ? 100 : undefined} value={defaultPricing?.taxValue ?? 0} onChange={event => updateDefaultPricing({ taxValue: Math.min(defaultPricing?.taxType === 'percentage' ? 100 : Infinity, Math.max(0, Number(event.target.value))) })} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="space-y-6 2xl:col-span-1">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Info size={16} className="text-gray-500" /> Module Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Module ID:</span><span className="font-medium text-gray-900">{activeModule.id}</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Type:</span><span className="font-medium text-gray-900">{activeModule.category}</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Provider:</span><span className="font-medium text-gray-900">{activeModule.provider}</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${activeModule.status ? 'text-emerald-600' : 'text-red-600'}`}>{activeModule.status ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Environment:</span>
                  <span className={`font-medium ${activeModule.env === 'Production' ? 'text-blue-600' : 'text-amber-600'}`}>{activeModule.env}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FileText size={16} className="text-gray-500" /> Help & Documentation
              </h3>
              <a href="#" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                <FileCode2 size={14} /> Setup Documentation
              </a>
            </div>
          </div>
        </div>

        <footer className="fixed bottom-0 left-[var(--admin-sidebar-offset)] right-0 z-40 border-t border-gray-200 bg-white/95 px-8 py-3 shadow-[0_-4px_10px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
            <div className="flex items-center justify-between 2xl:col-span-4">
              <button onClick={() => setEditingId(null)} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowLeft size={16} /> Back to Modules
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700">
                <Save size={16} /> Save Configuration
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Modules</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your travel service modules</p>
        </div>
        <div className="flex gap-4 text-right">
          <div><p className="text-2xl font-bold text-emerald-500">{activeCount}</p><p className="text-xs text-gray-500 uppercase">Active</p></div>
          <div><p className="text-2xl font-bold text-gray-900">{totalCount}</p><p className="text-xs text-gray-500 uppercase">Total</p></div>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categoryTypes.map((cat) => {
          const count = modules.filter(m => m.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <cat.icon size={16} />
              {cat.id}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeCategory === cat.id ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredModules.map((mod) => (
          <div key={mod.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm ${mod.color}`}>
                    {mod.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{mod.name}</h3>
                    <p className="text-xs text-gray-500">{mod.category}</p>
                  </div>
                </div>
                <button onClick={() => toggleStatus(mod.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mod.status ? 'bg-primary-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${mod.status ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Markup B2C</p><p className="text-sm font-medium text-gray-800">{markupSummary(mod)}</p></div>
                <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Currency</p><p className="text-sm font-medium text-gray-800">{mod.currency}</p></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleSettingsClick(mod)} className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                <Settings size={14} /> Settings
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <FileCode2 size={14} /> Docs
              </button>
            </div>
          </div>
        ))}
        {filteredModules.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
            No modules found in this category.
          </div>
        )}
      </div>
    </div>
  );
}