import { useState } from 'react';
import { Settings, Plus, Search, Columns, Edit2, Trash2, Briefcase, GraduationCap, Plane, Clock, Zap, Rocket, Calendar, Infinity as InfinityIcon, FileText } from 'lucide-react'; // Swapped to Columns

const visaTypes = [
  { id: 1, status: true, name: 'Tourist Visa', value: 'tourist', icon: Briefcase, desc: 'For leisure and tourism purposes', order: 1, type: 'visa_type' },
  { id: 2, status: true, name: 'Business Visa', value: 'business', icon: Briefcase, desc: 'For business meetings and conferences', order: 2, type: 'visa_type' },
  { id: 3, status: true, name: 'Student Visa', value: 'student', icon: GraduationCap, desc: 'For educational purposes', order: 3, type: 'visa_type' },
  { id: 4, status: true, name: 'Work Visa', value: 'work', icon: Briefcase, desc: 'For employment purposes', order: 4, type: 'visa_type' },
  { id: 5, status: true, name: 'Transit Visa', value: 'transit', icon: Plane, desc: 'For transit through the country', order: 5, type: 'visa_type' },
  { id: 6, status: true, name: 'Medical Visa', value: 'medical', icon: FileText, desc: 'For medical treatment', order: 6, type: 'visa_type' },
];

const processingSpeeds = [
  { id: 1, status: true, name: 'Standard', value: 'standard', icon: Clock, desc: '7-10 business days', order: 1, type: 'processing_speed' },
  { id: 2, status: true, name: 'Express', value: 'express', icon: Zap, desc: '3-5 business days', order: 2, type: 'processing_speed' },
  { id: 3, status: true, name: 'Rush', value: 'rush', icon: Rocket, desc: '1-2 business days', order: 3, type: 'processing_speed' },
  { id: 4, status: true, name: 'Super Rush', value: 'super_rush', icon: Zap, desc: 'Same day processing', order: 4, type: 'processing_speed' },
];

const entryTypes = [
  { id: 1, status: true, name: 'Single Entry', value: 'single', label: '1', desc: 'Valid for one entry only', order: 1, type: 'entry_type' },
  { id: 2, status: true, name: 'Double Entry', value: 'double', label: '2', desc: 'Valid for two entries', order: 2, type: 'entry_type' },
  { id: 3, status: true, name: 'Multiple Entry', value: 'multiple', icon: InfinityIcon, desc: 'Valid for multiple entries', order: 3, type: 'entry_type' },
];

const durationTypes = [
  { id: 1, status: true, name: '30 Days', value: '30', icon: Calendar, desc: 'Valid for 30 days', order: 1, type: 'duration_type' },
  { id: 2, status: true, name: '60 Days', value: '60', icon: Calendar, desc: 'Valid for 60 days', order: 2, type: 'duration_type' },
  { id: 3, status: true, name: '90 Days', value: '90', icon: Calendar, desc: 'Valid for 90 days', order: 3, type: 'duration_type' },
  { id: 4, status: true, name: '6 Months', value: '180', icon: Calendar, desc: 'Valid for 6 months', order: 4, type: 'duration_type' },
  { id: 5, status: true, name: '1 Year', value: '365', icon: Calendar, desc: 'Valid for 1 year', order: 5, type: 'duration_type' },
  { id: 6, status: true, name: '2 Years', value: '730', icon: Calendar, desc: 'Valid for 2 years', order: 6, type: 'duration_type' },
  { id: 7, status: true, name: '5 Years', value: '1825', icon: Calendar, desc: 'Valid for 5 years', order: 7, type: 'duration_type' },
];

type TabType = 'visa_type' | 'processing_speed' | 'entry_type' | 'duration_type';

export default function VisaSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('visa_type');

  const getActiveData = () => {
    switch (activeTab) {
      case 'visa_type': return visaTypes;
      case 'processing_speed': return processingSpeeds;
      case 'entry_type': return entryTypes;
      case 'duration_type': return durationTypes;
      default: return visaTypes;
    }
  };

  const currentData = getActiveData();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings size={24} className="text-gray-700" /> Visa Settings Management
        </h2>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
          <Plus size={16} /> Add New Setting
        </button>
      </div>

      {/* Configuration Tabs container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        
        {/* Tabs Header */}
        <div className="flex border-b border-gray-100 px-6 pt-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'visa_type', label: 'Visa Type' },
            { id: 'processing_speed', label: 'Processing speed' },
            { id: 'entry_type', label: 'Entry Type' },
            { id: 'duration_type', label: 'Duration type' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Table Area */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Records</h3>
              <p className="text-sm text-gray-500">Total: {currentData.length} records</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center justify-between gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Columns size={16} /> View Columns <span className="text-gray-400 text-xs ml-1">▼</span>
              </button>
              <button className="flex items-center justify-between gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                All Columns <span className="text-gray-400 text-xs ml-1">▼</span>
              </button>
              <div className="flex relative">
                <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm outline-none focus:border-primary-500 w-48 lg:w-64" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                    <th className="px-6 py-4 w-12">#</th>
                    <th className="px-6 py-4 w-24">Status</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4 text-center">Icon</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Order</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-primary-600" /></td>
                      <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                      
                      <td className="px-6 py-3">
                        <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.status ? 'bg-primary-600' : 'bg-gray-200'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.status ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </td>

                      <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                      
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md font-mono tracking-tight">{item.value}</span>
                      </td>
                      
                      <td className="px-6 py-3 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-50 border border-gray-100 text-gray-500">
                          {item.icon ? <item.icon size={16} /> : <span className="text-xs font-bold">{item.label}</span>}
                        </div>
                      </td>

                      <td className="px-6 py-3 text-gray-500">{item.desc}</td>
                      <td className="px-6 py-3 text-center font-medium text-gray-700">{item.order}</td>
                      
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-md tracking-tight">{item.type}</span>
                      </td>
                      
                      <td className="px-6 py-3 text-center space-x-1">
                        <button className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}