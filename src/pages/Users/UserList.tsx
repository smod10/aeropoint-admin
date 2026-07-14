import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Columns, Edit2, Trash2, Plus, ChevronDown } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers'; 

export default function UserList() {
  const navigate = useNavigate();
  const { role } = useParams(); 
  const [rowsPerPage, setRowsPerPage] = useState('25');
  const [users, setUsers] = useState(mockUsers);

  // Filter dynamically based on URL parameter
  const filteredUsers = role 
    ? users.filter(u => u.role === role) 
    : users;

  const pageTitle = role 
    ? `${role.charAt(0).toUpperCase() + role.slice(1)} Users` 
    : 'All Users';

  const toggleStatus = (id: number, field: 'status' | 'banned') => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: !u[field] } : u));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Top Filters */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">Total: {filteredUsers.length} records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Columns size={16} /> View Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>
          
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            All Columns <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>

          <div className="flex relative">
            <input type="text" placeholder="Search records..." className="bg-white border border-gray-200 rounded-l-lg px-4 py-2.5 text-sm outline-none focus:border-primary-500 w-48" />
            <button className="bg-primary-600 text-white px-4 py-2.5 rounded-r-lg hover:bg-primary-700 transition-colors">
              <Search size={16} />
            </button>
          </div>

          <button onClick={() => navigate('/users/edit/new')} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm ml-2">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 w-10">#</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Banned</th>
                <th className="px-4 py-4">First Name</th>
                <th className="px-4 py-4">Last Name</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Balance</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(u.id, 'status')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.status ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${u.status ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleStatus(u.id, 'banned')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.banned ? 'bg-red-500' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${u.banned ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900">{u.firstName}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  
                  <td className="px-4 py-3">
                    <span className="capitalize">{u.role}</span>
                  </td>

                  <td className="px-4 py-3">
                    USD <span className="font-bold text-gray-900">{u.balance}</span>
                  </td>
                  
                  <td className="px-4 py-3 text-center space-x-1">
                    <button onClick={() => navigate(`/users/edit/${u.id}`)} className="inline-flex p-1.5 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setUsers(users.filter(user => user.id !== u.id))} className="inline-flex p-1.5 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing 1 to {filteredUsers.length} of {filteredUsers.length} results</span>
            <select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)} className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary-500 cursor-pointer">
              <option value="25">25 per page</option><option value="50">50 per page</option><option value="100">100 per page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500 text-white text-sm font-medium shadow-sm transition-colors">1</button>
            <button className="px-3 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 text-sm font-medium cursor-not-allowed">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}