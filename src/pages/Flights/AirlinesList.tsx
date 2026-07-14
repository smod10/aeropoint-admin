import { useState } from 'react';
import { Search, LayoutIcon, Plus, Eye, Edit2, Trash2, Check } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

const initialAirlines = [
  { id: 1, status: true, name: 'Emirates', code: 'EK', iata: 'UAE', country: 'United Arab Emirates' },
  { id: 2, status: true, name: 'Qatar Airways', code: 'QR', iata: 'QTR', country: 'Qatar' },
  { id: 3, status: true, name: 'British Airways', code: 'BA', iata: 'BAW', country: 'United Kingdom' },
  { id: 4, status: true, name: 'Lufthansa', code: 'LH', iata: 'DLH', country: 'Germany' },
  { id: 5, status: true, name: 'Singapore Airlines', code: 'SQ', iata: 'SIA', country: 'Singapore' },
  { id: 6, status: true, name: 'Thai Airways', code: 'TG', iata: 'THA', country: 'Thailand' },
  { id: 7, status: false, name: 'Fly One', code: '5F', iata: 'FIA', country: 'Moldova' },
  { id: 8, status: true, name: 'Delta Air Lines', code: 'DL', iata: 'DAL', country: 'United States' },
];

export default function AirlinesList() {
  const [airlines, setAirlines] = useState(initialAirlines);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<any>(null);

  const toggleStatus = (id: number) => {
    setAirlines(airlines.map(a => a.id === id ? { ...a, status: !a.status } : a));
  };

  const openForm = (airline: any = null) => {
    setEditingAirline(airline);
    setIsSlideOverOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Airlines Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total: 5,886 records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <LayoutIcon size={16} /> View Columns
          </button>
          <div className="flex relative">
            <input type="text" placeholder="Search airlines..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
          <button onClick={() => openForm()} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4 w-24">Status</th>
                <th className="px-6 py-4">Airline Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">IATA</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {airlines.map((airline, index) => (
                <tr key={airline.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                  <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                  
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => toggleStatus(airline.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${airline.status ? 'bg-primary-600' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${airline.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-6 py-3 font-medium text-gray-900">{airline.name}</td>
                  <td className="px-6 py-3">
                    {airline.code ? <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-md">{airline.code}</span> : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-600 rounded-md">{airline.iata}</span>
                  </td>
                  <td className="px-6 py-3">{airline.country}</td>
                  
                  <td className="px-6 py-3 text-center space-x-1">
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-primary-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="View"><Eye size={14} /></button>
                    <button onClick={() => openForm(airline)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit"><Edit2 size={14} /></button>
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SlideOver Form */}
      <SlideOver isOpen={isSlideOverOpen} onClose={() => setIsSlideOverOpen(false)} title={editingAirline ? "Edit Airline" : "Add Airline"}>
        <form className="space-y-5 pb-24" onSubmit={(e) => { e.preventDefault(); setIsSlideOverOpen(false); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airline Name</label>
            <input type="text" defaultValue={editingAirline?.name || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code (2-letter)</label>
              <input type="text" defaultValue={editingAirline?.code || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ICAO Code (3-letter)</label>
              <input type="text" defaultValue={editingAirline?.icao || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
            <input type="text" defaultValue={editingAirline?.country || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none" required />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsSlideOverOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <Check size={16} /> Save Airline
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}