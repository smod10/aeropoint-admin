import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User as UserIcon, Info, History, Bookmark, 
  CreditCard, AlignLeft, Wallet, Save, XCircle, 
  CheckCircle2, Columns, Image as ImageIcon, ChevronDown, 
  MapPin, Shield, Building 
} from 'lucide-react'; // Shield and Building are safer fallbacks for older lucide versions
import { mockUsers } from '../../data/mockUsers';

type TabType = 'profile' | 'information' | 'activity' | 'bookings' | 'transactions' | 'notes';

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Safe fallback if user isn't found
  const user = mockUsers.find(u => u.id === Number(id)) || mockUsers[0];
  const isNew = id === 'new' || !id;

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Safe phone split logic so the page doesn't crash if formatting is off
  const phoneParts = user?.phone ? user.phone.split(' ') : ['+1', ''];
  const phonePrefix = phoneParts[0];
  const phoneNumber = phoneParts.slice(1).join(' ');

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'New User' : `User ID: ${user?.id}`}</h2>
            {!isNew && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"><Info size={12}/> {user?.uid}</span> • <span>{user?.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-32">
              <option value="active" selected={user?.status}>Active</option>
              <option value="inactive" selected={!user?.status}>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Role</label>
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-32 capitalize">
              <option value={user?.role}>{user?.role}</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="supplier">Supplier</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Banned Status</label>
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none w-full md:w-32">
              <option value="no" selected={!user?.banned}>No</option>
              <option value="yes" selected={user?.banned}>Yes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area: Tabs & Form Content */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-100 pt-2 overflow-x-auto hide-scrollbar bg-gray-50/50 px-2">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'information', label: 'Information', icon: Info },
              { id: 'activity', label: 'Activity', icon: History },
              { id: 'bookings', label: 'Bookings', icon: Bookmark, badge: '1' },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'notes', label: 'Notes', icon: AlignLeft }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-primary-600 text-primary-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
                {tab.badge && <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="p-6 lg:p-8 flex-1">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><UserIcon size={16} className="text-gray-500"/> Personal Information</h3>
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">First Name</label><input type="text" defaultValue={user?.firstName || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label><input type="text" defaultValue={user?.lastName || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Email</label><input type="email" defaultValue={user?.email || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex gap-2">
                        <select className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none">
                          <option selected={phonePrefix.includes('+92')}>PK +92</option>
                          <option selected={phonePrefix.includes('+1')}>US +1</option>
                          <option selected={phonePrefix.includes('+234')}>NG +234</option>
                        </select>
                        <input type="text" defaultValue={phoneNumber} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-4"><Shield size={16} /> Security</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password (leave blank to keep current password)</label>
                  <input type="password" placeholder="Enter new password to change" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4"><MapPin size={16} className="text-gray-500"/> Address Information</h3>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <textarea rows={3} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none mb-4" />
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">State</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500" /></div>
                  </div>
                </div>
              </div>
            )}

            {/* INFORMATION TAB */}
            {activeTab === 'information' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-6"><Info size={16} className="text-gray-500"/> User Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">USER ID</p>
                    <p className="text-sm font-mono text-gray-800">{user?.uid}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">EMAIL VERIFIED</p>
                    {user?.verified ? (
                      <p className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> Verified</p>
                    ) : (
                      <p className="text-sm font-medium text-red-500 flex items-center gap-1"><XCircle size={14}/> Not Verified</p>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ACCOUNT STATUS</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user?.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{user?.status ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">LOGIN ATTEMPTS</p>
                    <p className="text-sm font-medium text-gray-800">0</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">CREATED AT</p>
                    <p className="text-sm font-medium text-gray-800">{user?.createdAt}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">UPDATED AT</p>
                    <p className="text-sm font-medium text-gray-800">{user?.createdAt}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">LAST LOGIN</p>
                    <p className="text-sm font-medium text-gray-800">Never</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">TIMEZONE</p>
                    <p className="text-sm font-medium text-gray-800">UTC</p>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSACTIONS & OTHERS EMPTY STATE */}
            {['activity', 'bookings', 'transactions', 'notes'].includes(activeTab) && (
              <div className="animate-in fade-in h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 capitalize">{activeTab} Logs</h3>
                    <p className="text-sm text-gray-500">Total: 0 records</p>
                  </div>
                  <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <Columns size={14} /> View Columns <ChevronDown size={14} />
                  </button>
                </div>
                
                <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap mb-8 border-b border-gray-100">
                  <thead className="text-[10px] text-gray-400 uppercase bg-white border-b border-gray-100 font-bold tracking-wider">
                    {activeTab === 'transactions' && <tr><th className="px-4 py-3 w-10">#</th><th className="px-4 py-3">TRX ID</th><th className="px-4 py-3">TYPE</th><th className="px-4 py-3">AMOUNT</th><th className="px-4 py-3">CURRENCY</th><th className="px-4 py-3">GATEWAY ID</th><th className="px-4 py-3">DESCRIPTION</th><th className="px-4 py-3">DATE</th></tr>}
                    {activeTab !== 'transactions' && <tr><th className="px-4 py-3 w-10">#</th><th className="px-4 py-3">RECORD ID</th><th className="px-4 py-3">DETAILS</th><th className="px-4 py-3">DATE</th></tr>}
                  </thead>
                </table>

                <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4"><ImageIcon size={24} /></div>
                  <h4 className="text-gray-800 font-bold mb-1">No Content Available</h4>
                  <p className="text-sm text-gray-500 max-w-xs">No records found in this table. Start by adding a new record.</p>
                </div>
              </div>
            )}
          </div>
          
          {activeTab === 'profile' && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
              <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Wallet & Stats */}
        <div className="space-y-6">
          
          <div className="bg-gradient-to-br from-[#2b64ff] to-[#1a4de5] rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full transform translate-x-10 -translate-y-10"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"><Wallet size={20}/></div>
              <div><h4 className="text-sm font-bold">Digital Wallet</h4><p className="text-xs text-blue-100">{user?.id}</p></div>
            </div>
            <div className="mb-6">
              <p className="text-xs text-blue-100 mb-1">Available Balance</p>
              <h2 className="text-3xl font-black">USD {user?.balance || '0.00'}</h2>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/10 text-white py-2.5 rounded-lg text-sm font-bold">
              <Building size={16} /> Manage Funds
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-blue-600"><Bookmark size={16}/> <span className="text-xs font-bold uppercase">Bookings</span></div>
                <span className="text-2xl font-black text-blue-900">1</span>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-orange-600"><History size={16}/> <span className="text-xs font-bold uppercase">Activities</span></div>
                <span className="text-2xl font-black text-orange-900">0</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-emerald-600"><CreditCard size={16}/> <span className="text-xs font-bold uppercase">Transactions</span></div>
                <span className="text-2xl font-black text-emerald-900">0</span>
              </div>
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-24">
                <div className="flex items-center gap-2 text-purple-600"><AlignLeft size={16}/> <span className="text-xs font-bold uppercase">Notes</span></div>
                <span className="text-2xl font-black text-purple-900">0</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}