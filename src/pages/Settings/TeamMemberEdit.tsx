import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserRound } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers';
import { canEditAccount, getCurrentActorRole } from '../../utils/accountAccess';

type TeamMemberUpdate = { firstName: string; lastName: string; email: string; phone: string; role: string; department: string; status: boolean };

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  employee: 'Employee',
  supplier: 'Supplier',
  agent: 'Travel agent',
};

export default function TeamMemberEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const actorRole = getCurrentActorRole();
  const member = mockUsers.find(user => user.id === Number(id) && ['admin', 'employee', 'supplier', 'agent'].includes(user.role));
  const savedOverrides: Record<number, Partial<TeamMemberUpdate>> = JSON.parse(localStorage.getItem('aeropoint-team-overrides') || '{}');
  const [form, setForm] = useState<TeamMemberUpdate>(() => {
    const values = { ...member, ...savedOverrides[Number(id)] };
    return {
      firstName: values.firstName ?? '',
      lastName: values.lastName ?? '',
      email: values.email ?? '',
      phone: values.phone ?? '',
      role: values.role ?? 'employee',
      department: values.department ?? (values.role === 'supplier' ? 'Operations' : values.role === 'agent' ? 'Sales' : values.role === 'employee' ? 'Support' : 'Executive'),
      status: values.status ?? true,
    };
  });

  if (!member) {
    return <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">Team member not found.</div>;
  }

  if (!canEditAccount(actorRole, member)) {
    return <div role="alert" className="rounded-lg border border-secondary-200 bg-white p-8 text-center"><h2 className="text-lg font-semibold text-gray-900">Edit access restricted</h2><p className="mt-2 text-sm text-gray-600">Your role cannot edit this team member.</p><button onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Go back</button></div>;
  }

  const update = <K extends keyof TeamMemberUpdate>(key: K, value: TeamMemberUpdate[K]) => setForm(current => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updates: Record<number, Partial<TeamMemberUpdate>> = JSON.parse(localStorage.getItem('aeropoint-team-overrides') || '{}');
    updates[member.id] = form;
    localStorage.setItem('aeropoint-team-overrides', JSON.stringify(updates));
    navigate('/settings/team');
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings/team" aria-label="Back to Team & Roles" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Team & Roles / Member</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Edit team member</h1>
          </div>
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save member</button>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700"><UserRound size={19} /></span>
          <div><h2 className="text-sm font-semibold text-gray-900">Personal details</h2><p className="text-xs text-gray-500">Update the member's contact and assignment details.</p></div>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">First name<input required value={form.firstName} onChange={event => update('firstName', event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></label>
          <label className="text-sm font-medium text-gray-700">Last name<input required value={form.lastName} onChange={event => update('lastName', event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></label>
          <label className="text-sm font-medium text-gray-700">Work email<input required type="email" value={form.email} onChange={event => update('email', event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></label>
          <label className="text-sm font-medium text-gray-700">Phone<input type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></label>
          <label className="text-sm font-medium text-gray-700">Role<select value={form.role} onChange={event => update('role', event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm capitalize outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Department<input required value={form.department} onChange={event => update('department', event.target.value)} placeholder="e.g. Customer Support" className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" /></label>
          <label className="sm:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <span><span className="block text-sm font-medium text-gray-800">Account status</span><span className="mt-0.5 block text-xs text-gray-500">Inactive members cannot access the admin workspace.</span></span>
            <input type="checkbox" checked={form.status} onChange={event => update('status', event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          </label>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate('/settings/team')} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save member</button>
      </div>
    </form>
  );
}