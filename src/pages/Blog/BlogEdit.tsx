import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Search, Globe, Image as ImageIcon, 
  Trash2, Type, Bold, Italic, Underline, Link, AlignLeft, 
  List, LayoutGrid, Quote, Video, Strikethrough, Settings, Save
} from 'lucide-react';
import { mockBlogs, mockCategories } from '../../data/mockBlogs';

export default function BlogEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isNew = id === 'new' || !id;
  const blog = isNew ? null : mockBlogs.find(b => b.id === Number(id));

  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'translations'>('general');

  return (
    <form className="space-y-6 max-w-6xl animate-in fade-in duration-300 pb-10" onSubmit={(e) => { e.preventDefault(); navigate('/blog'); }}>
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <button type="button" onClick={() => navigate('/blog')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'Add Blog Post' : 'Edit Blog Post'}</h2>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-2 pt-2 bg-white overflow-x-auto hide-scrollbar">
          {[
            { id: 'general', label: 'General', icon: FileText },
            { id: 'seo', label: 'SEO', icon: Search },
            { id: 'translations', label: 'Translations', icon: Globe },
          ].map(tab => (
            <button 
              key={tab.id}
              type="button" 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-[#0d6efd] text-[#0d6efd]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 bg-gray-50/30 flex-1">
          
          {activeTab === 'general' && (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in">
              
              {/* Left Column: Main Editor */}
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">Title *</label>
                  <input 
                    type="text" 
                    defaultValue={blog?.title} 
                    placeholder="Enter blog title" 
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0d6efd]" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">Description *</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-[#0d6efd] focus-within:ring-1 focus-within:ring-[#0d6efd] transition-shadow">
                    
                    {/* Rich Text Editor Toolbar Mockup */}
                    <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1.5">
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><ArrowLeft size={16} className="rotate-45"/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><ArrowLeft size={16} className="-rotate-45"/></button>
                      
                      <select className="text-sm border border-gray-300 rounded bg-white px-2 py-1 mx-1 outline-none text-gray-700">
                        <option>Paragraph</option>
                        <option>Heading 1</option>
                        <option>Heading 2</option>
                      </select>
                      
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Type size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><span className="font-serif font-bold px-1">A^</span></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><span className="font-serif font-bold px-1">A v</span></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1"></div>
                      
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600 font-bold"><Bold size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Italic size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Underline size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Strikethrough size={16}/></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1"></div>
                      
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Link size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><ImageIcon size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><LayoutGrid size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Quote size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Video size={16}/></button>
                      
                      <div className="w-px h-5 bg-gray-300 mx-1"></div>

                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={16}/></button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><List size={16}/></button>
                    </div>
                    
                    <textarea 
                      rows={15} 
                      defaultValue={!isNew ? `Travel broadens minds and connects cultures, but it also carries an environmental cost. The good news is that with thoughtful choices, you can significantly reduce your impact while still having extraordinary experiences.\n\nTransportation Choices Matter Most\nFlying accounts for the largest portion of a trip's carbon footprint. When possible, take trains - a London-to-Paris Eurostar journey produces 90% less CO2 than the equivalent flight. When flying is necessary, choose direct flights (takeoffs and landings burn the most fuel), fly economy (more passengers per flight), and consider carbon offset programs.` : ''}
                      placeholder="Type the content here!" 
                      className="w-full p-4 text-sm text-gray-700 outline-none resize-y min-h-[300px]" 
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Settings & Image */}
              <div className="w-full lg:w-[350px] space-y-6">
                
                {/* Image Upload Box */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><ImageIcon size={16} className="text-[#0d6efd]"/> Featured Image</h3>
                  
                  {isNew ? (
                    <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center py-12 px-4 hover:bg-gray-100 transition-colors cursor-pointer mb-2">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-3"><ImageIcon size={20} /></div>
                      <p className="text-sm font-medium text-gray-800 mb-1">Drag & drop image here</p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <img src={blog?.image} alt="Featured" className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-200" />
                      <button type="button" className="w-full bg-[#0d6efd] text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                        <Trash2 size={16} /> Remove Image
                      </button>
                    </div>
                  )}
                  
                  <p className="text-[10px] text-gray-400 text-center">Recommended Size: 1200x630px • Max file size: 5MB</p>
                </div>

                {/* Settings Box */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><Settings size={16} className="text-[#0d6efd]"/> Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                      <select defaultValue={blog?.category || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]">
                        <option value="" disabled>Select Category</option>
                        {mockCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Published Date</label>
                      <div className="relative">
                        <input 
                          type="datetime-local" 
                          defaultValue={isNew ? '' : "2026-02-17T23:00"}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex-1 flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" defaultChecked={blog?.featured} className="w-4 h-4 text-[#0d6efd] rounded border-gray-300 focus:ring-[#0d6efd]" />
                        <span className="text-sm font-medium text-gray-700">Featured</span>
                      </label>
                      <label className="flex-1 flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" defaultChecked={isNew ? true : blog?.status} className="w-4 h-4 text-[#0d6efd] rounded border-gray-300 focus:ring-[#0d6efd]" />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6"><Search size={16} /> SEO Information</h3>
                <div className="space-y-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label><input type="text" placeholder="Enter SEO meta title" defaultValue={blog?.title} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0d6efd]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label><textarea rows={3} placeholder="Enter meta description" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0d6efd] resize-none" /></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'translations' && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4"><Globe size={24} /></div>
               <h3 className="text-lg font-bold text-gray-800 mb-1">Translation Settings</h3>
               <p className="text-sm text-gray-500">Configure multi-language support here.</p>
            </div>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/blog')} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#0d6efd] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
            <Save size={16} /> {isNew ? 'Submit' : 'Update'}
          </button>
        </div>

      </div>
    </form>
  );
}