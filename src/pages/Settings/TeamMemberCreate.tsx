import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Save, UserRound } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { readCreatedTeamMembers, saveCreatedTeamMember } from '../../utils/teamMembers';

const fieldClass = 'mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

type TeamMemberForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'employee';
  department: string;
  password: string;
  passwordConfirmation: string;
};

export default function TeamMemberCreate() {
  const navigate = useNavigate();
  const actorRole = getCurrentActorRole();
  const [form, setForm] = useState<TeamMemberForm>({
    firstName: '', lastName: '', email: '', phone: '', role: 'employee', department: '', password: '', passwordConfirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = <K extends keyof TeamMemberForm>(key: K, value: TeamMemberForm[K]) => setForm(current => ({ ...current, [key]: value }));

  if (!canManageTeam(actorRole)) {
    return <div role="alert" className="rounded-lg border border-red-200 bg-white p-8 text-center text-gray-600">You do not have permission to add team members.</div>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 15) {
      setError('Use a password with at least 15 characters.');
      return;
    }
    if (form.password !== form.passwordConfirmation) {
      setError('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/users', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        department: form.department.trim(),
        password: form.password,
      });
      const payload = response.data?.data ?? response.data ?? {};
      const members = readCreatedTeamMembers();
      const returnedId = Number(payload.id);
      const id = Number.isSafeInteger(returnedId) && returnedId > 0
        ? returnedId
        : Math.max(0, ...members.map(member => member.id), 30) + 1;
      const createdAt = new Date().toISOString();
      saveCreatedTeamMember({
        id,
        uid: String(payload.uid || `AEP-${id}`),
        status: payload.status ?? true,
        banned: false,
        isSuperAdmin: false,
        firstName: String(payload.firstName || form.firstName.trim()),
        lastName: String(payload.lastName || form.lastName.trim()),
        email: String(payload.email || form.email.trim()),
        phone: String(payload.phone || form.phone.trim()),
        role: form.role,
        balance: '0.00',
        verified: Boolean(payload.verified),
        createdAt: String(payload.createdAt || createdAt),
        department: form.department.trim(),
      });
      navigate('/settings/team');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not create the account.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/settings/team" aria-label="Back to Team & Roles" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"><ArrowLeft size={18} /></Link>
          <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Team & Roles / Add New</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Add new team member</h1></div>
        </div>
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"><Save size={16} /> {isSubmitting ? 'Creating…' : 'Add New'}</button>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700"><UserRound size={19} /></span>
          <div><h2 className="text-sm font-semibold text-gray-900">Account details</h2><p className="text-xs text-gray-500">Enter the staff member's profile, access role, and initial password.</p></div>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">First name<input required autoComplete="given-name" value={form.firstName} onChange={event => update('firstName', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Last name<input required autoComplete="family-name" value={form.lastName} onChange={event => update('lastName', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Work email<input required type="email" autoComplete="email" value={form.email} onChange={event => update('email', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Phone<input type="tel" autoComplete="tel" value={form.phone} onChange={event => update('phone', event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Role<select value={form.role} onChange={event => update('role', event.target.value as TeamMemberForm['role'])} className={fieldClass}><option value="employee">Employee</option><option value="admin">Admin</option></select></label>
          <label className="text-sm font-medium text-gray-700">Department<input required value={form.department} onChange={event => update('department', event.target.value)} placeholder="e.g. Operations" className={fieldClass} /></label>
          <label className="text-sm font-medium text-gray-700">Password<div className="relative"><input required minLength={15} type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={event => update('password', event.target.value)} className={`${fieldClass} pr-11`} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(current => !current)} className="absolute right-2 top-2.5 rounded p-1.5 text-gray-500 hover:bg-gray-100">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div><span className="mt-1 block text-xs font-normal text-gray-500">Use at least 15 characters. The account service must hash the password before storing it.</span></label>
          <label className="text-sm font-medium text-gray-700">Confirm password<input required minLength={15} type="password" autoComplete="new-password" value={form.passwordConfirmation} onChange={event => update('passwordConfirmation', event.target.value)} className={fieldClass} /></label>
        </div>
      </section>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate('/settings/team')} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"><Save size={16} /> {isSubmitting ? 'Creating…' : 'Add New'}</button>
      </div>
    </form>
  );
}
