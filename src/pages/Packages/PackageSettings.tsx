import { useMemo, useState } from 'react';
import { CheckCircle2, Flag, Plus, Search, Settings, ShieldCheck, Sparkles, Tag, Trash2, XCircle } from 'lucide-react';
import { canManageTeam, getCurrentActorRole } from '../../utils/accountAccess';
import SlideOver from '../../components/Shared/SlideOver';
import ToggleSwitch from '../../components/Shared/ToggleSwitch';
import { addPackageSetting, isPackageSettingNameTaken, packageSettingTabs, readPackageSettings, removePackageSettings, updatePackageSetting } from '../../utils/packageSettings';
import type { PackageModule, PackageSetting, PackageSettingKind } from '../../utils/packageSettings';

const tabIcons = { tourType: Flag, inclusion: CheckCircle2, exclusion: XCircle, amenity: Sparkles, umrahType: ShieldCheck, service: Settings, duration: Settings, tag: Tag } satisfies Record<PackageSettingKind, typeof Flag>;

export default function PackageSettings({ module }: { module: PackageModule }) {
  const canManage = canManageTeam(getCurrentActorRole());
  const tabs = packageSettingTabs[module];
  const title = module === 'tour' ? 'Tours Settings Management' : 'Umrah Settings Management';
  const [kind, setKind] = useState<PackageSettingKind>(tabs[0].kind);
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<PackageSetting | 'new'>();
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const tab = tabs.find(item => item.kind === kind)!;
  // `version` refreshes this list after storage changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const records = useMemo(() => readPackageSettings(module, kind), [module, kind, version]);
  const filtered = records.filter(record => record.name.toLowerCase().includes(search.trim().toLowerCase()));
  const allSelected = filtered.length > 0 && filtered.every(record => selected.has(record.id));

  const openForm = (record: PackageSetting | 'new') => {
    setEditing(record);
    setName(record === 'new' ? '' : record.name);
    setActive(record === 'new' || record.active);
    setError('');
  };

  const save = () => {
    const cleanName = name.trim();
    if (!cleanName) return setError('Name is required.');
    if (cleanName.length > 60) return setError('Name must be 60 characters or fewer.');
    const currentId = editing && editing !== 'new' ? editing.id : undefined;
    if (isPackageSettingNameTaken(module, kind, cleanName, currentId)) return setError(`"${cleanName}" already exists.`);
    if (editing === 'new') addPackageSetting(module, kind, cleanName, active);
    else if (currentId) updatePackageSetting(module, currentId, { name: cleanName, active });
    setMessage(editing === 'new' ? `Added "${cleanName}".` : `Updated "${cleanName}".`);
    setEditing(undefined);
    setVersion(current => current + 1);
  };

  const remove = (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length === 1 ? 'this setting' : `${ids.length} settings`}?`)) return;
    removePackageSettings(module, ids);
    setSelected(new Set());
    setMessage(`Deleted ${ids.length} ${ids.length === 1 ? 'setting' : 'settings'}.`);
    setVersion(current => current + 1);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Settings size={22} className="text-gray-700" /><div><h1 className="text-xl font-bold text-gray-900">{title}</h1></div></div>
        {canManage && <button type="button" onClick={() => openForm('new')} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Add New Setting</button>}
      </header>

      <div role="tablist" aria-label="Setting types" className="flex overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {tabs.map(item => { const Icon = tabIcons[item.kind]; return <button key={item.kind} type="button" role="tab" aria-selected={item.kind === kind} onClick={() => { setKind(item.kind); setSelected(new Set()); setMessage(''); }} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium ${item.kind === kind ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Icon size={16} />{item.label}</button>; })}
      </div>

      <section className="rounded-lg border border-gray-200 bg-white" aria-label={`${tab.label} records`}>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-bold text-gray-900">Records</h2><p className="text-sm text-gray-500">{records.length} records</p></div>
          <form onSubmit={event => event.preventDefault()} className="flex">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search records..." aria-label="Search records" className="w-56 rounded-l-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500" />
            <button type="submit" aria-label="Search" className="rounded-r-lg bg-primary-600 px-3 text-white hover:bg-primary-700"><Search size={16} /></button>
          </form>
        </div>
        {message && <p role="status" className="mx-5 mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">{message}</p>}
        {canManage && selected.size > 0 && <div className="mx-5 mb-4 flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50 px-4 py-2.5 text-sm text-primary-800"><span>{selected.size} selected</span><button type="button" onClick={() => remove(records.filter(record => selected.has(record.id)).map(record => record.id))} className="inline-flex items-center gap-1.5 font-medium text-red-700"><Trash2 size={15} /> Delete selected</button></div>}
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/60"><tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map(record => record.id)))} className="rounded border-gray-300" /></th>
              <th className="w-12 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">#</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Label</th>
              <th className="border-l border-gray-100 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((record, index) => <tr key={record.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${record.name}`} checked={selected.has(record.id)} onChange={() => setSelected(current => { const next = new Set(current); if (next.has(record.id)) next.delete(record.id); else next.add(record.id); return next; })} className="rounded border-gray-300" /></td>
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                <td className="px-4 py-3"><ToggleSwitch checked={record.active} disabled={!canManage} label={`${record.name} active`} onChange={next => { updatePackageSetting(module, record.id, { active: next }); setVersion(current => current + 1); }} /></td>
                <td className="px-4 py-3 text-gray-800">{record.name}</td>
                <td className="border-l border-gray-100 px-4 py-3"><div className="flex justify-end gap-1.5">{canManage ? <><button type="button" onClick={() => openForm(record)} aria-label={`Edit ${record.name}`} title="Edit" className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"><Settings size={15} /></button><button type="button" onClick={() => remove([record.id])} aria-label={`Delete ${record.name}`} title="Delete" className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></> : <span className="text-xs text-gray-400">View only</span>}</div></td>
              </tr>)}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-gray-500">{search ? 'No records match this search.' : `No ${tab.label.toLowerCase()} records yet.`}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <SlideOver isOpen={Boolean(editing)} onClose={() => setEditing(undefined)} title={`${editing === 'new' ? 'Add' : 'Edit'} ${tab.label}`}>
        <form className="space-y-5" onSubmit={event => { event.preventDefault(); save(); }}>
          <label className="block text-sm font-medium text-gray-700">Label<input autoFocus value={name} onChange={event => setName(event.target.value)} aria-invalid={Boolean(error)} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-500" /></label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} className="rounded border-gray-300" /> Active</label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditing(undefined)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Save</button></div>
        </form>
      </SlideOver>
    </div>
  );
}