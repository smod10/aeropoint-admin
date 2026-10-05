import { Link } from 'react-router-dom';
import { RotateCcw, Trash2 } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers';
import { getCurrentActorRole, isSuperAdmin, readAccountOverrides, readAccountTrash, restoreAccountFromTrash } from '../../utils/accountAccess';
import { useState } from 'react';

export default function UserTrash() {
  const [trash, setTrash] = useState(readAccountTrash);
  const overrides = readAccountOverrides();
  const actorRole = getCurrentActorRole();
  const records = mockUsers
    .filter(account => Boolean(trash[account.id]))
    .map(account => ({ ...account, ...overrides[account.id], deleted: trash[account.id] }));

  const restore = (id: number) => {
    restoreAccountFromTrash(id);
    setTrash(readAccountTrash());
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Users / Account recovery</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Trash</h1>
          <p className="mt-1 text-sm text-gray-500">Deleted accounts are retained here until restored.</p>
        </div>
        <Link to="/users" className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Back to customers</Link>
      </div>

      {!isSuperAdmin(actorRole) && <div role="status" className="rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-800">Only a super admin can restore accounts.</div>}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Trash2 size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Deleted accounts <span className="ml-1 text-gray-400">{records.length}</span></h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 font-semibold">Account</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Deleted</th><th className="px-5 py-3 font-semibold">Deleted by</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(account => <tr key={account.id}>
                <td className="px-5 py-4"><span className="font-medium text-gray-900">{account.firstName} {account.lastName}</span><span className="mt-0.5 block text-xs text-gray-500">{account.email}</span></td>
                <td className="px-5 py-4 capitalize text-gray-600">{account.role}</td>
                <td className="px-5 py-4 text-gray-600">{new Date(account.deleted.deletedAt).toLocaleString()}</td>
                <td className="px-5 py-4 capitalize text-gray-600">{account.deleted.deletedBy.replace('_', ' ')}</td>
                <td className="px-5 py-4 text-right">{isSuperAdmin(actorRole) && <button onClick={() => restore(account.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"><RotateCcw size={14} /> Restore</button>}</td>
              </tr>)}
              {records.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">Trash is empty.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}