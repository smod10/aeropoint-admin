import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Info, DollarSign, MapPin, Calendar, 
  ListChecks, Image as ImageIcon, Search, Globe, 
  Flag, Type, Bold, Italic, Underline, Link, AlignLeft, 
  List, Save, Settings, User as UserIcon, Shield, UploadCloud, Trash2, Plus, CalendarDays, CheckCircle2, XCircle
} from 'lucide-react';
import { mockPackages } from '../../data/mockPackages';

export default function PackageEdit() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { id } = useParams();
  
  const isUmrahContext = pathname.includes('/umrah');
  const entityName = isUmrahContext ? 'Umrah Package' : 'Tour';
  const backPath = isUmrahContext ? '/umrah' : '/packages';

  const isNew = id === 'new' || !id;
  const pkg = isNew ? null : mockPackages.find(p => p.id === Number(id));

  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'location' | 'itinerary' | 'inclusions' | 'gallery' | 'seo' | 'translations'>('general');

  // Itinerary State
  const [itineraryDays, setItineraryDays] = useState([{ day: 1, title: '', description: '', location: '', lat: '', lng: '' }]);

  // Inclusions / Exclusions State
  const defaultInclusions = [
    { name: 'Complimentary Breakfast', selected: false }, { name: 'Lunch', selected: false }, { name: 'Dinner', selected: false }, { name: 'Transportation', selected: false },
    { name: 'Professional Tour Guide', selected: false }, { name: 'Hotel Pickup and Drop-off', selected: false }, { name: 'Entrance Fees', selected: false }, { name: 'WiFi Access', selected: false },
    { name: 'Air Conditioning', selected: false }, { name: 'Parking', selected: false }
  ];
  const defaultExclusions = [
    { name: 'Airfare & Airport Taxes', selected: false }, { name: 'Visa Charges', selected: false }, { name: 'Travel Insurance', selected: false }, { name: 'Tips and Gratuities', selected: false },
    { name: 'Personal Expenses', selected: false }, { name: 'Optional Tours', selected: false }, { name: 'Alcoholic Beverages', selected: false }
  ];

  const [inclusions, setInclusions] = useState(defaultInclusions);
  const [exclusions, setExclusions] = useState(defaultExclusions);

  const toggleInclusion = (index: number) => {
    const newIncs = [...inclusions];
    newIncs[index].selected = !newIncs[index].selected;
    setInclusions(newIncs);
  };

  const toggleExclusion = (index: number) => {
    const newExcs = [...exclusions];
    newExcs[index].selected = !newExcs[index].selected;
    setExclusions(newExcs);
  };

  return (
    <form className="space-y-6 max-w-5xl animate-in fade-in duration-300 pb-10" onSubmit={(e) => { e.preventDefault(); navigate(backPath); }}>
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <button type="button" onClick={() => navigate(backPath)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{isNew ? `Add ${entityName}` : `Edit ${entityName}`}</h2>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-2 pt-2 bg-white overflow-x-auto hide-scrollbar">
          {[
            { id: 'general', label: 'General Info', icon: Info },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
            { id: 'location', label: 'Location', icon: MapPin },
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'inclusions', label: 'Inclusions & Exclusions', icon: ListChecks },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
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
          
          {/* TAB: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6"><Flag size={16} /> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Owner</label>
                    <input type="text" defaultValue={pkg?.owner} placeholder="Search by name or email..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Name *</label>
                    <input type="text" defaultValue={pkg?.title} placeholder={`Enter ${entityName} Name`} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Tour Type</label>
                    <select defaultValue={pkg?.tourType || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 cursor-pointer">
                      <option value="" disabled>Select Type</option>
                      {isUmrahContext ? (
                        <><option value="Umrah">Umrah</option><option value="Hajj">Hajj</option><option value="Ziyarat">Ziyarat</option></>
                      ) : (
                        <><option value="Join-In">Join-In</option><option value="Private">Private</option><option value="Sightseeing">Sightseeing</option></>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Stars</label>
                    <select defaultValue={pkg?.stars || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 cursor-pointer">
                      <option value="" disabled>Select</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Days</label>
                    <input type="number" defaultValue={pkg?.days || 1} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Nights</label>
                    <input type="number" defaultValue={pkg?.nights || 0} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-shadow">
                    <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
                      <select className="text-sm border-none bg-transparent outline-none text-gray-600"><option>Paragraph</option><option>Heading 1</option></select>
                      <div className="w-px h-4 bg-gray-300 mx-1"></div>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Type size={14}/></button>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Bold size={14}/></button>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Italic size={14}/></button>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Underline size={14}/></button>
                      <div className="w-px h-4 bg-gray-300 mx-1"></div>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Link size={14}/></button>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><ImageIcon size={14}/></button>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><List size={14}/></button>
                      <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={14}/></button>
                    </div>
                    <textarea rows={6} placeholder="Type the content here!" className="w-full p-4 text-sm outline-none resize-y min-h-[150px]" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6"><Settings size={16} /> Tour Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" defaultChecked={pkg?.isActive !== false} className="w-4 h-4 text-[#0d6efd] rounded border-gray-300 focus:ring-[#0d6efd]" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" className="w-4 h-4 text-[#0d6efd] rounded border-gray-300 focus:ring-[#0d6efd]" />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0d6efd] rounded border-gray-300 focus:ring-[#0d6efd]" />
                    <span className="text-sm font-medium text-gray-700">Refundable</span>
                  </label>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6"><UserIcon size={16} /> Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label><input type="email" placeholder="contact@example.com" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Phone</label><input type="text" placeholder="+1 (555) 123-4567" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Website</label><input type="url" placeholder="https://example.com" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6"><Shield size={16} /> Policies</h3>
                <div className="space-y-6">
                  <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Cancellation Policy</label><textarea rows={4} placeholder="Enter cancellation policy" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-primary-500 resize-y" /></div>
                  <div><label className="block text-xs font-bold text-gray-700 mb-1.5">Terms & Conditions</label><textarea rows={4} placeholder="Enter terms and conditions" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-primary-500 resize-y" /></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6"><DollarSign size={16} /> Pricing Information</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency *</label>
                  <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500">
                    <option>NGN</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Adult Price</label><input type="number" placeholder="0" defaultValue={pkg?.basePriceNGN || 0} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Child Price</label><input type="number" placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Infant Price</label><input type="number" placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max Adults</label><input type="number" defaultValue="1" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max Children</label><input type="number" defaultValue="0" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Max Infants</label><input type="number" defaultValue="0" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6"><MapPin size={16} /> Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label><input type="text" placeholder="Search city or country" defaultValue={pkg?.location} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label><input type="text" placeholder="Full address" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label><input type="text" placeholder="e.g. 40.7128" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none text-gray-500" readOnly /><p className="text-[10px] text-gray-400 mt-1">Auto-filled from location</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label><input type="text" placeholder="e.g. -74.0060" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none text-gray-500" readOnly /><p className="text-[10px] text-gray-400 mt-1">Auto-filled from location</p></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-6 pb-4 border-b border-gray-100"><CalendarDays size={16} /> Tour Itinerary</h3>
                
                {itineraryDays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <CalendarDays size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No itinerary days added yet</p>
                    <button type="button" onClick={() => setItineraryDays([{ day: 1, title: '', description: '', location: '', lat: '', lng: '' }])} className="bg-[#0d6efd] text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Plus size={16} /> Add Day
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {itineraryDays.map((_, index) => (
                      <div key={index} className="border border-gray-100 rounded-xl p-5 relative bg-gray-50/30">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">{index + 1}</div>
                            <h4 className="font-bold text-gray-800">Day {index + 1}</h4>
                          </div>
                          <button type="button" onClick={() => setItineraryDays(itineraryDays.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                        
                        <div className="space-y-4">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Day Title</label><input type="text" placeholder="e.g., Arrival & City Tour" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Day Description</label><textarea rows={3} placeholder="Brief overview of the day..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-primary-500 resize-none" /></div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Day Location</label><input type="text" placeholder="Search location..." className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label><input type="text" placeholder="Auto-filled" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none text-gray-500" readOnly /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label><input type="text" placeholder="Auto-filled" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none text-gray-500" readOnly /></div>
                          </div>
                          <div className="pt-4 mt-4 border-t border-gray-200 border-dashed">
                            <h5 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-2"><ListChecks size={16}/> Activities <span className="bg-emerald-100 text-emerald-700 px-2 rounded-full text-xs">0</span></h5>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-center pt-4">
                      <button type="button" onClick={() => setItineraryDays([...itineraryDays, { day: itineraryDays.length + 1, title: '', description: '', location: '', lat: '', lng: '' }])} className="w-12 h-12 bg-white border border-gray-200 text-gray-400 hover:text-[#0d6efd] hover:border-[#0d6efd] rounded-full flex items-center justify-center transition-colors shadow-sm">
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INCLUSIONS & EXCLUSIONS */}
          {activeTab === 'inclusions' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-8">
                
                {/* Inclusions */}
                <div>
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100"><CheckCircle2 size={16} className="text-[#0d6efd]"/> Inclusions ({inclusions.filter(i => i.selected).length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {inclusions.map((item, index) => (
                      <button type="button" key={index} onClick={() => toggleInclusion(index)} className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${item.selected ? 'border-[#0d6efd] bg-blue-50/30' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${item.selected ? 'border-[#0d6efd] bg-[#0d6efd]' : 'border-gray-300'}`}>
                          {item.selected && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm ${item.selected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div>
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100"><XCircle size={16} className="text-[#0d6efd]"/> Exclusions ({exclusions.filter(i => i.selected).length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {exclusions.map((item, index) => (
                      <button type="button" key={index} onClick={() => toggleExclusion(index)} className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${item.selected ? 'border-[#0d6efd] bg-blue-50/30' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${item.selected ? 'border-[#0d6efd] bg-[#0d6efd]' : 'border-gray-300'}`}>
                          {item.selected && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm ${item.selected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6"><ImageIcon size={16} /> Tour Gallery</h3>
                <div className="border border-dashed border-[#0d6efd]/30 rounded-xl bg-[#0d6efd]/5 flex flex-col items-center justify-center py-16 px-4 hover:bg-[#0d6efd]/10 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#0d6efd] mb-4"><ImageIcon size={24} /></div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">Upload Images</h4>
                  <p className="text-sm text-gray-500 mb-6">Drag and drop images here, or click to select files</p>
                  <button type="button" className="bg-[#0d6efd] text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 mb-4 hover:bg-blue-700 transition-colors">
                    <UploadCloud size={16} /> Choose Images
                  </button>
                  <p className="text-[11px] text-gray-400">Supported formats: JPG, PNG, WEBP • Max size: 5MB per image</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6"><Search size={16} /> SEO Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                    <input type="text" placeholder="Enter SEO meta title" defaultValue={pkg?.title} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                    <textarea rows={3} placeholder="Enter meta description" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-primary-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Keywords</label>
                    <textarea rows={3} placeholder="Enter keywords separated by commas" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-primary-500 resize-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRANSLATIONS (Fallback) */}
          {activeTab === 'translations' && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                 <Globe size={24} />
               </div>
               <h3 className="text-lg font-bold text-gray-800 mb-1">Translation Settings</h3>
               <p className="text-sm text-gray-500">Configure multi-language support here.</p>
            </div>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(backPath)} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 bg-[#0d6efd] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
            <Save size={16} /> Submit
          </button>
        </div>

      </div>
    </form>
  );
}