import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Columns, ChevronDown } from 'lucide-react';
import { mockPackages } from '../../data/mockPackages';
import { useCurrency } from '../../context/CurrencyContext';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type PackageColumn = 'status' | 'image' | 'name' | 'location' | 'duration' | 'price' | 'tourType';
type PackageSortKey = 'status' | 'name' | 'location' | 'duration' | 'price' | 'tourType';

export default function PackageList() {
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency(); // Global Currency Hook
  const [packages, setPackages] = useState(mockPackages);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<PackageSortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<Record<PackageColumn, boolean>>({
    status: true,
    image: true,
    name: true,
    location: true,
    duration: true,
    price: true,
    tourType: true,
  });

  const toggleStatus = (id: number) => {
    setPackages(packages.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const sortedPackages = useMemo(() => {
    return [...packages].sort((left, right) => {
      const leftValue = sortKey === 'name' ? left.title
        : sortKey === 'status' ? left.isActive
        : sortKey === 'location' ? left.location
        : sortKey === 'duration' ? left.days * 10 + left.nights
        : sortKey === 'price' ? left.basePriceNGN
        : left.tourType;

      const rightValue = sortKey === 'name' ? right.title
        : sortKey === 'status' ? right.isActive
        : sortKey === 'location' ? right.location
        : sortKey === 'duration' ? right.days * 10 + right.nights
        : sortKey === 'price' ? right.basePriceNGN
        : right.tourType;

      if (sortKey === 'status') {
        return sortDirection === 'asc'
          ? Number(left.isActive) - Number(right.isActive)
          : Number(right.isActive) - Number(left.isActive);
      }

      if (sortKey === 'price') {
        return sortDirection === 'asc'
          ? Number(left.basePriceNGN) - Number(right.basePriceNGN)
          : Number(right.basePriceNGN) - Number(left.basePriceNGN);
      }

      if (sortKey === 'duration') {
        return sortDirection === 'asc'
          ? (left.days * 10 + left.nights) - (right.days * 10 + right.nights)
          : (right.days * 10 + right.nights) - (left.days * 10 + left.nights);
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [packages, sortDirection, sortKey]);

  const totalItems = sortedPackages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedPackages = sortedPackages.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: PackageSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: PackageSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-primary-600" />
      : <ArrowDown size={12} className="text-primary-600" />;
  };

  const toggleColumn = (column: PackageColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tours Management</h2>
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
                  { key: 'name', label: 'Tour Name' },
                  { key: 'location', label: 'Location' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'price', label: 'Price' },
                  { key: 'tourType', label: 'Tour Type' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[col.key as PackageColumn]} onChange={() => toggleColumn(col.key as PackageColumn)} className="rounded border-gray-300" />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            All Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>

          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2.5 rounded-r-lg hover:bg-primary-700 transition-colors">
              <Search size={16} />
            </button>
          </div>

          <button onClick={() => navigate('/packages/edit/new')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm ml-2">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.status && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-primary-600">Status {sortIcon('status')}</button></th>}
                {visibleColumns.image && <th className="px-4 py-4">Image</th>}
                {visibleColumns.name && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('name')} className="inline-flex items-center gap-1 hover:text-primary-600">Tour Name {sortIcon('name')}</button></th>}
                {visibleColumns.location && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('location')} className="inline-flex items-center gap-1 hover:text-primary-600">Location {sortIcon('location')}</button></th>}
                {visibleColumns.duration && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('duration')} className="inline-flex items-center gap-1 hover:text-primary-600">Duration {sortIcon('duration')}</button></th>}
                {visibleColumns.price && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('price')} className="inline-flex items-center gap-1 hover:text-primary-600">Price {sortIcon('price')}</button></th>}
                {visibleColumns.tourType && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('tourType')} className="inline-flex items-center gap-1 hover:text-primary-600">Tour Type {sortIcon('tourType')}</button></th>}
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedPackages.map((pkg, i) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                  
                  {/* Status Toggle */}
                  {visibleColumns.status && <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(pkg.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pkg.isActive ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${pkg.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>}

                  {/* Thumbnail */}
                  {visibleColumns.image && <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                    </div>
                  </td>}

                  {visibleColumns.name && <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[250px]">{pkg.title}</td>}
                  {visibleColumns.location && <td className="px-4 py-3 text-gray-700">{pkg.location}</td>}
                  {visibleColumns.duration && <td className="px-4 py-3 text-gray-700">{pkg.days}D / {pkg.nights}N</td>}
                  
                  {/* Currency Converted Price */}
                  {visibleColumns.price && <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                      {convertAndFormat(pkg.basePriceNGN)}
                    </span>
                  </td>}

                  {visibleColumns.tourType && <td className="px-4 py-3 text-gray-700">{pkg.tourType}</td>}
                  
                  {/* Actions */}
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => navigate(`/packages/edit/${pkg.id}`)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
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

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer text-sm">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {number}
              </button>
            ))}
            <button onClick={() => setCurrentPage(previous => Math.min(previous + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 h-8 flex items-center justify-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}