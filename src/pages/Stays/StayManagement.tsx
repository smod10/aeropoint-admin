import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BedDouble, Building2, Columns, Edit2, Plus, Search, Settings, Trash2, Utensils, Waves, Wifi } from 'lucide-react';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import { addStaySetting, isStaySettingNameTaken, readStaySettings, removeStaySettings, stayUsageCount, updateStaySetting } from '../../utils/stayStorage';
import SlideOver from '../../components/Shared/SlideOver';
import ToggleSwitch from '../../components/Shared/ToggleSwitch';
import type { StaySetting, StaySettingKind } from '../../types/hotel';

type ColumnKey = 'status' | 'name' | 'usedBy';
type SearchField = 'all' | 'name' | 'status';

const tabs: { kind: StaySettingKind; label: string; icon: ReactNode; usedFor: string }[] = [
  { kind: 'stayAmenity', label: 'Stay Amenity', icon: <Waves size={16} />, usedFor: 'Amenity checkboxes on the hotel form' },
  { kind: 'roomType', label: 'Room Type', icon: <BedDouble size={16} />, usedFor: 'Room type when adding rooms to a hotel' },
  { kind: 'roomAmenity', label: 'Room Amenity', icon: <Wifi size={16} />, usedFor: 'Room facilities on the room form' },
  { kind: 'accommodation', label: 'Accommodation', icon: <Building2 size={16} />, usedFor: 'Accommodation type on the hotel form' },
  { kind: 'board', label: 'Board', icon: <Utensils size={16} />, usedFor: 'Board options and prices on each room' },
];

const columnLabels: Record<ColumnKey, string> = { status: 'Status', name: 'Name', usedBy: 'Used by hotels' };

export default function StayManagement() {
  const canManage = canManageTeam(getCurrentActorRole());
  const [kind, setKind] = useState<StaySettingKind>('stayAmenity');
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [field, setField] = useState<SearchField>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visible, setVisible] = useState<Record<ColumnKey, boolean>>({ status: true, name: true, usedBy: false });
  const [editing, setEditing] = useState<StaySetting | 'new'>();
  const [form, setForm] = useState({ name: '', active: true });
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

  const tab = tabs.find(item => item.kind === kind)!;
  // `version` is bumped after every change so the list is re-read from storage.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const records = useMemo(() => readStaySettings(kind), [kind, version]);
  const usage = useMemo(() => new Map(records.map(record => [record.id, stayUsageCount(record)])), [records]);
  const refresh = () => setVersion(current => current + 1);

  const filtered = records.filter(record => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const status = record.active ? 'active' : 'inactive';
    if (field === 'name') return record.name.toLowerCase().includes(query);
    if (field === 'status') return status.includes(query);
    return record.name.toLowerCase().includes(query) || status.includes(query);
  });
  const allSelected = filtered.length > 0 && filtered.every(record => selected.has(record.id));

  const switchTab = (next: StaySettingKind) => {
    setKind(next);
    setSelected(new Set());
    setSearch('');
    setMessage('');
  };

  const openForm = (record: StaySetting | 'new') => {
    setEditing(record);
    setForm(record === 'new' ? { name: '', active: true } : { name: record.name, active: record.active });
    setFormError('');
  };

  const save = () => {
    const name = form.name.trim();
    if (!name) return setFormError('Name is required.');
    if (name.length > 60) return setFormError('Name must be 60 characters or fewer.');
    const currentId = editing && editing !== 'new' ? editing.id : undefined;
    if (isStaySettingNameTaken(kind, name, currentId)) return setFormError(`${tab.label} "${name}" already exists.`);
    if (editing === 'new') addStaySetting(kind, name, form.active);
    else if (currentId) updateStaySetting(currentId, { name, active: form.active });
    setMessage(editing === 'new' ? `Added "${name}".` : `Updated "${name}".`);
    setEditing(undefined);
    refresh();
  };

  const remove = (targets: StaySetting[]) => {
    const label = targets.length === 1 ? `"${targets[0].name}"` : `${targets.length} settings`;
    if (!window.confirm(`Delete ${label}?`)) return;
    const result = removeStaySettings(targets.map(target => target.id));
    setSelected(new Set());
    setMessage([
      result.removed ? `Deleted ${result.removed}.` : '',
      ...result.blocked.map(item => `"${item.name}" is used by ${item.hotels} ${item.hotels === 1 ? 'hotel' : 'hotels'} and was kept. Deactivate it instead.`),
    ].filter(Boolean).join(' '));
    refresh();
  };

  const toggleRow = (id: string) => setSelected(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const iconButton = 'inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50';
  const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500';

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Settings size={22} className="text-gray-700" /><div><h1 className="text-xl font-bold text-gray-900">Settings Management</h1><p className="text-sm text-gray-500">Stay Management · options used by Hotel Management and the hotel form</p></div></div>
        {canManage && <button onClick={() => openForm('new')} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Add New Setting</button>}
      </header>

      <div role="tablist" aria-label="Setting types" className="flex overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-soft">
        {tabs.map(item => <button key={item.kind} role="tab" aria-selected={item.kind === kind} onClick={() => switchTab(item.kind)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium ${item.kind === kind ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{item.icon}{item.label}</button>)}
      </div>

      <section className="rounded-xl border border-gray-100 bg-white shadow-soft" aria-label={`${tab.label} records`}>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-gray-900">Records</h2><p className="text-sm text-gray-500">{records.length} records · {tab.usedFor}</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button type="button" onClick={() => setColumnMenuOpen(open => !open)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Columns size={16} /> View Columns</button>
              {columnMenuOpen && <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">{(Object.keys(columnLabels) as ColumnKey[]).map(key => <label key={key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><input type="checkbox" checked={visible[key]} onChange={() => setVisible(current => ({ ...current, [key]: !current[key] }))} className="rounded border-gray-300" />{columnLabels[key]}</label>)}</div>}
            </div>
            <form onSubmit={event => event.preventDefault()} className="flex">
              <select aria-label="Search column" value={field} onChange={event => setField(event.target.value as SearchField)} className="rounded-l-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"><option value="all">All Columns</option><option value="name">Name</option><option value="status">Status</option></select>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search records..." aria-label="Search records" className="w-44 border-y border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500" />
              <button type="submit" aria-label="Search" className="rounded-r-lg bg-primary-600 px-3 text-white hover:bg-primary-700"><Search size={16} /></button>
            </form>
          </div>
        </div>

        {message && <p role="status" className="mx-5 mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">{message}</p>}
        {canManage && selected.size > 0 && <div className="mx-5 mb-4 flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50 px-4 py-2.5 text-sm text-primary-800"><span>{selected.size} selected</span><button onClick={() => remove(records.filter(record => selected.has(record.id)))} className="inline-flex items-center gap-1.5 font-medium text-red-700 hover:text-red-800"><Trash2 size={15} /> Delete selected</button></div>}

        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-gray-100"><tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map(record => record.id)))} className="rounded border-gray-300" /></th>
              <th className={`${th} w-10`}>#</th>
              {visible.status && <th className={th}>Status</th>}
              {visible.name && <th className={th}>Name</th>}
              {visible.usedBy && <th className={th}>Used by hotels</th>}
              <th className={`${th} border-l border-gray-100 text-right`}>Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((record, index) => <tr key={record.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${record.name}`} checked={selected.has(record.id)} onChange={() => toggleRow(record.id)} className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                {visible.status && <td className="px-4 py-3"><ToggleSwitch checked={record.active} disabled={!canManage} label={`${record.name} active`} onChange={active => { updateStaySetting(record.id, { active }); refresh(); }} /></td>}
                {visible.name && <td className="px-4 py-3 text-gray-800">{record.name}</td>}
                {visible.usedBy && <td className="px-4 py-3 text-gray-600">{usage.get(record.id) ?? 0}</td>}
                <td className="border-l border-gray-100 px-4 py-3"><div className="flex justify-end gap-1.5">{canManage ? <><button onClick={() => openForm(record)} aria-label={`Edit ${record.name}`} title="Edit" className={iconButton}><Edit2 size={15} /></button><button onClick={() => remove([record])} aria-label={`Delete ${record.name}`} title="Delete" className={`${iconButton} hover:text-red-600`}><Trash2 size={15} /></button></> : <span className="text-xs text-gray-400">View only</span>}</div></td>
              </tr>)}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-gray-500">{search ? 'No records match this search.' : `No ${tab.label.toLowerCase()} records yet. Use Add New Setting to create one.`}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <SlideOver isOpen={Boolean(editing)} onClose={() => setEditing(undefined)} title={editing === 'new' ? `Add ${tab.label}` : `Edit ${tab.label}`}>
        <form className="space-y-5" onSubmit={event => { event.preventDefault(); save(); }}>
          <label className="block text-sm font-medium text-gray-700">Name<input autoFocus value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} aria-invalid={Boolean(formError)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-500" /></label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.active} onChange={event => setForm(current => ({ ...current, active: event.target.checked }))} className="rounded border-gray-300" /> Active (available on forms)</label>
          {editing && editing !== 'new' && (usage.get(editing.id) ?? 0) > 0 && <p className="text-xs text-gray-500">Renaming also updates the {usage.get(editing.id)} {usage.get(editing.id) === 1 ? 'hotel' : 'hotels'} that use it.</p>}
          {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
          <div className="flex gap-3"><button type="button" onClick={() => setEditing(undefined)} className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">Save</button></div>
        </form>
      </SlideOver>
    </div>
  );
}
