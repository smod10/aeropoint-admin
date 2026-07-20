import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Columns, Edit2, Trash2, Plus, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers'; 
import { useCurrency } from '../../context/CurrencyContext';

type UserColumn = 'status' | 'banned' | 'firstName' | 'lastName' | 'email' | 'role' | 'balance';
type UserSortKey = 'status' | 'banned' | 'firstName' | 'lastName' | 'email' | 'role' | 'balance';

export default function UserList() {
  const navigate = useNavigate();
  const { role } = useParams(); 
  const { convertFromAndFormat } = useCurrency();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<UserSortKey>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [users, setUsers] = useState(mockUsers);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<UserColumn, boolean>>({
    status: true,
    banned: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    balance: true,
  });

  // Filter dynamically based on URL parameter
  const filteredUsers = role 
    ? users.filter(u => u.role === role) 
    : users;

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (sortKey === 'balance') {
        return sortDirection === 'asc'
          ? Number(left.balance) - Number(right.balance)
          : Number(right.balance) - Number(left.balance);
      }

      if (sortKey === 'status' || sortKey === 'banned') {
        const leftFlag = Boolean(leftValue);
        const rightFlag = Boolean(rightValue);
        return sortDirection === 'asc'
          ? Number(leftFlag) - Number(rightFlag)
          : Number(rightFlag) - Number(leftFlag);
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [filteredUsers, sortDirection, sortKey]);

  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const pageTitle = role 
    ? `${role.charAt(0).toUpperCase() + role.slice(1)} Users` 
    : 'All Users';

  const toggleStatus = (id: number, field: 'status' | 'banned') => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: !u[field] } : u));
  };

  const toggleColumn = (column: UserColumn) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: UserSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: UserSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-primary-600" />
      : <ArrowDown size={12} className="text-primary-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Top Filters */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {filteredUsers.length} records</p>
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
                  { key: 'banned', label: 'Banned' },
                  { key: 'firstName', label: 'First Name' },
                  { key: 'lastName', label: 'Last Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Role' },
                  { key: 'balance', label: 'Balance' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[col.key as UserColumn]} onChange={() => toggleColumn(col.key as UserColumn)} className="rounded border-gray-300" />
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

          <button onClick={() => navigate('/users/edit/new')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm ml-2">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.status && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-primary-600">Status {sortIcon('status')}</button></th>}
                {visibleColumns.banned && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('banned')} className="inline-flex items-center gap-1 hover:text-primary-600">Banned {sortIcon('banned')}</button></th>}
                {visibleColumns.firstName && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('firstName')} className="inline-flex items-center gap-1 hover:text-primary-600">First Name {sortIcon('firstName')}</button></th>}
                {visibleColumns.lastName && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('lastName')} className="inline-flex items-center gap-1 hover:text-primary-600">Last Name {sortIcon('lastName')}</button></th>}
                {visibleColumns.email && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('email')} className="inline-flex items-center gap-1 hover:text-primary-600">Email {sortIcon('email')}</button></th>}
                {visibleColumns.role && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('role')} className="inline-flex items-center gap-1 hover:text-primary-600">Role {sortIcon('role')}</button></th>}
                {visibleColumns.balance && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('balance')} className="inline-flex items-center gap-1 hover:text-primary-600">Balance {sortIcon('balance')}</button></th>}
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedUsers.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                  
                  {visibleColumns.status && <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(u.id, 'status')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.status ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${u.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>}

                  {visibleColumns.banned && <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(u.id, 'banned')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.banned ? 'bg-red-500' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${u.banned ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>}

                  {visibleColumns.firstName && <td className="px-4 py-3 font-medium text-gray-900">{u.firstName}</td>}
                  {visibleColumns.lastName && <td className="px-4 py-3 font-medium text-gray-900">{u.lastName}</td>}
                  {visibleColumns.email && <td className="px-4 py-3 text-gray-600">{u.email}</td>}
                  
                  {visibleColumns.role && <td className="px-4 py-3">
                    <span className="capitalize">{u.role}</span>
                  </td>}

                  {visibleColumns.balance && <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{convertFromAndFormat(Number(u.balance), 'USD')}</span>
                  </td>}
                  
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => navigate(`/users/edit/${u.id}`)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setUsers(users.filter(user => user.id !== u.id))} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer">
              <option value="5">5 per page</option><option value="10">10 per page</option><option value="25">25 per page</option><option value="50">50 per page</option><option value="100">100 per page</option>
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