import { useMemo, useState } from 'react';
import { Search, LayoutIcon, Plus, Edit2, Trash2, Check, FileUp, ChevronLeft, ChevronRight } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';
import AirlineBulkUpload from './AirlineBulkUpload';
import { getAvailableAirlines, type Airline } from '../../data/airlines';

type AirlineColumn = 'status' | 'name' | 'code' | 'iata' | 'country';

export default function AirlinesList() {
  const [airlines, setAirlines] = useState<Airline[]>(getAvailableAirlines);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [visibleColumns, setVisibleColumns] = useState<Record<AirlineColumn, boolean>>({
    status: true,
    name: true,
    code: true,
    iata: true,
    country: true,
  });

  const toggleStatus = (id: number) => {
    const updated = airlines.map(a => (a.id === id ? { ...a, status: !a.status } : a));
    setAirlines(updated);
    localStorage.setItem('aeropoint-imported-airlines', JSON.stringify(updated));
  };

  const deleteAirline = (airline: Airline) => {
    if (!window.confirm(`Delete ${airline.name} from airlines database?`)) return;
    const updated = airlines.filter(a => a.id !== airline.id);
    setAirlines(updated);
    localStorage.setItem('aeropoint-imported-airlines', JSON.stringify(updated));
    setMessage(`Deleted ${airline.name}.`);
  };

  const handleBulkSave = (newAirlines: Airline[]) => {
    const updated = [...newAirlines, ...airlines];
    setAirlines(updated);
    localStorage.setItem('aeropoint-imported-airlines', JSON.stringify(updated));
  };

  const openForm = (airline: Airline | null = null) => {
    setEditingAirline(airline);
    setIsSlideOverOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const code = String(formData.get('code') || '').trim().toUpperCase();
    const iata = String(formData.get('iata') || '').trim().toUpperCase();
    const country = String(formData.get('country') || '').trim();

    if (!name) return;

    let updated: Airline[];
    if (editingAirline) {
      updated = airlines.map(a =>
        a.id === editingAirline.id ? { ...a, name, code, iata, country } : a
      );
      setMessage(`Updated airline ${name}.`);
    } else {
      const newAirline: Airline = {
        id: Date.now(),
        name,
        code,
        iata: iata || code,
        country,
        status: true,
      };
      updated = [newAirline, ...airlines];
      setMessage(`Added new airline ${name}.`);
    }

    setAirlines(updated);
    localStorage.setItem('aeropoint-imported-airlines', JSON.stringify(updated));
    setIsSlideOverOpen(false);
  };

  const toggleColumn = (column: AirlineColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const filteredAirlines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return airlines;
    return airlines.filter(
      a =>
        a.name.toLowerCase().includes(query) ||
        (a.code && a.code.toLowerCase().includes(query)) ||
        (a.iata && a.iata.toLowerCase().includes(query)) ||
        (a.country && a.country.toLowerCase().includes(query))
    );
  }, [airlines, search]);

  const totalItems = filteredAirlines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedAirlines = filteredAirlines.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Airlines Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total: {totalItems.toLocaleString()} {totalItems === 1 ? 'airline' : 'airlines'} (Official IATA & Custom)
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
                  { key: 'name', label: 'Airline Name' },
                  { key: 'code', label: 'Code' },
                  { key: 'iata', label: 'IATA' },
                  { key: 'country', label: 'Country' },
                ].map(col => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key as AirlineColumn]}
                      onChange={() => toggleColumn(col.key as AirlineColumn)}
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
              placeholder="Search airlines..."
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
                {visibleColumns.name && <th className="px-6 py-4">Airline Name</th>}
                {visibleColumns.code && <th className="px-6 py-4">Code</th>}
                {visibleColumns.iata && <th className="px-6 py-4">IATA</th>}
                {visibleColumns.country && <th className="px-6 py-4">Country</th>}
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedAirlines.length > 0 ? (
                paginatedAirlines.map((airline, index) => (
                  <tr key={airline.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                    </td>
                    <td className="px-6 py-3 text-gray-500">{startIndex + index + 1}</td>

                    {visibleColumns.status && (
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggleStatus(airline.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            airline.status ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              airline.status ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    )}

                    {visibleColumns.name && <td className="px-6 py-3 font-medium text-gray-900">{airline.name}</td>}
                    {visibleColumns.code && (
                      <td className="px-6 py-3">
                        {airline.code ? (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-md">
                            {airline.code}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.iata && (
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-600 rounded-md">
                          {airline.iata || airline.code}
                        </span>
                      </td>
                    )}
                    {visibleColumns.country && <td className="px-6 py-3">{airline.country || '—'}</td>}

                    <td className="px-6 py-3 text-center space-x-1">
                      <button
                        onClick={() => openForm(airline)}
                        className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteAirline(airline)}
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
                    No airlines found matching &quot;{search}&quot;.
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
        title={editingAirline ? 'Edit Airline' : 'Add Airline'}
      >
        <form className="space-y-5 pb-24" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Airline Name *</label>
            <input
              name="name"
              type="text"
              defaultValue={editingAirline?.name || ''}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code (2-letter) *</label>
              <input
                name="code"
                type="text"
                maxLength={3}
                defaultValue={editingAirline?.code || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ICAO Code (3-letter)</label>
              <input
                name="iata"
                type="text"
                maxLength={4}
                defaultValue={editingAirline?.iata || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none uppercase"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
            <input
              name="country"
              type="text"
              defaultValue={editingAirline?.country || ''}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 outline-none"
            />
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
              <Check size={16} /> Save Airline
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Bulk Upload Modal */}
      {uploadOpen && (
        <AirlineBulkUpload
          onClose={() => setUploadOpen(false)}
          existingAirlines={airlines}
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