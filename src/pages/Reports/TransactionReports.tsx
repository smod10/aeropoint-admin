import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Columns, ChevronDown, ArrowUpRight, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockTransactions } from '../../data/mockTransactions';

type TransactionSortKey = 'id' | 'customer' | 'gateway' | 'type' | 'amount' | 'status' | 'date';

const formatAmount = (amount: string, currency: string) => `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TransactionReports() {
  const navigate = useNavigate();
  const [transactions] = useState(mockTransactions);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    customer: true,
    gateway: true,
    type: true,
    amount: true,
    status: true,
    date: true,
  });
  const [sortKey, setSortKey] = useState<TransactionSortKey>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (sortKey === 'amount') {
        return sortDirection === 'asc'
          ? Number(left.amount) - Number(right.amount)
          : Number(right.amount) - Number(left.amount);
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [sortDirection, sortKey, transactions]);

  const totalItems = sortedTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: TransactionSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: TransactionSortKey) => {
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
      id: true,
      customer: true,
      gateway: true,
      type: true,
      amount: true,
      status: true,
      date: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transactions Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {transactions.length} records</p>
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
                  ['id', 'TRX ID'],
                  ['customer', 'Customer'],
                  ['gateway', 'Gateway'],
                  ['type', 'Type'],
                  ['amount', 'Amount'],
                  ['status', 'Status'],
                  ['date', 'Date'],
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
                {visibleColumns.id && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('id')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors">TRX ID {sortIcon('id')}</button></th>}
                {visibleColumns.customer && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('customer')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors">CUSTOMER {sortIcon('customer')}</button></th>}
                {visibleColumns.gateway && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('gateway')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors">GATEWAY {sortIcon('gateway')}</button></th>}
                {visibleColumns.type && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('type')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors">TYPE {sortIcon('type')}</button></th>}
                {visibleColumns.amount && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('amount')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors">AMOUNT {sortIcon('amount')}</button></th>}
                {visibleColumns.status && <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors justify-center">STATUS {sortIcon('status')}</button></th>}
                {visibleColumns.date && <th className="px-4 py-4"><button type="button" onClick={() => handleSort('date')} className="inline-flex items-center gap-1 hover:text-[#0d6efd] transition-colors">DATE {sortIcon('date')}</button></th>}
                <th className="px-4 py-4 text-center">RECEIPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedTransactions.map((trx, i) => (
                <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                  {visibleColumns.id && <td className="px-4 py-3 font-mono text-gray-800">{trx.id}</td>}
                  {visibleColumns.customer && (
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      <div>{trx.customer}</div>
                      <div className="text-xs text-gray-400">{trx.email}</div>
                    </td>
                  )}
                  {visibleColumns.gateway && <td className="px-4 py-3 text-gray-600">{trx.gateway}</td>}
                  {visibleColumns.type && <td className="px-4 py-3 text-gray-600">{trx.type}</td>}
                  {visibleColumns.amount && <td className="px-4 py-3 text-gray-800 font-medium">{formatAmount(trx.amount, trx.currency)}</td>}
                  {visibleColumns.status && (
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${trx.status === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {trx.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns.date && <td className="px-4 py-3 text-gray-600">{trx.date}</td>}
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => navigate(`/reports/transactions/${trx.id}`)} 
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[#0d6efd] bg-blue-50 hover:bg-blue-100 rounded text-xs font-bold transition-colors"
                    >
                      View <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
            </span>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#0d6efd] cursor-pointer text-sm">
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(previous => Math.max(previous - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === number
                    ? 'bg-[#0d6efd] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(previous => Math.min(previous + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 h-8 flex items-center justify-center gap-1 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}