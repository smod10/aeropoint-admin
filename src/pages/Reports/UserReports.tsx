import { useMemo, useState } from 'react';
import { Search, Columns, ChevronDown, Eye, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers';

type UserReportSortKey = 'uid' | 'firstName' | 'lastName' | 'email' | 'phone' | 'role' | 'status' | 'balance' | 'createdAt';

export default function UserReports() {
  const [users] = useState(mockUsers);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    uid: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    balance: true,
    createdAt: true,
  });
  const [sortKey, setSortKey] = useState<UserReportSortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedUsers = useMemo(() => {
    return [...users].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (sortKey === 'status') {
        return sortDirection === 'asc'
          ? Number(Boolean(leftValue)) - Number(Boolean(rightValue))
          : Number(Boolean(rightValue)) - Number(Boolean(leftValue));
      }

      if (sortKey === 'balance') {
        return sortDirection === 'asc'
          ? Number(left.balance) - Number(right.balance)
          : Number(right.balance) - Number(left.balance);
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [sortDirection, sortKey, users]);

  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: UserReportSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: UserReportSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-[#0d6efd]" />
      : <ArrowDown size={12} className="text-[#0d6efd]" />;
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(previous => ({ ...previous, [column]: !previous[column] }));
  };

  const showAllColumns = () => {
    setVisibleColumns({
      uid: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      balance: true,
      createdAt: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Users Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {users.length} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnMenuOpen(previous => !previous)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>
            {isColumnMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 max-h-80 overflow-y-auto">
                <button type="button" onClick={showAllColumns} className="w-full text-left text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded px-2 py-1.5 mb-1">
                  Show All Columns
                </button>
                {([
                  ['uid', 'User ID'],
                  ['firstName', 'First Name'],
                  ['lastName', 'Last Name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['role', 'Role'],
                  ['status', 'Status'],
                  ['balance', 'Balance'],
                  ['createdAt', 'Date Registered'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={visibleColumns[key]} onChange={() => toggleColumn(key)} className="rounded border-gray-300" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
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
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-[#0d6efd] w-48" />
            <button className="bg-[#0d6efd] text-white px-4 py-2.5 rounded-r-lg hover:bg-blue-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10">#</th>
                {visibleColumns.uid && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('uid')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">USER ID {sortIcon('uid')}</button></th>}
                {visibleColumns.firstName && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('firstName')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">FIRST NAME {sortIcon('firstName')}</button></th>}
                {visibleColumns.lastName && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('lastName')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">LAST NAME {sortIcon('lastName')}</button></th>}
                {visibleColumns.email && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('email')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">EMAIL {sortIcon('email')}</button></th>}
                {visibleColumns.phone && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('phone')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">PHONE {sortIcon('phone')}</button></th>}
                {visibleColumns.role && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('role')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">ROLE {sortIcon('role')}</button></th>}
                {visibleColumns.status && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] justify-center">STATUS {sortIcon('status')}</button></th>}
                {visibleColumns.balance && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('balance')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">BALANCE {sortIcon('balance')}</button></th>}
                {visibleColumns.createdAt && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('createdAt')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">DATE REGISTERED {sortIcon('createdAt')}</button></th>}
                <th className="px-4 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedUsers.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  {visibleColumns.uid && <td className="px-4 py-3 font-mono text-gray-500">{user.uid}</td>}
                  {visibleColumns.firstName && <td className="px-4 py-3 text-gray-800">{user.firstName}</td>}
                  {visibleColumns.lastName && <td className="px-4 py-3 text-gray-800">{user.lastName}</td>}
                  {visibleColumns.email && <td className="px-4 py-3 text-gray-600">{user.email}</td>}
                  {visibleColumns.phone && <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>}
                  {visibleColumns.role && <td className="px-4 py-3 text-gray-600 capitalize">{user.role}</td>}
                  {visibleColumns.status && (
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${user.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  )}
                  {visibleColumns.balance && <td className="px-4 py-3 text-gray-800">USD {user.balance}</td>}
                  {visibleColumns.createdAt && <td className="px-4 py-3 text-gray-600">{user.createdAt}</td>}
                  
                  <td className="px-4 py-3 text-center">
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-[#0d6efd] border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="View Details">
                      <Eye size={14} />
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
            <button onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map(number => (
              <button key={number} onClick={() => setCurrentPage(number)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === number ? 'bg-[#0d6efd] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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