import { useMemo, useState } from 'react';
// XLSX import removed - CSV only
import { Download, Edit2, Plus, Save, Search, Trash2, Upload, X } from 'lucide-react';
import { readHotelMarkupRules, writeHotelMarkupRules } from '../../utils/amadeusMarkupRules';
import { calculateHotelPrice, pricingBelowMinimumMargin } from '../../utils/hotelMarkupPricing';
import type { HotelPricingQuery } from '../../utils/hotelMarkupPricing';
import type { DefaultHotelPricing, HotelMarkupRule, HotelPriceBreakdown } from '../../types/markupRule';

type RuleDraft = Omit<HotelMarkupRule, 'id' | 'createdAt' | 'updatedAt'>;

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
const labelClass = 'block text-xs font-medium text-gray-600';

const MONEY_FORMAT = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });
function money(amount: number): string {
  return MONEY_FORMAT.format(Math.max(0, amount));
}

const DEFAULT_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Dubai', 'London', 'New York', 'Paris', 'Istanbul'];
const DEFAULT_COUNTRIES = ['Nigeria', 'United Arab Emirates', 'United Kingdom', 'United States', 'France', 'Turkey', 'Ghana', 'Kenya', 'South Africa', 'Egypt'];
const DEFAULT_BOARD_TYPES = ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive', 'Self Catering'];
const DEFAULT_ACCOMMODATION_TYPES = ['Hotel', 'Apartment', 'Villa', 'Resort', 'Guest House', 'Hostel'];

function blankDraft(): RuleDraft {
  return {
    city: null,
    country: null,
    accommodationType: null,
    minStars: null,
    maxStars: null,
    boardType: null,
    discountType: 'percentage',
    discountValue: null,
    markupType: 'percentage',
    markupValueB2C: 0,
    passThroughPercent: 0,
    validFrom: null,
    validTo: null,
    priority: 0,
    isActive: true,
    source: 'MANUAL',
    notes: '',
  };
}

function locationMatches(ruleLocation: { type: string; value: string } | null, searchValue: string | null): boolean {
  if (!ruleLocation) return true;
  if (!searchValue) return false;
  return ruleLocation.value.toLowerCase() === searchValue.toLowerCase();
}

function matchesRule(rule: HotelMarkupRule, query: HotelPricingQuery): boolean {
  const date = query.date ?? new Date().toISOString().split('T')[0];
  if (!rule.isActive) return false;
  if (rule.validFrom && date < rule.validFrom) return false;
  if (rule.validTo && date > rule.validTo) return false;
  if (rule.city && !locationMatches(rule.city, query.city ?? null)) return false;
  if (rule.country && !locationMatches(rule.country, query.country ?? null)) return false;
  if (rule.accommodationType && query.accommodationType && rule.accommodationType.toLowerCase() !== query.accommodationType.toLowerCase()) return false;
  if (rule.minStars != null && (query.stars ?? 0) < rule.minStars) return false;
  if (rule.maxStars != null && (query.stars ?? 999) > rule.maxStars) return false;
  if (rule.boardType && query.boardType && rule.boardType.toLowerCase() !== query.boardType.toLowerCase()) return false;
  return true;
}

export function selectHotelMarkupRule(rules: HotelMarkupRule[], query: HotelPricingQuery): HotelMarkupRule | null {
  return rules
    .filter(rule => matchesRule(rule, query))
    .sort((left, right) => right.priority - left.priority)[0] ?? null;
}

export default function HotelMarkupRules() {
  const [rules, setRules] = useState<HotelMarkupRule[]>([]);
  const [defaults, setDefaults] = useState<DefaultHotelPricing>({
    markupTypeB2C: 'percentage', markupValueB2C: 15, taxType: 'percentage', taxValue: 7.5, minimumMarginPercent: 10,
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RuleDraft>(blankDraft());
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [testPrice, setTestPrice] = useState<string>('');
  const [testCity, setTestCity] = useState('');
  const [testCountry, setTestCountry] = useState('');
  const [testAccommodationType, setTestAccommodationType] = useState('');
  const [testStars, setTestStars] = useState<string>('');
  const [testBoardType, setTestBoardType] = useState('');
  const [testResult, setTestResult] = useState<HotelPriceBreakdown | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rules.filter(rule => {
      const matchesFilter = activeFilter === 'all' || (activeFilter === 'active') === rule.isActive;
      if (!matchesFilter) return false;
      if (!q) return true;
      return (rule.city?.label ?? '').toLowerCase().includes(q) || (rule.country?.label ?? '').toLowerCase().includes(q) || (rule.accommodationType ?? '').toLowerCase().includes(q) || (rule.boardType ?? '').toLowerCase().includes(q) || rule.notes.toLowerCase().includes(q);
    });
  }, [rules, activeFilter, search]);

  const closeEditor = () => { setEditorOpen(false); setEditingId(null); setDraft(blankDraft()); };
  const openEditor = (existing?: HotelMarkupRule) => {
    setEditingId(existing?.id ?? null);
    setDraft(existing ? (({ id: _id, createdAt: _ca, updatedAt: _ua, ...rest }) => rest)(existing) : blankDraft());
    setEditorOpen(true);
  };
  const deleteRule = (id: string) => { if (!window.confirm('Delete this hotel markup rule?')) return; saveRules(rules.filter(r => r.id !== id)); };
  const saveDraft = () => {
    const now = new Date().toISOString();
    const next: HotelMarkupRule = { ...draft, id: editingId ?? `rule-${Date.now().toString(36)}`, createdAt: editingId ? rules.find(r => r.id === editingId)?.createdAt ?? now : now, updatedAt: now } as HotelMarkupRule;
    const updated = editingId ? rules.map(r => (r.id === editingId ? next : r)) : [...rules, next];
    saveRules(updated); closeEditor();
  };
  const runTest = () => {
    const query: HotelPricingQuery = { basePrice: Number(testPrice) || 0, city: testCity || undefined, country: testCountry || undefined, accommodationType: testAccommodationType || undefined, stars: Number(testStars) || undefined, boardType: testBoardType || undefined, date: new Date().toISOString().split('T')[0] };
    setTestResult(calculateHotelPrice(query, rules, defaults));
  };
  const handleDraftChange = (key: keyof RuleDraft, value: unknown) => { setDraft(current => ({ ...current, [key]: value })); };
  const formattedRules = filtered.map(rule => ({ ...rule, cityLabel: rule.city?.label ?? 'Any city', countryLabel: rule.country?.label ?? 'Any country', accommodationLabel: rule.accommodationType ?? 'Any type', starsLabel: rule.minStars && rule.maxStars ? `${rule.minStars}-${rule.maxStars}★` : rule.minStars ? `${rule.minStars}★+` : rule.maxStars ? `Up to ${rule.maxStars}★` : 'Any stars', boardLabel: rule.boardType ?? 'Any board', }));

  const saveRules = (next: HotelMarkupRule[]) => { setRules(next); writeHotelMarkupRules(1, next); };
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hotel Markup Rules</h1>
          <p className="text-sm text-gray-500">Configure markup and discount rules for hotel inventory pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportDeals('csv')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Download size={14} /> Download CSV</button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Upload size={14} /> Import CSV<input aria-label="Upload hotel rules" type="file" accept=".csv,text/csv" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void parseDealFile(file); event.target.value = ''; }} /></label>
          <button onClick={() => openEditor()} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Plus size={16} /> Add Rule</button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]"><Search size={15} className="absolute left-3 top-3 text-gray-400" /><input aria-label="Search hotel rules" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search city, country, type, board..." className={`${inputClass} pl-9`} /></div>
          <select value={activeFilter} onChange={event => setActiveFilter(event.target.value as 'all' | 'active' | 'inactive')} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Stars</th>
                <th className="px-4 py-3">Board</th>
                <th className="px-4 py-3 text-right">Markup</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {formattedRules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-gray-800">{rule.cityLabel}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.countryLabel}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.accommodationLabel}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.starsLabel}</td>
                  <td className="px-4 py-3 text-gray-600">{rule.boardLabel}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">{rule.markupType === 'percentage' ? `${rule.markupValueB2C}%` : money(rule.markupValueB2C)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{rule.discountValue == null ? '—' : rule.discountType === 'percentage' ? `${rule.discountValue}%` : money(rule.discountValue)}</td>
                  <td className="px-4 py-3 text-center">{rule.isActive ? (<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><span className="relative flex h-1.5 w-1.5 rounded-full bg-emerald-600 after:absolute after:inset-0 after:rounded-full after:ring-2 after:ring-emerald-400 after:ring-offset-1" /> Active</span>) : (<span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">Inactive</span>)}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => openEditor(rule)} className="text-gray-400 hover:text-primary-600" title="Edit"><Edit2 size={14} /></button><button onClick={() => deleteRule(rule.id)} className="ml-1 text-gray-400 hover:text-red-600" title="Delete"><Trash2 size={14} /></button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">{search ? 'No rules match this search.' : 'No hotel markup rules yet. Add your first rule.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>


      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Default Hotel Pricing</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2"><label className={labelClass}>Default B2C Markup Type</label><select value={defaults.markupTypeB2C} onChange={event => setDefaults(current => ({ ...current, markupTypeB2C: event.target.value as 'percentage' | 'fixed' }))} className={inputClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div>
          <div className="space-y-2"><label className={labelClass}>Default Markup Value</label><input type="number" min="0" step="0.01" value={defaults.markupValueB2C} onChange={event => setDefaults(current => ({ ...current, markupValueB2C: Number(event.target.value) }))} className={inputClass} /></div>
          <div className="space-y-2"><label className={labelClass}>Tax Type</label><select value={defaults.taxType} onChange={event => setDefaults(current => ({ ...current, taxType: event.target.value as 'percentage' | 'fixed' }))} className={inputClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div>
          <div className="space-y-2"><label className={labelClass}>Tax Value</label><input type="number" min="0" step="0.01" value={defaults.taxValue} onChange={event => setDefaults(current => ({ ...current, taxValue: Number(event.target.value) }))} className={inputClass} /></div>
          <div className="space-y-2"><label className={labelClass}>Minimum Margin %</label><input type="number" min="0" step="0.1" value={defaults.minimumMarginPercent} onChange={event => setDefaults(current => ({ ...current, minimumMarginPercent: Number(event.target.value) }))} className={inputClass} /></div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500"><p>Default pricing applies when no markup rule matches.</p></div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Price Test</h2>
        <p className="text-xs text-gray-500 mb-4">Enter hotel details to preview pricing with current rules.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2"><label className={labelClass}>Base Price (NGN)</label><input type="number" min="0" step="0.01" value={testPrice} onChange={event => setTestPrice(event.target.value)} placeholder="e.g. 50000" className={inputClass} /></div>
          <div className="space-y-2"><label className={labelClass}>City</label><input value={testCity} onFocus={() => setCityPickerOpen(true)} onBlur={() => setTimeout(() => setCityPickerOpen(false), 120)} onChange={event => { setTestCity(event.target.value); setCityPickerOpen(true); }} placeholder="Lagos" className={`mt-1 ${inputClass}`} />{cityPickerOpen && <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{DEFAULT_CITIES.map(city => <button key={city} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setTestCity(city); setCityPickerOpen(false); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50">{city}</button>)}</div>}</div>
          <div className="space-y-2"><label className={labelClass}>Country</label><input value={testCountry} onFocus={() => setCountryPickerOpen(true)} onBlur={() => setTimeout(() => setCountryPickerOpen(false), 120)} onChange={event => { setTestCountry(event.target.value); setCountryPickerOpen(true); }} placeholder="Nigeria" className={`mt-1 ${inputClass}`} />{countryPickerOpen && <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{DEFAULT_COUNTRIES.map(country => <button key={country} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setTestCountry(country); setCountryPickerOpen(false); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50">{country}</button>)}</div>}</div>
          <div className="space-y-2"><label className={labelClass}>Accommodation Type</label><select value={testAccommodationType} onChange={event => setTestAccommodationType(event.target.value)} className={inputClass}><option value="">Any</option>{DEFAULT_ACCOMMODATION_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>
          <div className="space-y-2"><label className={labelClass}>Stars</label><input type="number" min="1" max="5" step="1" value={testStars} onChange={event => setTestStars(event.target.value)} placeholder="3" className={inputClass} /></div>
          <div className="space-y-2"><label className={labelClass}>Board Type</label><select value={testBoardType} onChange={event => setTestBoardType(event.target.value)} className={inputClass}><option value="">Any</option>{DEFAULT_BOARD_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>
          <button onClick={runTest} className="col-start-1 sm:col-auto inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Calculate Price</button>
        </div>
        {testResult && (
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3">Test Result</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <div><p className="text-[10px] uppercase text-gray-500">Base Price</p><p className="mt-1 text-sm font-semibold">{money(testResult.basePrice)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Discount</p><p className="mt-1 text-sm font-semibold">{money(testResult.discount)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Our Cost</p><p className="mt-1 text-sm font-semibold">{money(testResult.ourCost)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Markup</p><p className="mt-1 text-sm font-semibold">{money(testResult.markup)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Tax</p><p className="mt-1 text-sm font-semibold">{money(testResult.tax)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Customer Price</p><p className="mt-1 text-sm font-bold">{money(testResult.customerPrice)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Margin</p><p className="mt-1 text-sm font-semibold">{money(testResult.marginAmount)}</p></div>
              <div><p className="text-[10px] uppercase text-gray-500">Margin %</p><p className="mt-1 text-sm font-semibold">{testResult.marginPercent.toFixed(2)}%</p></div>
              {pricingBelowMinimumMargin(testResult, defaults.minimumMarginPercent) && <p role="alert" className="mt-3 text-xs font-medium text-amber-800 col-span-3">Warning: margin is below the {defaults.minimumMarginPercent}% minimum.</p>}
              {testResult.appliedRule && <p className="mt-2 text-xs text-gray-500">Applied rule: matched by {testResult.appliedRule.city?.label || testResult.appliedRule.country?.label || 'any location'}</p>}
            </div>
          </div>
        )}
      </div>
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="markup-rule-title" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 id="markup-rule-title" className="text-base font-bold text-gray-900">{editingId ? 'Edit hotel markup rule' : 'Add hotel markup rule'}</h2><p className="mt-0.5 text-xs text-gray-500">Overrides the default pricing configuration for matching hotel searches.</p></div><button onClick={closeEditor} aria-label="Close editor" className="rounded p-1.5 text-gray-500 hover:bg-gray-100"><X size={17} /></button></header>
            <div className="overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><label className={labelClass}>City</label><input value={cityQuery} onFocus={() => setCityPickerOpen(true)} onBlur={() => setTimeout(() => setCityPickerOpen(false), 120)} onChange={event => { setCityQuery(event.target.value); setDraft(current => ({ ...current, city: null })); setCityPickerOpen(true); }} placeholder="Any city" className={`mt-1 ${inputClass}`} />{cityPickerOpen && <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{DEFAULT_CITIES.map(city => <button key={city} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setDraft(current => ({ ...current, city: { type: 'city', value: city, label: city } })); setCityQuery(city); setCityPickerOpen(false); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50">{city}</button>)}</div>}</div>
                <div className="space-y-2"><label className={labelClass}>Country</label><input value={countryQuery} onFocus={() => setCountryPickerOpen(true)} onBlur={() => setTimeout(() => setCountryPickerOpen(false), 120)} onChange={event => { setCountryQuery(event.target.value); setDraft(current => ({ ...current, country: null })); setCountryPickerOpen(true); }} placeholder="Any country" className={`mt-1 ${inputClass}`} />{countryPickerOpen && <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{DEFAULT_COUNTRIES.map(country => <button key={country} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setDraft(current => ({ ...current, country: { type: 'country', value: country, label: country } })); setCountryQuery(country); setCountryPickerOpen(false); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50">{country}</button>)}</div>}</div>
              </div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Accommodation Type</label><select value={draft.accommodationType ?? ''} onChange={event => handleDraftChange('accommodationType', event.target.value || null)} className={inputClass}><option value="">Any type</option>{DEFAULT_ACCOMMODATION_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>
              <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><label className={labelClass}>Min Stars</label><input type="number" min="1" max="5" step="1" value={draft.minStars ?? ''} onChange={event => handleDraftChange('minStars', event.target.value === '' ? null : Number(event.target.value))} className={inputClass} /></div><div className="space-y-2"><label className={labelClass}>Max Stars</label><input type="number" min="1" max="5" step="1" value={draft.maxStars ?? ''} onChange={event => handleDraftChange('maxStars', event.target.value === '' ? null : Number(event.target.value))} className={inputClass} /></div></div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Board Type</label><select value={draft.boardType ?? ''} onChange={event => handleDraftChange('boardType', event.target.value || null)} className={inputClass}><option value="">Any board</option>{DEFAULT_BOARD_TYPES.map(type => <option key={type}>{type}</option>)}</select></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="space-y-2"><label className={labelClass}>Discount Type</label><select value={draft.discountType} onChange={event => handleDraftChange('discountType', event.target.value as 'percentage' | 'fixed')} className={inputClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div><div className="space-y-2"><label className={labelClass}>Discount Value</label><input type="number" min="0" step="0.01" value={draft.discountValue ?? ''} onChange={event => handleDraftChange('discountValue', event.target.value === '' ? null : Number(event.target.value))} placeholder="Optional" className={inputClass} /></div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="space-y-2"><label className={labelClass}>Markup Type</label><select value={draft.markupType} onChange={event => handleDraftChange('markupType', event.target.value as 'percentage' | 'fixed')} className={inputClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div><div className="space-y-2"><label className={labelClass}>Markup Value B2C</label><input type="number" min="0" step="0.01" value={draft.markupValueB2C} onChange={event => handleDraftChange('markupValueB2C', Number(event.target.value))} className={inputClass} /></div></div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Discount passed to customer: <span className="font-bold text-gray-800">{draft.passThroughPercent}%</span></label><input type="range" min="0" max="100" value={draft.passThroughPercent} onChange={event => handleDraftChange('passThroughPercent', Number(event.target.value))} className="mt-2 w-full accent-primary-600" /></div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Priority</label><input type="number" value={draft.priority} onChange={event => handleDraftChange('priority', Number(event.target.value))} className={`mt-1 ${inputClass}`} /></div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Valid From</label><input type="date" value={draft.validFrom ?? ''} onChange={event => handleDraftChange('validFrom', event.target.value || null)} className={inputClass} /></div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Valid To</label><input type="date" value={draft.validTo ?? ''} onChange={event => handleDraftChange('validTo', event.target.value || null)} className={inputClass} /></div>
              <div className="mt-4 space-y-2"><label className={labelClass}>Notes</label><textarea rows={2} value={draft.notes} onChange={event => handleDraftChange('notes', event.target.value)} className={inputClass} placeholder="Optional internal notes" /></div>
              <div className="mt-4"><label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.isActive} onChange={event => handleDraftChange('isActive', event.target.checked)} className="rounded border-gray-300" /> Active</label></div>
            </div>
            <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl"><button onClick={closeEditor} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button><button onClick={saveDraft} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> {editingId ? 'Update' : 'Create'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseDealFile(file: File): void {
  console.log('Import file:', file.name);
}

function exportDeals(format: 'csv'): void {
  console.log('Export format:', format);
}
