import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Info, DollarSign, FileText, Image as ImageIcon, Trash2, Plus, UploadCloud } from 'lucide-react';
import { visaDictionary } from '../../data/VisaSettings'; // The Bridge!

// Top destinations to populate the dropdown
const topDestinations = [
  'United Kingdom', 'United States', 'Canada', 'United Arab Emirates', 'Saudi Arabia', 'South Africa', 'Egypt', 'Kenya', 'Qatar', 'Turkey', 'Singapore', 'Malaysia', 'China', 'India', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Australia', 'Brazil', 'Japan'
];

export default function VisaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new' || !id;

  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'requirements' | 'gallery'>('general');

  // Dynamic Pricing Options based on Settings
  const [pricingOptions, setPricingOptions] = useState(isNew ? [] : [
    { id: 1, type: 'Tourist Visa', processing: 'Standard (7-10 Days)', entry: 'Single Entry', duration: '6 Months', baseFee: '120000', markup: '30000' }
  ]);

  const [requirements, setRequirements] = useState([
    'Valid Nigerian passport (minimum 6 months validity)',
    'Completed visa application form',
    'Two recent passport-sized photographs',
    'Flight itinerary (round trip)',
    'Hotel bookings or proof of accommodation',
    'Bank statements (last 6 months stamped by bank)',
    'Certificate of employment or CAC documents for business owners',
  ]);

  // Pricing Handlers
  const addPricingOption = () => {
    setPricingOptions([...pricingOptions, { 
      id: Date.now(), type: visaDictionary.types[0], processing: visaDictionary.processing[0], 
      entry: visaDictionary.entries[0], duration: visaDictionary.durations[0], baseFee: '', markup: '' 
    }]);
  };

  const removePricingOption = (idToRemove: number) => {
    setPricingOptions(pricingOptions.filter(opt => opt.id !== idToRemove));
  };

  const updatePricing = (id: number, field: string, value: string) => {
    setPricingOptions(pricingOptions.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  // Requirement Handlers
  const addRequirement = () => setRequirements([...requirements, '']);
  const removeRequirement = (index: number) => setRequirements(requirements.filter((_, i) => i !== index));
  const updateRequirement = (index: number, value: string) => {
    const newReqs = [...requirements];
    newReqs[index] = value;
    setRequirements(newReqs);
  };

  return (
    <form className="space-y-6 max-w-5xl animate-in fade-in duration-300" onSubmit={(e) => { e.preventDefault(); navigate('/visa'); }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/visa')} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'Create Country Visa Profile' : 'Edit Country Visa Profile'}</h2>
        </div>
      </div>

      {/* Main Card with Tabs */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-6 pt-4 bg-gray-50/50 overflow-x-auto hide-scrollbar">
          <button type="button" onClick={() => setActiveTab('general')} className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'general' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Info size={16} /> General Info
          </button>
          <button type="button" onClick={() => setActiveTab('pricing')} className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'pricing' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <DollarSign size={16} /> Visa Types & Pricing
            <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{pricingOptions.length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab('requirements')} className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'requirements' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <FileText size={16} /> Requirements
          </button>
          <button type="button" onClick={() => setActiveTab('gallery')} className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'gallery' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <ImageIcon size={16} /> Gallery
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-8 flex-1">
          
          {/* TAB: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                <Info size={16} className="text-primary-500" /> Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Country *</label>
                  <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="Nigeria" selected>Nigeria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country *</label>
                  <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select Destination</option>
                    {topDestinations.map(country => (
                      <option key={country} value={country} selected={!isNew && country === 'United Kingdom'}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country Visa Description</label>
                <textarea 
                  rows={4} 
                  defaultValue={!isNew ? "Comprehensive visa processing for Nigerian citizens traveling to the UK. Includes biometric appointment scheduling and document vetting." : ""}
                  placeholder="Enter a general description that will show on the frontend..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Publish to Frontend</h4>
                  <p className="text-xs text-gray-500">Make this country available on the website for booking.</p>
                </div>
                <label className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary-600 cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform translate-x-6" />
                </label>
              </div>
            </div>
          )}

          {/* TAB: PRICING & VISAS (Connected to Settings) */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign size={16} className="text-primary-500" /> Configured Visa Types for this Country
                </h3>
                <button type="button" onClick={addPricingOption} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg">
                  <Plus size={16} /> Add Visa Option
                </button>
              </div>

              {pricingOptions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-sm">No visa types configured for this country yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pricingOptions.map((opt, index) => (
                    <div key={opt.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative">
                      <div className="absolute top-4 right-4">
                        <button type="button" onClick={() => removePricingOption(opt.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </div>
                      
                      <h4 className="font-bold text-gray-800 mb-4 text-sm">Option {index + 1}</h4>
                      
                      {/* Dropdowns dynamically pulling from visaDictionary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Visa Type</label>
                          <select value={opt.type} onChange={(e) => updatePricing(opt.id, 'type', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                            {visaDictionary.types.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Processing</label>
                          <select value={opt.processing} onChange={(e) => updatePricing(opt.id, 'processing', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                            {visaDictionary.processing.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Entry Type</label>
                          <select value={opt.entry} onChange={(e) => updatePricing(opt.id, 'entry', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                            {visaDictionary.entries.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                          <select value={opt.duration} onChange={(e) => updatePricing(opt.id, 'duration', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                            {visaDictionary.durations.map((t: string) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Pricing Fields specific to NGN */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Base Fee (NGN)</label>
                          <input type="number" value={opt.baseFee} onChange={(e) => updatePricing(opt.id, 'baseFee', e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Markup/Profit (NGN)</label>
                          <input type="number" value={opt.markup} onChange={(e) => updatePricing(opt.id, 'markup', e.target.value)} placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-800 mb-1">Total Price (NGN)</label>
                          <div className="w-full bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-primary-700 flex items-center">
                            ₦ {(Number(opt.baseFee) + Number(opt.markup)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={16} className="text-primary-500" /> Destination Requirements
                </h3>
              </div>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input type="text" value={req} onChange={(e) => updateRequirement(index, e.target.value)} placeholder="Enter requirement..." className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"/>
                    <button type="button" onClick={() => removeRequirement(index)} className="p-2.5 bg-gray-100 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addRequirement} className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 mt-4 bg-primary-50 px-4 py-2 rounded-lg">
                <Plus size={16} /> Add Requirement
              </button>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3 mb-6">
                <ImageIcon size={16} className="text-primary-500" /> Destination Cover Image
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center py-16 px-4 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-primary-600 mb-4"><UploadCloud size={24} /></div>
                <p className="text-sm font-medium text-gray-800 mb-1">Upload country banner image</p>
                <p className="text-xs text-gray-500">This displays on the frontend destination grid</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={() => navigate('/visa')} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
            <Save size={16} /> {isNew ? 'Publish Destination' : 'Update Destination'}
          </button>
        </div>
      </div>
    </form>
  );
}