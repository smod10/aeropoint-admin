import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Globe, Users, Shield, Bell, Save, Pencil, UserPlus, Trash2 } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers';
import companyLogo from '../../assets/aeropoint-express-logo.png';
import { canEditAccount, canManageTeam, getCurrentAccountId, getCurrentActorRole, moveAccountToTrash, readAccountTrash } from '../../utils/accountAccess';

const roleOptions = ['All Roles', 'admin', 'employee', 'supplier', 'agent'];
type TeamMemberUpdate = { firstName: string; lastName: string; email: string; phone: string; role: string; department: string; status: boolean };

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'general' | 'localization' | 'team'>(location.pathname === '/settings/team' ? 'team' : 'general');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [teamOverrides] = useState<Record<number, Partial<TeamMemberUpdate>>>(() => JSON.parse(localStorage.getItem('aeropoint-team-overrides') || '{}'));
  const [teamTrash, setTeamTrash] = useState(readAccountTrash);
  const [baseCurrency, setBaseCurrency] = useState(() => localStorage.getItem('aeropoint-base-currency') || 'NGN');
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('aeropoint-time-zone') || 'Africa/Lagos');
  const actorRole = getCurrentActorRole();

  useEffect(() => {
    setActiveTab(location.pathname === '/settings/team' ? 'team' : 'general');
  }, [location.pathname]);

  const roleSummary = useMemo(() => [
    { id: 'admin', label: 'Admins', count: mockUsers.filter(user => !teamTrash[user.id] && (teamOverrides[user.id]?.role ?? user.role) === 'admin').length, tone: 'bg-primary-100 text-primary-800' },
    { id: 'employee', label: 'Employees', count: mockUsers.filter(user => !teamTrash[user.id] && (teamOverrides[user.id]?.role ?? user.role) === 'employee').length, tone: 'bg-blue-100 text-blue-700' },
    { id: 'supplier', label: 'Suppliers', count: mockUsers.filter(user => !teamTrash[user.id] && (teamOverrides[user.id]?.role ?? user.role) === 'supplier').length, tone: 'bg-orange-100 text-orange-700' },
    { id: 'agent', label: 'Agents', count: mockUsers.filter(user => !teamTrash[user.id] && (teamOverrides[user.id]?.role ?? user.role) === 'agent').length, tone: 'bg-emerald-100 text-emerald-700' },
  ], [teamOverrides, teamTrash]);

  const teamMembers = useMemo(
    () => mockUsers
      .map(user => ({ ...user, ...teamOverrides[user.id] }))
      .filter(user => ['admin', 'employee', 'supplier', 'agent'].includes(user.role))
      .filter(user => !teamTrash[user.id])
      .map(user => ({
        ...user,
        roleLabel: user.role === 'admin' ? 'Admin' : user.role === 'employee' ? 'Employee' : user.role === 'supplier' ? 'Supplier' : 'Agent',
        location: teamOverrides[user.id]?.department ?? (user.role === 'supplier' ? 'Operations' : user.role === 'agent' ? 'Sales' : user.role === 'employee' ? 'Support' : 'Executive'),
      })),
    [teamOverrides, teamTrash]
  );

  const filteredTeamMembers = selectedRole === 'All Roles'
    ? teamMembers
    : teamMembers.filter(member => member.role === selectedRole);

  const handleTabChange = (tab: 'general' | 'localization' | 'team') => {
    setActiveTab(tab);
    if (tab !== 'localization') {
      navigate(tab === 'team' ? '/settings/team' : '/settings');
    }
  };

  const deleteTeamMember = (id: number) => {
    if (!window.confirm('Move this team member to Team Trash?')) return;
    moveAccountToTrash(id, actorRole);
    setTeamTrash(readAccountTrash());
  };

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
                onClick={() => handleTabChange(tab.id as 'general' | 'localization' | 'team')}
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
                  <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2">
                    <img src={companyLogo} alt="Aeropoint Express Travel Ltd" className="w-full h-auto" />
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
                    <input type="email" defaultValue="info@aeropointexpress.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                    <input type="tel" defaultValue="+234 702 599 0424" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT Number</label>
                    <input type="text" defaultValue="GB992384710" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                    <textarea rows={2} defaultValue="68 Vulcanizer bus, Liberty Road, Oke Ado, Ibadan." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-y" />
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
                  <select value={baseCurrency} onChange={event => { setBaseCurrency(event.target.value); localStorage.setItem('aeropoint-base-currency', event.target.value); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="NGN">NGN - Nigerian Naira (₦)</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select value={timeZone} onChange={event => { setTimeZone(event.target.value); localStorage.setItem('aeropoint-time-zone', event.target.value); }} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
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
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex flex-col lg:flex-row justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Team & Roles</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage internal access, assignments, and role ownership.</p>
                </div>
                <div className="flex gap-2">
                  {canManageTeam(actorRole) && <button onClick={() => navigate('/settings/team/trash')} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <Trash2 size={14} className="inline mr-2" />Team Trash
                  </button>}
                  <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <UserPlus size={14} className="inline mr-2" />
                    Invite Member
                  </button>
                  <button className="bg-primary-50 text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                    Add Role
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {roleSummary.map((role) => (
                  <button key={role.id} onClick={() => navigate(`/settings/roles/${role.id}`)} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${role.tone}`}>
                      {role.label}
                    </div>
                    <p className="mt-4 text-2xl font-bold text-gray-900">{role.count}</p>
                    <span className="mt-2 block text-xs font-medium text-primary-600">Manage access</span>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedRole === role
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
                      <tr>
                        <th className="px-4 py-4">Staff</th>
                        <th className="px-4 py-4">Role</th>
                        <th className="px-4 py-4">Department</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredTeamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                            <div className="text-xs text-gray-400">{member.email}</div>
                          </td>
                          <td className="px-4 py-4 capitalize">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              member.role === 'agent' ? 'bg-emerald-100 text-emerald-700' :
                              member.role === 'supplier' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {member.roleLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-700">{member.location}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${member.status ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                              {member.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {canEditAccount(actorRole, member) && <button onClick={() => navigate(`/settings/team/${member.id}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                                <Pencil size={12} /> Edit
                              </button>}
                              {canManageTeam(actorRole) && !member.isSuperAdmin && member.id !== getCurrentAccountId() && <button onClick={() => deleteTeamMember(member.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                <Trash2 size={12} /> Delete
                              </button>}
                              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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