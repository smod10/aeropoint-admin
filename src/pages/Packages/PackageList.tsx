import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Check, X } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data
const initialPackages = [
  {
    id: 'PKG-001',
    name: 'Maldives Honeymoon Escape',
    destination: 'Maldives',
    duration: '7 Days / 6 Nights',
    price: '$2,899.00',
    status: 'Published',
    inclusions: ['Flight', 'Hotel', 'Breakfast', 'Transfer'],
    exclusions: ['Visa', 'Travel Insurance']
  },
  {
    id: 'PKG-002',
    name: 'Bali Cultural Explorer',
    destination: 'Bali, Indonesia',
    duration: '10 Days / 9 Nights',
    price: '$1,450.00',
    status: 'Draft',
    inclusions: ['Hotel', 'Tours', 'Breakfast'],
    exclusions: ['Flight', 'Dinner']
  },
  {
    id: 'PKG-003',
    name: 'Swiss Alps Winter Wonderland',
    destination: 'Zurich, Switzerland',
    duration: '5 Days / 4 Nights',
    price: '$3,100.00',
    status: 'Published',
    inclusions: ['Flight', 'Hotel', 'Ski Pass', 'Breakfast'],
    exclusions: ['Lunch', 'Dinner', 'Gear Rental']
  }
];

export default function PackageList() {
  const [packages, setPackages] = useState(initialPackages);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const openAddForm = () => {
    setEditingPackage(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (pkg: any) => {
    setEditingPackage(pkg);
    setIsSlideOverOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Travel Packages</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage holiday packages, tours, and bundle deals.</p>
        </div>
        <button 
          onClick={openAddForm}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add New Package
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search packages by name or destination..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Package Image</th>
                <th className="px-6 py-4 font-medium">Name & Destination</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-xs text-gray-400">{pkg.destination}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{pkg.duration}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{pkg.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      pkg.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditForm(pkg)}
                      className="inline-flex items-center justify-center p-1.5 text-gray-500 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pkg.id)}
                      className="inline-flex items-center justify-center p-1.5 text-gray-500 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Slide-Over */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title={editingPackage ? "Edit Package" : "Add New Package"}
      >
        <form className="space-y-5 pb-24" onSubmit={(e) => e.preventDefault()}>
          
          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Cover Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                    Upload a file
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
              <input 
                type="text" 
                defaultValue={editingPackage?.name || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Dubai Desert Safari"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input 
                type="text" 
                defaultValue={editingPackage?.destination || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Dubai, UAE"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="text" 
                  defaultValue={editingPackage?.price || ''}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="$0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input 
                  type="text" 
                  defaultValue={editingPackage?.duration || ''}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. 5 Days / 4 Nights"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inclusions (Comma separated)</label>
              <textarea 
                rows={3}
                defaultValue={editingPackage?.inclusions?.join(', ') || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Flight, Hotel, Breakfast..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exclusions (Comma separated)</label>
              <textarea 
                rows={3}
                defaultValue={editingPackage?.exclusions?.join(', ') || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Visa, Travel Insurance..."
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
               <input type="checkbox" id="publishToggle" className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" defaultChecked={editingPackage?.status === 'Published'} />
               <label htmlFor="publishToggle" className="text-sm font-medium text-gray-700">Publish immediately</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsSlideOverOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              onClick={() => setIsSlideOverOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Check size={16} />
              Save Package
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}