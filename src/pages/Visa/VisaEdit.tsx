import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Info, DollarSign, FileText, Image as ImageIcon, Trash2, Plus, UploadCloud } from 'lucide-react';
import { countries } from '../../data/countries'; 
import { globalVisaProfiles } from '../../data/visaProfiles';

export default function VisaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new' || !id;

  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'requirements' | 'gallery'>('general');

  // Form States
  const [destinationCountry, setDestinationCountry] = useState(isNew ? '' : 'United Kingdom');
  const [description, setDescription] = useState('');
  const [pricingOptions, setPricingOptions] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  
  // Track which Visa Option is currently being edited in the dropdown
  const [activeOptionId, setActiveOptionId] = useState<number | null>(null);

  // 1. Define dropdown options safely and dynamically
  const currentProfile = globalVisaProfiles.find(p => p.country === destinationCountry);
  
  const allVisaTypes = Array.from(new Set([
    ...(currentProfile ? currentProfile.options.map(o => o.type) : []),
    'Tourist Visa', 'Business Visa', 'Student Visa', 'Work Visa', 'Transit Visa', 
    'Family Reunion Visa', 'Digital Nomad Visa', 'Medical Treatment Visa', 'e-Visa',
    'Standard Visitor Visa', 'Temporary Resident Visa', 'Residence Visa'
  ]));

  const processingOptions = Array.from(new Set([
    ...(currentProfile ? currentProfile.options.map(o => o.processingSpeed) : []),
    'Standard (7-10 Days)', 'Express (3-5 Days)', 'Rush (1-2 Days)', 
    'Embassy Dependent', '2-4 Business Days', '15-30 Business Days'
  ]));

  const durationOptions = Array.from(new Set([
    ...(currentProfile ? currentProfile.options.map(o => o.duration) : []),
    '14 Days', '30 Days', '60 Days', '90 Days', '6 Months', '1 Year', '2 Years', '5 Years', 'Course Duration'
  ]));

  const entryOptions = ['Single Entry', 'Multiple Entry', 'Double Entry', 'Transit'];

  // 2. Load Country Profile Automation
  const loadCountryProfile = (countryName: string) => {
    const profile = globalVisaProfiles.find(p => p.country === countryName);
    
    if (profile) {
      setDescription(profile.description);
      const mappedOptions = profile.options.map((opt, index) => ({
        id: Date.now() + index, 
        type: opt.type,
        processing: opt.processingSpeed,
        entry: 'Multiple Entry',
        duration: opt.duration,
        baseFee: opt.suggestedBaseFeeNGN.toString(),
        markup: opt.suggestedMarkupNGN.toString()
      }));
      setPricingOptions(mappedOptions);
      setActiveOptionId(mappedOptions.length > 0 ? mappedOptions[0].id : null);
      
      setRequirements(profile.options[0]?.requirements || [
        'Valid passport (minimum 6 months validity)',
        'Completed visa application form',
        'Two recent passport-sized photographs'
      ]);
    } else {
      setDescription('');
      setPricingOptions([]);
      setActiveOptionId(null);
      setRequirements([]);
    }
  };

  useEffect(() => {
    if (!isNew && destinationCountry === 'United Kingdom') {
      loadCountryProfile('United Kingdom');
    }
  }, [isNew, destinationCountry]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setDestinationCountry(selected);
    loadCountryProfile(selected);
  };

  // Pricing Handlers
  const addPricingOption = () => {
    const newId = Date.now();
    setPricingOptions([...pricingOptions, { 
      id: newId, 
      type: allVisaTypes[0], 
      processing: processingOptions[0], 
      entry: entryOptions[0], 
      duration: durationOptions[0], 
      baseFee: '', 
      markup: '' 
    }]);
    setActiveOptionId(newId); // Focus the newly created option
  };

  const removePricingOption = (idToRemove: number) => {
    const filteredOptions = pricingOptions.filter(opt => opt.id !== idToRemove);
    setPricingOptions(filteredOptions);
    // If we deleted the currently active option, switch to the first available one
    if (activeOptionId === idToRemove) {
      setActiveOptionId(filteredOptions.length > 0 ? filteredOptions[0].id : null);
    }
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

  // Find the currently active option to render its specific form
  const activeOption = pricingOptions.find(opt => opt.id === activeOptionId);

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
                  <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" defaultValue="Nigeria">
                    {countries.map(c => <option key={`dep-${c.code}`} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country *</label>
                  <select 
                    value={destinationCountry}
                    onChange={handleCountryChange}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="" disabled>Select Destination</option>
                    {countries.map(c => <option key={`dest-${c.code}`} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country Visa Description</label>
                <textarea 
                  rows={4} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Select a destination country to auto-populate, or type a custom description..."
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

          {/* TAB: PRICING & VISAS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <DollarSign size={16} className="text-primary-500" /> Configured Visa Types for {destinationCountry || 'this Country'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Select a specific visa track from the dropdown to edit its properties.</p>
                </div>
                <button type="button" onClick={addPricingOption} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg">
                  <Plus size={16} /> Add Visa Option
                </button>
              </div>

              {pricingOptions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-sm mb-4">No visa types configured for this country yet.</p>
                  <button type="button" onClick={addPricingOption} className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
                    <Plus size={16} /> Add First Visa Option
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  
                  {/* Master Dropdown Selector */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-6">
                    <div className="flex-1 max-w-sm">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Visa Option to Edit</label>
                      <select 
                        value={activeOptionId || ''} 
                        onChange={(e) => setActiveOptionId(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 font-bold text-primary-700 shadow-sm cursor-pointer"
                      >
                        {pricingOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.type || 'Unnamed Visa Option'}</option>
                        ))}
                      </select>
                    </div>
                    {activeOptionId && (
                      <button type="button" onClick={() => removePricingOption(activeOptionId)} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors self-start md:self-end">
                        <Trash2 size={16} /> Delete Option
                      </button>
                    )}
                  </div>
                  
                  {/* Detailed Form for the Active Option */}
                  {activeOption && (
                    <div className="animate-in fade-in duration-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Visa Type Name</label>
                          <select value={activeOption.type} onChange={(e) => updatePricing(activeOption.id, 'type', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 cursor-pointer">
                            {allVisaTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Processing Speed</label>
                          <select value={activeOption.processing} onChange={(e) => updatePricing(activeOption.id, 'processing', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 cursor-pointer">
                            {processingOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Entry Type</label>
                          <select value={activeOption.entry} onChange={(e) => updatePricing(activeOption.id, 'entry', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 cursor-pointer">
                            {entryOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Duration</label>
                          <select value={activeOption.duration} onChange={(e) => updatePricing(activeOption.id, 'duration', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 cursor-pointer">
                            {durationOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Base Fee (NGN)</label>
                          <input type="number" value={activeOption.baseFee} onChange={(e) => updatePricing(activeOption.id, 'baseFee', e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-primary-500 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Markup/Profit (NGN)</label>
                          <input type="number" value={activeOption.markup} onChange={(e) => updatePricing(activeOption.id, 'markup', e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-primary-500 transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-800 uppercase mb-1.5">Total Price (NGN)</label>
                          <div className="w-full bg-primary-50 border border-primary-100 rounded-lg px-3 py-2.5 text-lg font-black text-primary-700 flex items-center">
                            ₦ {(Number(activeOption.baseFee) + Number(activeOption.markup)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-6 max-w-3xl animate-in fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" /> Destination Requirements
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">These requirements are auto-populated based on standard documentation requested by the destination country.</p>
                </div>
              </div>
              
              {requirements.length === 0 && (
                 <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                   <p className="text-gray-500 text-sm">Select a destination country to view requirements, or add them manually.</p>
                 </div>
              )}

              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <textarea 
                      value={req} 
                      onChange={(e) => updateRequirement(index, e.target.value)} 
                      placeholder="Enter requirement..." 
                      rows={2}
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <button type="button" onClick={() => removeRequirement(index)} className="p-2.5 bg-gray-100 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0 mt-1">
                      <Trash2 size={16} />
                    </button>
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