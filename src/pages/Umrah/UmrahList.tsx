import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Columns, ChevronDown } from 'lucide-react';
import { mockPackages } from '../../data/mockPackages';
import { useCurrency } from '../../context/CurrencyContext';

type UmrahColumn = 'status' | 'image' | 'name' | 'location' | 'duration' | 'price' | 'type';

export default function UmrahList() {
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency();
  // Filter ONLY umrah and islamic packages
  const [packages, setPackages] = useState(mockPackages.filter(p => p.module === 'umrah'));
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<UmrahColumn, boolean>>({
    status: true,
    image: true,
    name: true,
    location: true,
    duration: true,
    price: true,
    type: true,
  });

  const toggleStatus = (id: number) => {
    setPackages(packages.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const toggleColumn = (column: UmrahColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Umrah & Islamic Packages</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {packages.length} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button type="button" onClick={() => setIsColumnMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
              <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2">
                {[
                  { key: 'status', label: 'Status' },
                  { key: 'image', label: 'Image' },
                  { key: 'name', label: 'Package Name' },
                  { key: 'location', label: 'Location' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'price', label: 'Price' },
                  { key: 'type', label: 'Type' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[col.key as UmrahColumn]} onChange={() => toggleColumn(col.key as UmrahColumn)} className="rounded border-gray-300" />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2.5 rounded-r-lg hover:bg-primary-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
          <button onClick={() => navigate('/umrah/edit/new')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm ml-2">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.status && <th className="px-4 py-4 text-center">Status</th>}
                {visibleColumns.image && <th className="px-4 py-4">Image</th>}
                {visibleColumns.name && <th className="px-4 py-4">Package Name</th>}
                {visibleColumns.location && <th className="px-4 py-4">Location</th>}
                {visibleColumns.duration && <th className="px-4 py-4">Duration</th>}
                {visibleColumns.price && <th className="px-4 py-4">Price</th>}
                {visibleColumns.type && <th className="px-4 py-4">Type</th>}
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packages.map((pkg, i) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  {visibleColumns.status && <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(pkg.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pkg.isActive ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${pkg.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>}
                  {visibleColumns.image && <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                    </div>
                  </td>}
                  {visibleColumns.name && <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[250px]">{pkg.title}</td>}
                  {visibleColumns.location && <td className="px-4 py-3 text-gray-700">{pkg.location}</td>}
                  {visibleColumns.duration && <td className="px-4 py-3 text-gray-700">{pkg.days}D / {pkg.nights}N</td>}
                  {visibleColumns.price && <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                      {convertAndFormat(pkg.basePriceNGN)}
                    </span>
                  </td>}
                  {visibleColumns.type && <td className="px-4 py-3 text-gray-700">{pkg.tourType}</td>}
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => navigate(`/umrah/edit/${pkg.id}`)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setPackages(packages.filter(p => p.id !== pkg.id))} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
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