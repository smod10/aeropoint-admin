import { useState } from 'react';
import { Search, LayoutIcon, Plus, Eye, Edit2, Trash2, Check } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

type AirportColumn = 'status' | 'name' | 'city' | 'country' | 'iata';

const initialAirports = [
  { id: 1, status: true, name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', iata: 'LHR' },
  { id: 2, status: true, name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', iata: 'DXB' },
  { id: 3, status: true, name: 'John F. Kennedy International', city: 'New York', country: 'United States', iata: 'JFK' },
  { id: 4, status: true, name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', iata: 'SIN' },
  { id: 5, status: true, name: 'Banjarmasin Internasional', city: 'Banjarmasin', country: 'Indonesia', iata: 'BDJ' },
  { id: 6, status: true, name: 'Desierto de Atacama Airport', city: 'Copiapo', country: 'Chile', iata: 'CPO' },
  { id: 7, status: false, name: 'Ramon Airport', city: 'Eilat', country: 'Israel', iata: 'ETM' },
];

export default function AirportsList() {
  const [airports, setAirports] = useState(initialAirports);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<any>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<AirportColumn, boolean>>({
    status: true,
    name: true,
    city: true,
    country: true,
    iata: true,
  });

  const toggleStatus = (id: number) => {
    setAirports(airports.map(a => a.id === id ? { ...a, status: !a.status } : a));
  };

  const openForm = (airport: any = null) => {
    setEditingAirport(airport);
    setIsSlideOverOpen(true);
  };

  const toggleColumn = (column: AirportColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Airports Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total: 6,923 records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button type="button" onClick={() => setIsColumnMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <LayoutIcon size={16} /> View Columns
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
                {[
                  { key: 'status', label: 'Status' },
                  { key: 'name', label: 'Airport Name' },
                  { key: 'city', label: 'City' },
                  { key: 'country', label: 'Country' },
                  { key: 'iata', label: 'IATA Code' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[col.key as AirportColumn]} onChange={() => toggleColumn(col.key as AirportColumn)} className="rounded border-gray-300" />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex relative">
            <input type="text" placeholder="Search airports..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
          <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-6 py-4 w-12">#</th>
                {visibleColumns.status && <th className="px-6 py-4 w-24">Status</th>}
                {visibleColumns.name && <th className="px-6 py-4">Airport Name</th>}
                {visibleColumns.city && <th className="px-6 py-4">City</th>}
                {visibleColumns.country && <th className="px-6 py-4">Country</th>}
                {visibleColumns.iata && <th className="px-6 py-4">IATA Code</th>}
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {airports.map((airport, index) => (
                <tr key={airport.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                  <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                  
                  {visibleColumns.status && <td className="px-6 py-3">
                    <button 
                      onClick={() => toggleStatus(airport.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${airport.status ? 'bg-primary-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${airport.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>}

                  {visibleColumns.name && <td className="px-6 py-3 font-medium text-gray-900">{airport.name}</td>}
                  {visibleColumns.city && <td className="px-6 py-3">{airport.city}</td>}
                  {visibleColumns.country && <td className="px-6 py-3">{airport.country}</td>}
                  {visibleColumns.iata && <td className="px-6 py-3">
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-md tracking-wider">{airport.iata}</span>
                  </td>}
                  
                  <td className="px-6 py-3 text-center space-x-1">
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-primary-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="View"><Eye size={14} /></button>
                    <button onClick={() => openForm(airport)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit"><Edit2 size={14} /></button>
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} title={editingAirport ? "Edit Airport" : "Add Airport"}>
        <form className="space-y-5 pb-24" onSubmit={(e) => { e.preventDefault(); setIsSlideOverOpen(false); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airport Name</label>
            <input type="text" defaultValue={editingAirport?.name || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" defaultValue={editingAirport?.city || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" defaultValue={editingAirport?.country || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code (3-letter)</label>
            <input type="text" defaultValue={editingAirport?.iata || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none uppercase" maxLength={3} required />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsSlideOverOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <Check size={16} /> Save Airport
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}