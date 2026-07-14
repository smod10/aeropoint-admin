import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Columns, Plus, Edit2, Trash2, Globe } from 'lucide-react';

const topDestinations = [
  'United Kingdom', 'United States', 'Canada', 'United Arab Emirates', 'Saudi Arabia', 
  'South Africa', 'Egypt', 'Kenya', 'Rwanda', 'Qatar', 'Turkey', 'Singapore', 'Malaysia', 
  'China', 'India'
];

const initialVisas = topDestinations.map((country, index) => ({
  id: index + 1,
  status: true,
  fromCountry: 'Nigeria',
  toCountry: country,
  configuredTypes: Math.floor(Math.random() * 3) + 1, // Simulates showing 1 to 3 visas created per country
}));

export default function VisaList() {
  const [visas, setVisas] = useState(initialVisas);
  const navigate = useNavigate();

  const toggleStatus = (id: number) => setVisas(visas.map(v => v.id === id ? { ...v, status: !v.status } : v));
  const handleDelete = (id: number) => { if (confirm('Are you sure you want to delete this destination?')) setVisas(visas.filter(v => v.id !== id)); };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-soft border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Visa Management (Nigeria)</h2>
          <p className="text-sm text-gray-500 mt-1">Manage destination countries and their available visas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex relative">
            <input type="text" placeholder="Search destination..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors"><Search size={16} /></button>
          </div>
          <button onClick={() => navigate('/visa/edit/new')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm ml-2">
            <Plus size={16} /> Add Destination
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-6 py-4 w-16 text-center">Image</th>
                <th className="px-6 py-4">From</th>
                <th className="px-6 py-4 font-bold text-gray-800">Destination Country</th>
                <th className="px-6 py-4 text-center">Configured Visas</th>
                <th className="px-6 py-4 text-center">Website Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visas.map((visa) => (
                <tr key={visa.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                  <td className="px-6 py-3 text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-primary-600 flex items-center justify-center mx-auto"><Globe size={14} /></div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{visa.fromCountry}</td>
                  <td className="px-6 py-3 font-bold text-gray-900">{visa.toCountry}</td>
                  
                  <td className="px-6 py-3 text-center">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-md">
                      {visa.configuredTypes} Options
                    </span>
                  </td>
                  
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => toggleStatus(visa.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${visa.status ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${visa.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  
                  <td className="px-6 py-3 text-center space-x-1">
                    <button onClick={() => navigate(`/visa/edit/${visa.id}`)} className="inline-flex p-1.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(visa.id)} className="inline-flex p-1.5 text-gray-500 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}