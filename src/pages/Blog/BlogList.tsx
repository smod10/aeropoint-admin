import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Check, Globe, LayoutTemplate } from 'lucide-react';
import SlideOver from '../../components/Shared/SlideOver';

// Mock Data
const mockPosts = [
  {
    id: 'POST-001',
    title: 'Top 10 Things to do in Dubai 2026',
    author: 'Sarah Jenkins',
    category: 'Travel Guides',
    status: 'Published',
    date: '10 Jul 2026',
    seoTitle: '10 Best Things to Do in Dubai (2026 Guide)',
    seoDesc: 'Discover the ultimate itinerary for Dubai...',
  },
  {
    id: 'POST-002',
    title: 'How to Apply for a UK Standard Visitor Visa',
    author: 'David Chen',
    category: 'Visa Advice',
    status: 'Draft',
    date: '12 Jul 2026',
    seoTitle: 'UK Visitor Visa Application Guide',
    seoDesc: 'Step-by-step instructions on applying for a UK Visa.',
  },
  {
    id: 'POST-003',
    title: 'A Beginners Guide to Umrah Preparation',
    author: 'Aisha Rahman',
    category: 'Umrah',
    status: 'Scheduled',
    date: '15 Jul 2026',
    seoTitle: 'Umrah Preparation Guide for Beginners',
    seoDesc: 'Everything you need to know before embarking on Umrah.',
  }
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    'Published': 'bg-emerald-50 text-emerald-600',
    'Draft': 'bg-gray-100 text-gray-600',
    'Scheduled': 'bg-blue-50 text-blue-600'
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export default function BlogList() {
  const [posts, setPosts] = useState(mockPosts);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const openAddForm = () => {
    setEditingPost(null);
    setIsSlideOverOpen(true);
  };

  const openEditForm = (post: any) => {
    setEditingPost(post);
    setIsSlideOverOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Blog & Content</h2>
          <p className="text-sm text-gray-500 mt-1">Manage travel guides, news, and SEO articles.</p>
        </div>
        <button 
          onClick={openAddForm}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Write New Post
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full md:w-96 relative">
          <Search className="text-gray-400 absolute ml-3" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2 outline-none">
            <option value="">All Categories</option>
            <option value="travel">Travel Guides</option>
            <option value="visa">Visa Advice</option>
            <option value="umrah">Umrah</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Article Details</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Author</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-400 max-w-xs truncate">{post.seoDesc}</div>
                </td>
                <td className="px-6 py-4">{post.category}</td>
                <td className="px-6 py-4">{post.author}</td>
                <td className="px-6 py-4">{post.date}</td>
                <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEditForm(post)} className="inline-flex p-1.5 text-gray-500 bg-gray-50 rounded-lg hover:text-primary-600 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="inline-flex p-1.5 text-gray-500 bg-gray-50 rounded-lg hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Slide-Over */}
      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)} 
        title={editingPost ? "Edit Article" : "New Article"}
      >
        <form className="space-y-5 pb-24" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article Title</label>
            <input 
              type="text" 
              defaultValue={editingPost?.title || ''}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Catchy travel title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option>Travel Guides</option>
                <option>Visa Advice</option>
                <option>Umrah</option>
                <option>News</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option>Draft</option>
                <option>Published</option>
                <option>Scheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-primary-600">Upload Image</span>
              </div>
            </div>
          </div>

          {/* Simulated Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex gap-2 text-gray-500">
                <LayoutTemplate size={16} className="cursor-pointer hover:text-gray-900" />
                <ImageIcon size={16} className="cursor-pointer hover:text-gray-900" />
                <span className="font-bold text-xs ml-2 border-l border-gray-300 pl-2 cursor-pointer hover:text-gray-900">B</span>
                <span className="italic text-xs cursor-pointer hover:text-gray-900">I</span>
              </div>
              <textarea 
                rows={8}
                className="w-full p-4 text-sm outline-none resize-y"
                placeholder="Write your amazing content here..."
                defaultValue={editingPost ? "Simulated rich text content based on the mock data." : ""}
              />
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <Globe size={16} /> SEO Settings
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
              <input 
                type="text" 
                defaultValue={editingPost?.seoTitle || ''}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SEO Description</label>
              <textarea 
                rows={2}
                defaultValue={editingPost?.seoDesc || ''}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsSlideOverOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => setIsSlideOverOpen(false)} className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <Check size={16} /> Save Post
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}