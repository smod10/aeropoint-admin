import { useMemo, useState } from 'react';
import { Search, LayoutIcon, Plus, Edit2, Trash2, Check, FileUp, ChevronLeft, ChevronRight } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';
import AirportBulkUpload from './AirportBulkUpload';
import { getAvailableAirports, type Airport } from '../../data/airports';

type AirportColumn = 'status' | 'name' | 'city' | 'country' | 'iata';

export default function AirportsList() {
  const [airports, setAirports] = useState<Airport[]>(getAvailableAirports);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [visibleColumns, setVisibleColumns] = useState<Record<AirportColumn, boolean>>({
    status: true,
    name: true,
    city: true,
    country: true,
    iata: true,
  });

  const toggleStatus = (id: number) => {
    const updated = airports.map(a => (a.id === id ? { ...a, status: !a.status } : a));
    setAirports(updated);
    localStorage.setItem('aeropoint-imported-airports', JSON.stringify(updated));
  };

  const deleteAirport = (airport: Airport) => {
    if (!window.confirm(`Delete ${airport.name} (${airport.iata}) from airports database?`)) return;
    const updated = airports.filter(a => a.id !== airport.id);
    setAirports(updated);
    localStorage.setItem('aeropoint-imported-airports', JSON.stringify(updated));
    setMessage(`Deleted ${airport.name} (${airport.iata}).`);
  };

  const handleBulkSave = (newAirports: Airport[]) => {
    const updated = [...newAirports, ...airports];
    setAirports(updated);
    localStorage.setItem('aeropoint-imported-airports', JSON.stringify(updated));
  };

  const openForm = (airport: Airport | null = null) => {
    setEditingAirport(airport);
    setIsSlideOverOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const iata = String(formData.get('iata') || '').trim().toUpperCase();
    const name = String(formData.get('name') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const country = String(formData.get('country') || '').trim();

    if (!iata || !name) return;

    let updated: Airport[];
    if (editingAirport) {
      updated = airports.map(a =>
        a.id === editingAirport.id ? { ...a, iata, name, city, country } : a
      );
      setMessage(`Updated airport ${name} (${iata}).`);
    } else {
      const newAirport: Airport = {
        id: Date.now(),
        iata,
        name,
        city: city || name,
        country: country || '—',
        status: true,
      };
      updated = [newAirport, ...airports];
      setMessage(`Added new airport ${name} (${iata}).`);
    }

    setAirports(updated);
    localStorage.setItem('aeropoint-imported-airports', JSON.stringify(updated));
    setIsSlideOverOpen(false);
  };

  const toggleColumn = (column: AirportColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const filteredAirports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return airports;
    return airports.filter(
      a =>
        a.name.toLowerCase().includes(query) ||
        (a.iata && a.iata.toLowerCase().includes(query)) ||
        (a.city && a.city.toLowerCase().includes(query)) ||
        (a.country && a.country.toLowerCase().includes(query))
    );
  }, [airports, search]);

  const totalItems = filteredAirports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedAirports = filteredAirports.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Airports Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {totalItems.toLocaleString()} {totalItems === 1 ? 'airport' : 'airports'} (Official IATA & Custom)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnMenuOpen(prev => !prev)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
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
                  <label
                    key={col.key}
                    className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key as AirportColumn]}
                      onChange={() => toggleColumn(col.key as AirportColumn)}
                      className="rounded border-gray-300"
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex relative">
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search airports..."
              className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48"
            />
            <button
              type="button"
              className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors"
            >
              <Search size={16} />
            </button>
          </div>

          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Create New
          </button>

          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FileUp size={16} /> Upload Bulk
          </button>
        </div>
      </div>

      {message && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
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
              {paginatedAirports.length > 0 ? (
                paginatedAirports.map((airport, index) => (
                  <tr key={airport.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                    </td>
                    <td className="px-6 py-3 text-gray-500">{startIndex + index + 1}</td>

                    {visibleColumns.status && (
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggleStatus(airport.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            airport.status ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              airport.status ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    )}

                    {visibleColumns.name && <td className="px-6 py-3 font-medium text-gray-900">{airport.name}</td>}
                    {visibleColumns.city && <td className="px-6 py-3">{airport.city || '—'}</td>}
                    {visibleColumns.country && <td className="px-6 py-3">{airport.country || '—'}</td>}
                    {visibleColumns.iata && (
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-md">
                          {airport.iata}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-3 text-center space-x-1">
                      <button
                        onClick={() => openForm(airport)}
                        className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteAirport(airport)}
                        className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    No airports found matching &quot;{search}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems.toLocaleString()} results
            </span>
            <select
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer text-sm"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={activePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm text-gray-600">
              Page {activePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={activePage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* SlideOver Form */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingAirport ? 'Edit Airport' : 'Add Airport'}
      >
        <form className="space-y-5 pb-24" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code (3-letter) *</label>
            <input
              name="iata"
              type="text"
              maxLength={3}
              defaultValue={editingAirport?.iata || ''}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airport Name *</label>
            <input
              name="name"
              type="text"
              defaultValue={editingAirport?.name || ''}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                name="city"
                type="text"
                defaultValue={editingAirport?.city || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                name="country"
                type="text"
                defaultValue={editingAirport?.country || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <Check size={16} /> Save Airport
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Bulk Upload Modal */}
      {uploadOpen && (
        <AirportBulkUpload
          onClose={() => setUploadOpen(false)}
          existingAirports={airports}
          onSave={handleBulkSave}
          onImported={msg => {
            setUploadOpen(false);
            setMessage(msg);
          }}
        />
      )}
    </div>
  );
}