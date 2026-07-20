import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Columns, ChevronDown, Eye, Star, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { mockBlogs } from '../../data/mockBlogs';

type BlogSortKey = 'status' | 'title' | 'category' | 'featured' | 'createdAt';

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState(mockBlogs);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<BlogSortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedBlogs = useMemo(() => {
    return [...blogs].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];

      if (sortKey === 'status' || sortKey === 'featured') {
        return sortDirection === 'asc'
          ? Number(Boolean(leftValue)) - Number(Boolean(rightValue))
          : Number(Boolean(rightValue)) - Number(Boolean(leftValue));
      }

      return sortDirection === 'asc'
        ? String(leftValue).localeCompare(String(rightValue))
        : String(rightValue).localeCompare(String(leftValue));
    });
  }, [blogs, sortDirection, sortKey]);

  const totalItems = sortedBlogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBlogs = sortedBlogs.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const toggleStatus = (id: number) => {
    setBlogs(blogs.map(b => b.id === id ? { ...b, status: !b.status } : b));
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = (key: BlogSortKey) => {
    if (sortKey === key) {
      setSortDirection(previous => previous === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortIcon = (key: BlogSortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="text-gray-300" />;
    }

    return sortDirection === 'asc'
      ? <ArrowUp size={12} className="text-[#0d6efd]" />
      : <ArrowDown size={12} className="text-[#0d6efd]" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Top Filters */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Blogs Management</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {blogs.length} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            All Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>

          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-[#0d6efd] text-white px-4 py-2.5 rounded-r-lg hover:bg-blue-700 transition-colors">
              <Search size={16} />
            </button>
          </div>

          <button onClick={() => navigate('/blog/edit/new')} className="flex items-center gap-2 bg-[#0d6efd] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm ml-2">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                <th className="px-4 py-4 text-center"><button type="button" onClick={() => handleSort('status')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">Status {sortIcon('status')}</button></th>
                <th className="px-4 py-4">Image</th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('title')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">Title {sortIcon('title')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('category')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">Category {sortIcon('category')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('featured')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">Featured {sortIcon('featured')}</button></th>
                <th className="px-4 py-4"><button type="button" onClick={() => handleSort('createdAt')} className="inline-flex items-center gap-1 hover:text-[#0d6efd]">Created At {sortIcon('createdAt')}</button></th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedBlogs.map((blog, i) => (
                <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{startIndex + i + 1}</td>
                  
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(blog.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${blog.status ? 'bg-[#0d6efd]' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${blog.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[300px]">{blog.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{blog.slug}</div>
                  </td>
                  
                  <td className="px-4 py-3 text-gray-700">{blog.category}</td>
                  
                  <td className="px-4 py-3">
                    {blog.featured ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100/50 text-yellow-700 font-medium text-xs border border-yellow-200/50">
                        <Star size={12} fill="currentColor" /> Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 font-medium text-xs border border-gray-200">
                        <Star size={12} /> Regular
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-700">{blog.createdAt}</td>
                  
                  <td className="px-4 py-3 text-center space-x-1">
                    <button className="inline-flex p-1.5 text-gray-400 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="View">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => navigate(`/blog/edit/${blog.id}`)} className="inline-flex p-1.5 text-gray-400 hover:text-[#0d6efd] border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setBlogs(blogs.filter(b => b.id !== blog.id))} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
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