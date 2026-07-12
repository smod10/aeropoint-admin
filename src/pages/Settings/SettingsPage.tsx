import { useState } from 'react';
import { Building, Globe, Users, Shield, Bell, Save, Upload } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General Info', icon: Building },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage company information, system preferences, and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-soft border border-gray-100 p-8">
          
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                    <Upload className="text-gray-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Company Logo</h4>
                    <p className="text-xs text-gray-500 mb-3">Recommended size 256x256px.</p>
                    <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200">
                      Change Logo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input type="text" defaultValue="Aeropoint Express" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input type="email" defaultValue="support@aeropoint.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                    <input type="text" defaultValue="+44 20 7946 0958" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT Number</label>
                    <input type="text" defaultValue="GB992384710" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Currency</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="GMT">GMT (London)</option>
                    <option value="EST">EST (New York)</option>
                    <option value="GST">GST (Dubai)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <button className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                  Invite Member
                </button>
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-700">User</th>
                      <th className="px-4 py-3 font-medium text-gray-700">Role</th>
                      <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3"><span className="font-medium text-gray-900">Admin User</span><br/><span className="text-xs text-gray-400">admin@aeropoint.com</span></td>
                      <td className="px-4 py-3">Super Admin</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">Active</span></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><span className="font-medium text-gray-900">Sarah Jenkins</span><br/><span className="text-xs text-gray-400">sarah@aeropoint.com</span></td>
                      <td className="px-4 py-3">Booking Agent</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Footer shared across tabs */}
          <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}