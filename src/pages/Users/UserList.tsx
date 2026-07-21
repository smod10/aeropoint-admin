import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Columns, ChevronDown } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers';
import { useCurrency } from '../../context/CurrencyContext';

export default function UserList() {
  const navigate = useNavigate();
  const { role } = useParams(); 
  const { convertAndFormat } = useCurrency(); 

  const [users, setUsers] = useState(mockUsers);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- COLUMN FILTER LOGIC ---
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState({
    status: true,
    uid: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    role: true,
    balance: true,
  });

  const columnLabels = {
    status: 'Status',
    uid: 'User ID',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    balance: 'Balance'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users dynamically based on sidebar Role selection
  useEffect(() => {
    if (role) {
      setUsers(mockUsers.filter(u => u.role.toLowerCase() === role.toLowerCase()));
    } else {
      setUsers(mockUsers);
    }
    setCurrentPage(1);
  }, [role]);

  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const toggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: !u.status } : u));
  };

  const showAllColumns = () => {
    setColumns({ status: true, uid: true, firstName: true, lastName: true, email: true, phone: true, role: true, balance: true });
    setIsColumnDropdownOpen(false);
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {role ? `${role}s Management` : 'All Users Management'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Total: {users.length} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Column Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-3 animate-in zoom-in-95 duration-200">
                <div className="mb-2 pb-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Toggle Columns</p>
                </div>
                <div className="space-y-1">
                  {Object.entries(columnLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={columns[key as keyof typeof columns]}
                        onChange={() => setColumns({ ...columns, [key]: !columns[key as keyof typeof columns] })}
                        className="w-4 h-4 rounded border-gray-300 text-[#0d6efd] focus:ring-[#0d6efd] cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={showAllColumns} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            All Columns
          </button>
          <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-lg text-sm">
            <span className="text-gray-500">Show</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-transparent font-medium outline-none cursor-pointer">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="text-gray-500">entries</span>
          </div>
          
          <div className="flex relative">
            <input type="text" placeholder="Search users..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-[#0d6efd] w-48" />
            <button className="bg-[#0d6efd] text-white px-4 py-2.5 rounded-r-lg hover:bg-blue-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
          <button onClick={() => navigate('/users/edit/new')} className="flex items-center gap-2 bg-[#0d6efd] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm ml-2">
            <Plus size={16} /> Create User
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {columns.status && <th className="px-4 py-4">Status</th>}
                {columns.uid && <th className="px-4 py-4">User ID</th>}
                {columns.firstName && <th className="px-4 py-4">First Name</th>}
                {columns.lastName && <th className="px-4 py-4">Last Name</th>}
                {columns.email && <th className="px-4 py-4">Email</th>}
                {columns.phone && <th className="px-4 py-4">Phone</th>}
                {columns.role && <th className="px-4 py-4">Role</th>}
                {columns.balance && <th className="px-4 py-4">Balance</th>}
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedUsers.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                  
                  {columns.status && (
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(user.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${user.status ? 'bg-[#0d6efd]' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${user.status ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                  )}

                  {columns.uid && <td className="px-4 py-3 font-mono text-gray-500">{user.uid}</td>}
                  {columns.firstName && <td className="px-4 py-3 text-gray-800 font-medium">{user.firstName}</td>}
                  {columns.lastName && <td className="px-4 py-3 text-gray-800 font-medium">{user.lastName}</td>}
                  {columns.email && <td className="px-4 py-3 text-gray-600">{user.email}</td>}
                  {columns.phone && <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>}
                  
                  {columns.role && (
                    <td className="px-4 py-3 capitalize">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'supplier' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  )}

                  {columns.balance && (
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {convertAndFormat(Number(user.balance || 0))}
                    </td>
                  )}
                  
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => navigate(`/users/edit/${user.id}`)} className="inline-flex p-1.5 text-gray-400 hover:text-[#0d6efd] border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
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
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#0d6efd] cursor-pointer text-sm">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">&lt;</button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? 'bg-[#0d6efd] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {number}
              </button>
            ))}
            <button onClick={() => setCurrentPage(previous => Math.min(previous + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 h-8 flex items-center justify-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}