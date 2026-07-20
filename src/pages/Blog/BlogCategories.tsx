import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Columns, ChevronDown, Network, X } from 'lucide-react';
import { mockCategories } from '../../data/mockBlogs';

export default function BlogCategories() {
  const [categories, setCategories] = useState(mockCategories);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeCategory, setActiveCategory] = useState({
    id: 0,
    name: '',
    slug: '',
    status: true
  });

  const toggleStatus = (id: number) => {
    setCategories(categories.map(c => c.id === id ? { ...c, status: !c.status } : c));
  };

  const openModal = (mode: 'add' | 'edit', category: any = null) => {
    setModalMode(mode);
    if (mode === 'edit' && category) {
      setActiveCategory({ ...category });
    } else {
      setActiveCategory({ id: 0, name: '', slug: '', status: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCategory({ id: 0, name: '', slug: '', status: true });
  };

  const handleSave = () => {
    let finalSlug = activeCategory.slug;
    
    // Auto-generate slug if left blank
    if (!finalSlug.trim() && activeCategory.name) {
      finalSlug = activeCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (modalMode === 'add') {
      const newCategory = {
        id: Date.now(),
        name: activeCategory.name,
        slug: finalSlug,
        status: activeCategory.status,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };
      setCategories([newCategory, ...categories]);
    } else {
      setCategories(categories.map(c => c.id === activeCategory.id ? { ...activeCategory, slug: finalSlug, createdAt: c.createdAt } : c));
    }
    closeModal();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Blog Categories Management</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => openModal('add')} className="flex items-center gap-2 bg-[#0d6efd] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <p className="text-sm text-gray-500 ml-2">Total: {categories.length} records</p>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            All Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>
          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-[#0d6efd] w-48" />
            <button className="bg-[#0d6efd] text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
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
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Slug</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat, i) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(cat.id)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.status ? 'bg-[#0d6efd]' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${cat.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <Network size={16} className="text-gray-400" /> {cat.name}
                  </td>
                  
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-mono">{cat.slug}</span>
                  </td>

                  <td className="px-4 py-3 text-gray-700">{cat.createdAt}</td>
                  
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => openModal('edit', cat)} className="inline-flex p-1.5 text-gray-400 hover:text-[#0d6efd] border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input 
                  type="text" 
                  value={activeCategory.name}
                  onChange={(e) => setActiveCategory({ ...activeCategory, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#0d6efd] focus:border-[#0d6efd] transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input 
                  type="text" 
                  placeholder="Auto-generate" 
                  value={activeCategory.slug}
                  onChange={(e) => setActiveCategory({ ...activeCategory, slug: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#0d6efd] focus:border-[#0d6efd] transition-shadow"
                />
                <p className="text-xs text-gray-500 mt-1.5">If left blank, it will be auto-generated from the title</p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer w-max">
                  <input 
                    type="checkbox" 
                    checked={activeCategory.status}
                    onChange={(e) => setActiveCategory({ ...activeCategory, status: e.target.checked })}
                    className="w-4 h-4 text-[#0d6efd] rounded border-gray-300 focus:ring-[#0d6efd]" 
                  />
                  <span className="text-sm text-gray-800 font-medium">Active Status</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={closeModal} className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={!activeCategory.name.trim()}
                className="bg-[#0d6efd] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}