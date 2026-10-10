import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Save, ShieldCheck } from 'lucide-react';

const roleDefinitions = {
  admin: { label: 'Administrator', description: 'Full access to configuration, operations, and reporting.', defaults: 'all' },
  employee: { label: 'Employee', description: 'Day-to-day operational access for internal staff.', defaults: 'operations' },
} as const;

const resources = ['Dashboard', 'Bookings', 'Customers', 'Flights', 'Hotels & packages', 'Visa & Umrah', 'Payments', 'Reports', 'Team & settings'];
const actions = ['View', 'Create', 'Edit', 'Delete', 'Export'];
type Permissions = Record<string, boolean>;

function defaultPermissions(role: keyof typeof roleDefinitions): Permissions {
  const roleType = roleDefinitions[role].defaults;
  return Object.fromEntries(resources.flatMap(resource => actions.map(action => {
    let allowed = roleType === 'all';
    if (roleType === 'operations') allowed = action === 'View' || (['Bookings', 'Customers', 'Flights', 'Hotels & packages', 'Visa & Umrah'].includes(resource) && ['Create', 'Edit'].includes(action));
    return [`${resource}:${action}`, allowed];
  })));
}

export default function RoleEdit() {
  const { role } = useParams();
  const roleKey = role as keyof typeof roleDefinitions;
  const definition = roleDefinitions[roleKey];
  const [permissions, setPermissions] = useState<Permissions>(() => {
    const stored: Record<string, Permissions> = JSON.parse(localStorage.getItem('aeropoint-role-permissions') || '{}');
    return definition ? stored[roleKey] ?? defaultPermissions(roleKey) : {};
  });
  const [saved, setSaved] = useState(false);

  if (!definition) return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Role not found. <Link className="text-primary-600 hover:underline" to="/settings/team">Return to Team & Roles</Link></div>;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stored: Record<string, Permissions> = JSON.parse(localStorage.getItem('aeropoint-role-permissions') || '{}');
    stored[roleKey] = permissions;
    localStorage.setItem('aeropoint-role-permissions', JSON.stringify(stored));
    setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings/team" aria-label="Back to Team & Roles" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link>
          <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Team & Roles / Access</p><h1 className="mt-1 text-2xl font-bold text-gray-900">{definition.label}</h1><p className="mt-1 text-sm text-gray-500">{definition.description}</p></div>
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save permissions</button>
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <ShieldCheck size={19} className="text-primary-600" />
          <div><h2 className="text-sm font-semibold text-gray-900">Permission matrix</h2><p className="text-xs text-gray-500">Choose which actions this role can perform in each area.</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 font-semibold">Workspace area</th>{actions.map(action => <th key={action} className="px-4 py-3 text-center font-semibold">{action}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map(resource => <tr key={resource} className="hover:bg-gray-50/70">
                <th scope="row" className="px-5 py-4 font-medium text-gray-800">{resource}</th>
                {actions.map(action => {
                  const permission = `${resource}:${action}`;
                  return <td key={permission} className="px-4 py-4 text-center"><input aria-label={`${action} ${resource}`} type="checkbox" checked={Boolean(permissions[permission])} onChange={event => { setSaved(false); setPermissions(current => ({ ...current, [permission]: event.target.checked })); }} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /></td>;
                })}
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">Permission updates apply to members assigned this role.</p>
          {saved && <p role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check size={16} /> Permissions saved</p>}
        </div>
      </section>
    </form>
  );
}