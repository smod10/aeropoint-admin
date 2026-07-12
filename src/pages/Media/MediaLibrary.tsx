import { useState } from 'react';
import { UploadCloud, Search, Filter, Image as ImageIcon, MoreVertical, Trash2, Link } from 'lucide-react';

const mockMedia = [
  { id: 1, name: 'dubai-skyline.jpg', size: '2.4 MB', date: '14 Jul 2026', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'swiss-alps.jpg', size: '3.1 MB', date: '12 Jul 2026', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'maldives-resort.png', size: '1.8 MB', date: '10 Jul 2026', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'makkah-haram.jpg', size: '4.2 MB', date: '05 Jul 2026', url: 'https://images.unsplash.com/photo-1565552643952-25088251e60e?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'paris-eiffel.jpg', size: '2.9 MB', date: '01 Jul 2026', url: 'https://images.unsplash.com/photo-1502602898657-3e9076013054?auto=format&fit=crop&w=400&q=80' },
];

export default function MediaLibrary() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Media Library</h2>
          <p className="text-sm text-gray-500 mt-1">Manage images and assets used across packages and blog posts.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <UploadCloud size={16} />
          Upload Files
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search media files..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
            <Filter size={16} /> Type: All Images
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Upload Card */}
        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-primary-500 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud size={24} />
          </div>
          <span className="text-sm font-medium text-gray-600">Drop files here</span>
        </div>

        {/* Existing Assets */}
        {mockMedia.map((file) => (
          <div key={file.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-end gap-2">
                <button className="p-1.5 bg-white/20 text-white rounded hover:bg-white/40 transition-colors" title="Copy Link">
                  <Link size={14} />
                </button>
                <button className="p-1.5 bg-white/20 text-white rounded hover:bg-red-500 transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
              <div>
                <p className="text-xs font-medium text-white truncate" title={file.name}>{file.name}</p>
                <p className="text-[10px] text-gray-300">{file.size} • {file.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}