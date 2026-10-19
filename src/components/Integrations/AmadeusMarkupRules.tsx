import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Copy, Download, Edit2, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { getAvailableAirlines } from '../../data/airlines';
import { getAvailableAirports } from '../../data/airports';
import { readAirlineMarkupRules, writeAirlineMarkupRules } from '../../utils/amadeusMarkupRules';
import { calculateFlightPrice, pricingBelowMinimumMargin } from '../../utils/flightMarkupPricing';
import type { FlightPricingQuery } from '../../utils/flightMarkupPricing';
import type { AirlineMarkupRule, DefaultFlightPricing, FlightCabin, FlightPriceBreakdown, MarkupRoute, RouteLocation } from '../../types/markupRule';

type RuleDraft = Omit<AirlineMarkupRule, 'id' | 'createdAt' | 'updatedAt'>;
type CSVPreview = { routes: MarkupRoute[]; errors: string[] };
type DealImportPreview = { rules: AirlineMarkupRule[]; errors: string[]; warnings: string[] };
type LocationOption = RouteLocation & { search: string };

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
const labelClass = 'block text-xs font-medium text-gray-600';

function blankDraft(): RuleDraft {
  return {
    airlineCode: null,
    routes: [{ origin: null, destination: null }],
    bidirectional: false,
    cabin: null,
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

function airlineLabel(code: string | null): string {
  if (!code) return 'All airlines';
  const airline = getAvailableAirlines().find(item => item.code === code);
  return airline ? `${airline.name} (${airline.code})` : code;
}

function routesOverlap(left: MarkupRoute[], right: MarkupRoute[], leftBidirectional: boolean, rightBidirectional: boolean): boolean {
  const locationMatches = (a: RouteLocation | null, b: RouteLocation | null) => {
    if (!a || !b) return true;
    if (a.type === b.type && a.value.toLowerCase() === b.value.toLowerCase()) return true;
    const airports = getAvailableAirports();
    const includesAirport = (location: RouteLocation, iata: string, city: string, country: string) => location.type === 'airport'
      ? location.value.toLowerCase() === iata.toLowerCase()
      : location.type === 'city' ? location.value.toLowerCase() === city.toLowerCase() : location.value.toLowerCase() === country.toLowerCase();
    return airports.some(airport => includesAirport(a, airport.iata, airport.city, airport.country) && includesAirport(b, airport.iata, airport.city, airport.country));
  };
  const routeMatches = (a: MarkupRoute, b: MarkupRoute) => locationMatches(a.origin, b.origin) && locationMatches(a.destination, b.destination);
  return left.some(a => right.some(b => routeMatches(a, b)
    || leftBidirectional && routeMatches(a, { origin: b.destination, destination: b.origin })
    || rightBidirectional && routeMatches({ origin: a.destination, destination: a.origin }, b)));
}

function ruleOverlaps(existing: AirlineMarkupRule, draft: RuleDraft): boolean {
  const datesOverlap = (!existing.validTo || !draft.validFrom || existing.validTo >= draft.validFrom)
    && (!draft.validTo || !existing.validFrom || draft.validTo >= existing.validFrom);
  const cabinsOverlap = !existing.cabin || !draft.cabin || existing.cabin === draft.cabin;
  return (!existing.airlineCode || !draft.airlineCode || existing.airlineCode === draft.airlineCode)
    && cabinsOverlap
    && datesOverlap
    && routesOverlap(existing.routes, draft.routes, existing.bidirectional, draft.bidirectional);
}

function locationOptions(): LocationOption[] {
  const airports = getAvailableAirports();
  const airportOptions = airports.map(airport => ({
    type: 'airport' as const,
    value: airport.iata,
    label: `${airport.city} (${airport.iata}) · ${airport.country}`,
    search: `${airport.name} ${airport.iata} ${airport.city} ${airport.country}`.toLowerCase(),
  }));
  const cities = Array.from(new Set(airports.map(airport => airport.city).filter(Boolean))).map(city => ({
    type: 'city' as const,
    value: city,
    label: `${city} · City`,
    search: `${city} city`.toLowerCase(),
  }));
  const countries = Array.from(new Set(airports.map(airport => airport.country).filter(Boolean))).map(country => ({
    type: 'country' as const,
    value: country,
    label: `${country} · Country`,
    search: `${country} country`.toLowerCase(),
  }));
  return [...airportOptions, ...cities, ...countries];
}

const allLocationOptions = locationOptions();

function LocationPicker({ label, value, onChange, onValidityChange }: { label: string; value: RouteLocation | null; onChange: (value: RouteLocation | null) => void; onValidityChange?: (valid: boolean) => void }) {
  const [query, setQuery] = useState(value?.label ?? '');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return allLocationOptions.filter(option => option.search.includes(needle)).slice(0, 8);
  }, [query]);

  return <div className="relative">
    <label className={labelClass}>{label}<input value={query} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onChange={event => { setQuery(event.target.value); onChange(null); onValidityChange?.(!event.target.value.trim()); setOpen(true); }} placeholder="Any" className={`mt-1 ${inputClass}`} /></label>
    {open && query.trim() && <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">{results.length ? results.map(option => <button key={`${option.type}-${option.value}`} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { onChange({ type: option.type, value: option.value, label: option.label }); onValidityChange?.(true); setQuery(option.label); setOpen(false); }} className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><span className="font-medium">{option.label}</span><span className="ml-2 text-gray-400">{option.type}</span></button>) : <p className="px-3 py-2 text-xs text-gray-500">No matching airport, city, or country.</p>}</div>}
  </div>;
}

export default function AmadeusMarkupRules({ moduleId, currency, defaults }: { moduleId: number; currency: string; defaults: DefaultFlightPricing }) {
  const [rules, setRules] = useState(() => readAirlineMarkupRules(moduleId));
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RuleDraft>(blankDraft);
  const [airlineQuery, setAirlineQuery] = useState('');
  const [airlinePickerOpen, setAirlinePickerOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [dealImportPreview, setDealImportPreview] = useState<DealImportPreview | null>(null);
  const [error, setError] = useState('');
  const [overlapWarning, setOverlapWarning] = useState<AirlineMarkupRule[]>([]);
  const [invalidRouteFields, setInvalidRouteFields] = useState<Set<string>>(new Set());
  const [sampleFare, setSampleFare] = useState(500);
  const [testAirlineCode, setTestAirlineCode] = useState('');
  const [testOrigin, setTestOrigin] = useState<RouteLocation | null>(null);
  const [testDestination, setTestDestination] = useState<RouteLocation | null>(null);
  const [testCabin, setTestCabin] = useState<FlightCabin | null>(null);
  const [testFare, setTestFare] = useState('');
  const [testResult, setTestResult] = useState<FlightPriceBreakdown | null>(null);
  const [testError, setTestError] = useState('');

  const persist = (next: AirlineMarkupRule[]) => {
    setRules(next);
    writeAirlineMarkupRules(moduleId, next);
  };
  const filtered = rules.filter(rule => {
    const matchesAirline = !search.trim() || airlineLabel(rule.airlineCode).toLowerCase().includes(search.trim().toLowerCase()) || (rule.airlineCode ?? '').toLowerCase().includes(search.trim().toLowerCase());
    const matchesActive = activeFilter === 'all' || (activeFilter === 'active' ? rule.isActive : !rule.isActive);
    return matchesAirline && matchesActive;
  });
  const allSelected = filtered.length > 0 && filtered.every(rule => selected.has(rule.id));
  const airlineResults = useMemo(() => {
    const needle = airlineQuery.trim().toLowerCase();
    if (!needle) return [];
    return getAvailableAirlines().filter(item => `${item.name} ${item.code} ${item.country}`.toLowerCase().includes(needle)).slice(0, 8);
  }, [airlineQuery]);

  const openNew = () => {
    setEditorOpen(true);
    setEditingId(null);
    setDraft(blankDraft());
    setAirlineQuery('');
    setCsvPreview(null);
    setError('');
    setOverlapWarning([]);
    setInvalidRouteFields(new Set());
  };
  const openEdit = (rule: AirlineMarkupRule) => {
    setEditorOpen(true);
    setEditingId(rule.id);
    setDraft({ ...rule, routes: rule.routes.length ? rule.routes.map(route => ({ ...route })) : [{ origin: null, destination: null }] });
    setAirlineQuery(airlineLabel(rule.airlineCode) === 'All airlines' ? '' : airlineLabel(rule.airlineCode));
    setCsvPreview(null);
    setError('');
    setOverlapWarning([]);
    setInvalidRouteFields(new Set());
  };
  const closeEditor = () => { setEditorOpen(false); setEditingId(null); setError(''); setOverlapWarning([]); };
  const saveRule = (confirmOverlap = false) => {
    if (airlineQuery.trim() && !draft.airlineCode) return setError('Choose an airline from the results or clear the field for all airlines.');
    const hasRoute = draft.routes.some(route => route.origin || route.destination);
    if (!draft.airlineCode && !hasRoute) return setError('Choose an airline or add at least one route.');
    if (invalidRouteFields.size > 0) return setError('Choose each typed route location from the search results, or clear the field.');
    if (draft.discountValue != null && (draft.discountValue < 0 || draft.discountType === 'percentage' && draft.discountValue > 100)) return setError('Airline discount must be non-negative and percentages cannot exceed 100.');
    if (draft.markupValueB2C < 0 || draft.markupType === 'percentage' && draft.markupValueB2C > 100) return setError('B2C markup must be non-negative and percentages cannot exceed 100.');
    if (draft.passThroughPercent < 0 || draft.passThroughPercent > 100) return setError('Discount pass-through must be between 0 and 100%.');
    if (draft.validFrom && draft.validTo && draft.validTo <= draft.validFrom) return setError('Valid to must be after valid from.');

    const conflicts = rules.filter(rule => rule.id !== editingId && ruleOverlaps(rule, draft));
    if (conflicts.length && !confirmOverlap) {
      setOverlapWarning(conflicts);
      setError('This rule overlaps existing rules. Review the matching rules below.');
      return;
    }
    const now = new Date().toISOString();
    const existing = rules.find(rule => rule.id === editingId);
    const nextRule: AirlineMarkupRule = {
      ...draft,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    persist(existing ? rules.map(rule => rule.id === existing.id ? nextRule : rule) : [nextRule, ...rules]);
    setSelected(new Set());
    closeEditor();
  };
  const removeRule = (rule: AirlineMarkupRule) => {
    if (!window.confirm(`Delete the rule for ${airlineLabel(rule.airlineCode)}?`)) return;
    persist(rules.filter(item => item.id !== rule.id));
    setSelected(current => { const next = new Set(current); next.delete(rule.id); return next; });
  };
  const duplicateRule = (rule: AirlineMarkupRule) => {
    const now = new Date().toISOString();
    persist([{ ...rule, id: crypto.randomUUID(), source: 'MANUAL', priority: 0, createdAt: now, updatedAt: now }, ...rules]);
  };
  const updateSelected = (action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete') {
      if (!window.confirm(`Delete ${selected.size} selected rules?`)) return;
      persist(rules.filter(rule => !selected.has(rule.id)));
    } else {
      persist(rules.map(rule => selected.has(rule.id) ? { ...rule, isActive: action === 'activate', updatedAt: new Date().toISOString() } : rule));
    }
    setSelected(new Set());
  };
  const updateRoute = (index: number, field: keyof MarkupRoute, value: RouteLocation | null) => setDraft(current => ({
    ...current,
    routes: current.routes.map((route, routeIndex) => routeIndex === index ? { ...route, [field]: value } : route),
  }));

  const resolveCSVLocation = (raw: string): RouteLocation | null => {
    const needle = raw.trim().toLowerCase();
    if (!needle) return null;
    const airport = getAvailableAirports().find(item => item.iata.toLowerCase() === needle);
    if (airport) return { type: 'airport', value: airport.iata, label: `${airport.city} (${airport.iata}) · ${airport.country}` };
    const city = getAvailableAirports().find(item => item.city.toLowerCase() === needle);
    if (city) return { type: 'city', value: city.city, label: `${city.city} · City` };
    const country = getAvailableAirports().find(item => item.country.toLowerCase() === needle);
    if (country) return { type: 'country', value: country.country, label: `${country.country} · Country` };
    return null;
  };
  const parseCSV = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase(),
      complete: result => {
        const errors: string[] = [];
        const routes: MarkupRoute[] = [];
        result.data.forEach((row, index) => {
          const originText = row.origin?.trim() ?? '';
          const destinationText = row.destination?.trim() ?? '';
          if (!originText && !destinationText) {
            errors.push(`Row ${index + 2}: origin and destination are both blank.`);
            return;
          }
          const origin = resolveCSVLocation(originText);
          const destination = resolveCSVLocation(destinationText);
          if (originText && !origin) errors.push(`Row ${index + 2}: origin "${originText}" was not found.`);
          if (destinationText && !destination) errors.push(`Row ${index + 2}: destination "${destinationText}" was not found.`);
          if ((!originText || origin) && (!destinationText || destination)) routes.push({ origin, destination });
        });
        setCsvPreview({ routes, errors });
      },
      error: parseError => setCsvPreview({ routes: [], errors: [parseError.message] }),
    });
  };

  const parseDealRows = (inputRows: Record<string, unknown>[]) => {
    type ImportGroup = { rule: RuleDraft; key: string; routes: MarkupRoute[]; rowErrors: string[]; rowNumber: number };
    const groups = new Map<string, ImportGroup>();
    const text = (value: unknown) => value == null ? '' : String(value).trim();
    const parseBoolean = (value: unknown, fallback: boolean) => {
      const normalized = text(value).toLowerCase();
      if (!normalized) return fallback;
      if (['true', '1', 'yes', 'active'].includes(normalized)) return true;
      if (['false', '0', 'no', 'inactive'].includes(normalized)) return false;
      return null;
    };
    const parseDate = (value: unknown) => {
      if (!value) return null;
      if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
      const raw = text(value);
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      const parsed = new Date(raw);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    };
    const importedLocation = (raw: string, requestedType: string): RouteLocation | null => {
      if (!raw) return null;
      const normalizedType = (requestedType || 'airport').toLowerCase() as RouteLocation['type'];
      if (!['airport', 'city', 'country'].includes(normalizedType)) return null;
      const needle = raw.toLowerCase();
      const airports = getAvailableAirports();
      if (normalizedType === 'airport') {
        const airport = airports.find(item => item.iata.toLowerCase() === needle);
        return airport ? { type: 'airport', value: airport.iata, label: `${airport.city} (${airport.iata}) · ${airport.country}` } : null;
      }
      if (normalizedType === 'city') {
        const airport = airports.find(item => item.city.toLowerCase() === needle);
        return airport ? { type: 'city', value: airport.city, label: `${airport.city} · City` } : null;
      }
      const airport = airports.find(item => item.country.toLowerCase() === needle);
      return airport ? { type: 'country', value: airport.country, label: `${airport.country} · Country` } : null;
    };

    inputRows.forEach((sourceRow, index) => {
      const row = Object.fromEntries(Object.entries(sourceRow).map(([key, value]) => [key.trim().toLowerCase().replace(/[\s-]+/g, '_'), value]));
      const rowNumber = index + 2;
      const explicitId = text(row.rule_id);
      const key = explicitId || `row-${rowNumber}`;
      let group = groups.get(key);
      const rowErrors: string[] = [];
      if (!group) {
        const airlineText = text(row.airline_code || row.airline);
        const airline = airlineText.toLowerCase() === 'all airlines' || !airlineText
          ? null
          : getAvailableAirlines().find(item => item.code.toLowerCase() === airlineText.toLowerCase() || item.name.toLowerCase() === airlineText.toLowerCase());
        if (airlineText && !airline) rowErrors.push(`Row ${rowNumber}: airline "${airlineText}" was not found by code or name.`);

        const discountType = (text(row.discount_type) || 'percentage').toLowerCase();
        const markupType = (text(row.markup_type) || 'percentage').toLowerCase();
        if (!['percentage', 'fixed'].includes(discountType)) rowErrors.push(`Row ${rowNumber}: discount_type must be percentage or fixed.`);
        if (!['percentage', 'fixed'].includes(markupType)) rowErrors.push(`Row ${rowNumber}: markup_type must be percentage or fixed.`);
        const discountText = text(row.discount_value);
        const markupText = text(row.markup_value_b2c ?? row.markup_value);
        const discountValue = discountText ? Number(discountText) : null;
        const markupValueB2C = markupText ? Number(markupText) : 0;
        const passThroughPercent = text(row.pass_through_percent) ? Number(text(row.pass_through_percent)) : 0;
        const priority = text(row.priority) ? Number(text(row.priority)) : 0;
        if (discountValue != null && (!Number.isFinite(discountValue) || discountValue < 0 || discountType === 'percentage' && discountValue > 100)) rowErrors.push(`Row ${rowNumber}: discount_value must be non-negative and at most 100 for percentage discounts.`);
        if (!Number.isFinite(markupValueB2C) || markupValueB2C < 0 || markupType === 'percentage' && markupValueB2C > 100) rowErrors.push(`Row ${rowNumber}: markup_value_b2c must be non-negative and at most 100 for percentage markups.`);
        if (!Number.isFinite(passThroughPercent) || passThroughPercent < 0 || passThroughPercent > 100) rowErrors.push(`Row ${rowNumber}: pass_through_percent must be between 0 and 100.`);
        if (!Number.isFinite(priority)) rowErrors.push(`Row ${rowNumber}: priority must be a number.`);

        const cabinText = text(row.cabin);
        const cabin = cabinText ? ['Economy', 'Premium Economy', 'Business', 'First'].find(item => item.toLowerCase() === cabinText.toLowerCase()) as FlightCabin | undefined : undefined;
        if (cabinText && !cabin) rowErrors.push(`Row ${rowNumber}: cabin must be Economy, Premium Economy, Business, or First.`);
        const validFrom = parseDate(row.valid_from);
        const validTo = parseDate(row.valid_to);
        if (text(row.valid_from) && !validFrom) rowErrors.push(`Row ${rowNumber}: valid_from is not a valid date.`);
        if (text(row.valid_to) && !validTo) rowErrors.push(`Row ${rowNumber}: valid_to is not a valid date.`);
        if (validFrom && validTo && validTo <= validFrom) rowErrors.push(`Row ${rowNumber}: valid_to must be after valid_from.`);
        const isActive = parseBoolean(row.is_active ?? row.active, true);
        const bidirectional = parseBoolean(row.bidirectional, false);
        if (isActive == null || bidirectional == null) rowErrors.push(`Row ${rowNumber}: is_active and bidirectional must be true/false.`);

        group = {
          key,
          rowNumber,
          rowErrors: [],
          routes: [],
          rule: {
            airlineCode: airline?.code ?? null,
            routes: [],
            bidirectional: bidirectional ?? false,
            cabin: cabin ?? null,
            discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
            discountValue: Number.isFinite(discountValue) ? discountValue : null,
            markupType: markupType === 'fixed' ? 'fixed' : 'percentage',
            markupValueB2C: Number.isFinite(markupValueB2C) ? markupValueB2C : 0,
            passThroughPercent: Number.isFinite(passThroughPercent) ? passThroughPercent : 0,
            validFrom,
            validTo,
            priority: Number.isFinite(priority) ? priority : 0,
            isActive: isActive ?? true,
            source: 'MANUAL',
            notes: text(row.notes),
          },
        };
        groups.set(key, group);
      }

      const originText = text(row.origin);
      const destinationText = text(row.destination);
      const origin = importedLocation(originText, text(row.origin_type));
      const destination = importedLocation(destinationText, text(row.destination_type));
      if (originText && !origin) rowErrors.push(`Row ${rowNumber}: origin "${originText}" was not found for its location type.`);
      if (destinationText && !destination) rowErrors.push(`Row ${rowNumber}: destination "${destinationText}" was not found for its location type.`);
      if (!group.rule.airlineCode && !origin && !destination) rowErrors.push(`Row ${rowNumber}: provide an airline or at least one route location.`);
      if (origin || destination || group.routes.length === 0) group.routes.push({ origin, destination });
      if (rowErrors.length) group.rowErrors.push(...rowErrors);
    });

    const now = new Date().toISOString();
    const errors = Array.from(groups.values()).flatMap(group => group.rowErrors);
    const validRules = Array.from(groups.values()).filter(group => group.rowErrors.length === 0).map(group => ({
      ...group.rule,
      routes: group.routes,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));
    const warnings = validRules.flatMap(imported => rules.filter(existing => ruleOverlaps(existing, imported)).map(existing => `Imported ${airlineLabel(imported.airlineCode)} route overlaps rule ${airlineLabel(existing.airlineCode)} (${existing.id}).`));
    setDealImportPreview({ rules: validRules, errors, warnings });
  };

  const parseDealFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: result => parseDealRows(result.data),
        error: parseError => setDealImportPreview({ rules: [], errors: [parseError.message], warnings: [] }),
      });
      return;
    }
    if (extension === 'xlsx' || extension === 'xls') {
      try {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
          setDealImportPreview({ rules: [], errors: ['The workbook has no sheets.'], warnings: [] });
          return;
        }
        parseDealRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' }));
      } catch (parseError) {
        setDealImportPreview({ rules: [], errors: [parseError instanceof Error ? parseError.message : 'Could not read the workbook.'], warnings: [] });
      }
      return;
    }
    setDealImportPreview({ rules: [], errors: ['Choose a .csv, .xlsx, or .xls file.'], warnings: [] });
  };

  const exportDeals = (format: 'csv' | 'xlsx') => {
    const fields = ['rule_id', 'airline_code', 'origin', 'origin_type', 'destination', 'destination_type', 'bidirectional', 'cabin', 'discount_type', 'discount_value', 'markup_type', 'markup_value_b2c', 'pass_through_percent', 'valid_from', 'valid_to', 'priority', 'is_active', 'source', 'notes', 'route_order'];
    const rows = rules.flatMap(rule => (rule.routes.length ? rule.routes : [{ origin: null, destination: null }]).map((route, routeIndex) => ({
      rule_id: rule.id,
      airline_code: rule.airlineCode ?? '',
      origin: route.origin?.value ?? '',
      origin_type: route.origin?.type ?? 'airport',
      destination: route.destination?.value ?? '',
      destination_type: route.destination?.type ?? 'airport',
      bidirectional: rule.bidirectional,
      cabin: rule.cabin ?? '',
      discount_type: rule.discountType,
      discount_value: rule.discountValue ?? '',
      markup_type: rule.markupType,
      markup_value_b2c: rule.markupValueB2C,
      pass_through_percent: rule.passThroughPercent,
      valid_from: rule.validFrom ?? '',
      valid_to: rule.validTo ?? '',
      priority: rule.priority,
      is_active: rule.isActive,
      source: rule.source,
      notes: rule.notes,
      route_order: routeIndex + 1,
    })));
    const filename = `airline-deals-${moduleId}`;
    if (format === 'csv') {
      const csv = Papa.unparse({ fields, data: rows.map(row => fields.map(field => row[field as keyof typeof row])) });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      return;
    }
    const worksheet = rows.length ? XLSX.utils.json_to_sheet(rows, { header: fields }) : XLSX.utils.aoa_to_sheet([fields]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Airline deals');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const previewRule: AirlineMarkupRule = { ...draft, id: editingId ?? 'draft-preview', createdAt: '', updatedAt: '' };
  const previewRoute = draft.routes[0];
  const previewQuery: FlightPricingQuery = { airlineCode: draft.airlineCode, origin: previewRoute?.origin ?? null, destination: previewRoute?.destination ?? null, cabin: draft.cabin, fare: sampleFare };
  const preview = calculateFlightPrice(previewQuery, rules, defaults, previewRule);
  const money = (amount: number) => {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); }
    catch { return `${currency} ${amount.toFixed(2)}`; }
  };
  const runSearchTest = () => {
    const fare = Number(testFare);
    if (!testFare.trim() || !Number.isFinite(fare) || fare < 0) return setTestError('Enter a valid non-negative fare.');
    if (testAirlineCode && !getAvailableAirlines().some(airline => airline.code.toLowerCase() === testAirlineCode.trim().toLowerCase())) return setTestError('Choose a valid airline IATA code.');
    const query: FlightPricingQuery = { airlineCode: testAirlineCode.trim().toUpperCase() || null, origin: testOrigin, destination: testDestination, cabin: testCabin, fare };
    setTestResult(calculateFlightPrice(query, rules, defaults));
    setTestError('');
  };

  return <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-sm font-bold text-gray-800">Airline deals and special markups</h3><p className="mt-1 text-xs text-gray-500">Most specific active rule wins: airline + exact route, airline + region, airline only, then default markup. Higher priority wins ties.</p></div>
      <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700"><Plus size={14} /> Add rule</button>
    </div>
    <div className="p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1"><Search size={15} className="absolute left-3 top-2.5 text-gray-400" /><input aria-label="Search airline rules" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search airline..." className={`${inputClass} pl-9`} /></div>
        <select aria-label="Filter rules by status" value={activeFilter} onChange={event => setActiveFilter(event.target.value as typeof activeFilter)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Upload size={14} /> Import CSV/Excel<input aria-label="Upload airline deals" type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) void parseDealFile(file); event.target.value = ''; }} /></label>
        <button onClick={() => exportDeals('csv')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Download size={14} /> Download CSV</button>
        <button onClick={() => exportDeals('xlsx')} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Download size={14} /> Download Excel</button>
      </div>
      {dealImportPreview && <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold text-gray-800">Import preview: {dealImportPreview.rules.length} valid deal{dealImportPreview.rules.length === 1 ? '' : 's'}, {dealImportPreview.errors.length} error{dealImportPreview.errors.length === 1 ? '' : 's'}</p><p className="mt-0.5 text-gray-500">Repeated rule_id rows are grouped into route lists. Imported deals use source MANUAL.</p></div><div className="flex gap-2"><button onClick={() => { if (dealImportPreview.rules.length) persist([...dealImportPreview.rules, ...rules]); setDealImportPreview(null); }} disabled={!dealImportPreview.rules.length} className="rounded bg-primary-600 px-3 py-1.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-50">Import valid deals</button><button onClick={() => setDealImportPreview(null)} className="rounded border border-gray-200 bg-white px-3 py-1.5 text-gray-600">Dismiss</button></div></div>
        {dealImportPreview.rules.slice(0, 4).map(rule => <p key={rule.id} className="text-gray-600">{airlineLabel(rule.airlineCode)} · {rule.routes.length} route{rule.routes.length === 1 ? '' : 's'} · {rule.markupValueB2C}{rule.markupType === 'percentage' ? '%' : ` ${currency}`}</p>)}
        {dealImportPreview.warnings.map((warning, index) => <p key={`warning-${index}`} className="text-amber-800">Warning: {warning}</p>)}
        {dealImportPreview.errors.map((importError, index) => <p key={`error-${index}`} role="alert" className="text-red-700">{importError}</p>)}
      </div>}
      {selected.size > 0 && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-xs text-primary-800"><span>{selected.size} selected</span><div className="flex gap-3"><button onClick={() => updateSelected('activate')} className="font-medium">Activate</button><button onClick={() => updateSelected('deactivate')} className="font-medium">Deactivate</button><button onClick={() => updateSelected('delete')} className="font-medium text-red-700">Delete</button></div></div>}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full min-w-[760px] table-fixed text-left text-xs">
          <colgroup><col style={{ width: '3%' }} /><col style={{ width: '14%' }} /><col style={{ width: '24%' }} /><col style={{ width: '8%' }} /><col style={{ width: '10%' }} /><col style={{ width: '9%' }} /><col style={{ width: '13%' }} /><col style={{ width: '7%' }} /><col style={{ width: '5%' }} /><col style={{ width: '7%' }} /></colgroup>
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500"><tr><th className="px-1.5 py-3"><input type="checkbox" aria-label="Select all rules" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(filtered.map(rule => rule.id)))} /></th><th className="px-2 py-3">Airline</th><th className="px-2 py-3">Routes</th><th className="px-2 py-3">Cabin</th><th className="px-2 py-3">Airline discount</th><th className="px-2 py-3">Markup B2C</th><th className="px-2 py-3">Valid dates</th><th className="px-2 py-3">Source</th><th className="px-1 py-3 text-center">Active</th><th className="px-1 py-3 text-center">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{filtered.map(rule => <tr key={rule.id} className="hover:bg-gray-50/70">
            <td className="px-1.5 py-3"><input type="checkbox" aria-label={`Select ${airlineLabel(rule.airlineCode)} rule`} checked={selected.has(rule.id)} onChange={() => setSelected(current => { const next = new Set(current); if (next.has(rule.id)) next.delete(rule.id); else next.add(rule.id); return next; })} /></td>
            <td className="break-words px-2 py-3 font-medium text-gray-800">{airlineLabel(rule.airlineCode)}</td>
            <td className="px-2 py-3 text-gray-600"><div className="space-y-1">{rule.routes.length && rule.routes.some(route => route.origin || route.destination) ? rule.routes.filter(route => route.origin || route.destination).map((route, index) => <div key={index} className="break-words">{route.origin?.label ?? 'Any'} → {route.destination?.label ?? 'Any'}{rule.bidirectional && <span className="block text-[10px] text-gray-400">Both directions</span>}</div>) : <span>Any route</span>}</div></td>
            <td className="break-words px-2 py-3 text-gray-600">{rule.cabin ?? 'Any'}</td>
            <td className="break-words px-2 py-3 text-gray-600">{rule.discountValue == null ? 'API pending' : `${rule.discountValue}${rule.discountType === 'percentage' ? '%' : ` ${currency}`}`}</td>
            <td className="break-words px-2 py-3 text-gray-600">{rule.markupValueB2C}{rule.markupType === 'percentage' ? '%' : ` ${currency}`}</td>
            <td className="px-2 py-3 text-gray-600"><div className="space-y-0.5">{rule.validFrom && <span className="block">From {rule.validFrom}</span>}{rule.validTo && <span className="block">To {rule.validTo}</span>}{!rule.validFrom && !rule.validTo && <span>Any date</span>}</div></td>
            <td className="px-2 py-3"><span className={`rounded px-1.5 py-1 text-[10px] font-semibold ${rule.source === 'API' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{rule.source}</span></td>
            <td className="px-1 py-3 text-center"><button type="button" role="switch" aria-checked={rule.isActive} aria-label={`${rule.isActive ? 'Deactivate' : 'Activate'} ${airlineLabel(rule.airlineCode)}`} onClick={() => persist(rules.map(item => item.id === rule.id ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() } : item))} className={`relative inline-flex h-5 w-9 items-center rounded-full ${rule.isActive ? 'bg-primary-600' : 'bg-gray-300'}`}><span className={`h-3.5 w-3.5 rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-1'}`} /></button></td>
            <td className="px-1 py-3"><div className="flex items-center justify-center gap-0.5"><button onClick={() => openEdit(rule)} title="Edit" aria-label="Edit rule" className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50"><Edit2 size={12} /></button><button onClick={() => duplicateRule(rule)} title="Duplicate" aria-label="Duplicate rule" className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50"><Copy size={12} /></button><button onClick={() => removeRule(rule)} title="Delete" aria-label="Delete rule" className="rounded border border-gray-200 p-1 text-gray-500 hover:text-red-600"><Trash2 size={12} /></button></div></td>
          </tr>)}
          {!filtered.length && <tr><td colSpan={10} className="px-5 py-10 text-center"><p className="text-sm text-gray-600">{rules.length ? 'No rules match these filters.' : 'No airline deals or special markups yet.'}</p>{!rules.length && <button onClick={openNew} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700"><Plus size={13} /> Add rule</button>}</td></tr>}</tbody>
        </table>
      </div>
    </div>

    <section className="border-t border-gray-100 p-5">
      <div className="mb-3"><h3 className="text-sm font-semibold text-gray-800">Test a search</h3><p className="mt-1 text-xs text-gray-500">Check rule selection and final B2C price for a sample search.</p></div>
      <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className={labelClass}>Airline IATA code<input list={`amadeus-test-airlines-${moduleId}`} value={testAirlineCode} onChange={event => setTestAirlineCode(event.target.value.toUpperCase())} placeholder="Any" className={`mt-1 ${inputClass}`} /><datalist id={`amadeus-test-airlines-${moduleId}`}>{getAvailableAirlines().map(airline => <option key={airline.code} value={airline.code}>{airline.name}</option>)}</datalist></label>
        <LocationPicker key={`test-origin-${testOrigin?.label ?? 'blank'}`} label="From" value={testOrigin} onChange={setTestOrigin} />
        <LocationPicker key={`test-destination-${testDestination?.label ?? 'blank'}`} label="To" value={testDestination} onChange={setTestDestination} />
        <label className={labelClass}>Cabin<select value={testCabin ?? ''} onChange={event => setTestCabin((event.target.value || null) as FlightCabin | null)} className={`mt-1 ${inputClass}`}><option value="">Any</option>{['Economy', 'Premium Economy', 'Business', 'First'].map(cabin => <option key={cabin}>{cabin}</option>)}</select></label>
        <label className={labelClass}>Published fare<input type="number" min="0" step="0.01" value={testFare} onChange={event => setTestFare(event.target.value)} className={`mt-1 ${inputClass}`} /></label>
        <button onClick={runSearchTest} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Test search</button>
      </div>
      {testError && <p role="alert" className="mt-3 text-xs text-red-700">{testError}</p>}
      {testResult && <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4"><p className="text-xs text-gray-600">Applied rule: <strong className="text-gray-800">{testResult.appliedRule ? `${airlineLabel(testResult.appliedRule.airlineCode)} · ${testResult.appliedRule.cabin ?? 'Any cabin'} · priority ${testResult.appliedRule.priority}` : 'Default markup'}</strong></p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><p className="text-[10px] uppercase text-gray-500">Our cost</p><p className="mt-1 text-sm font-semibold">{money(testResult.ourCost)}</p></div><div><p className="text-[10px] uppercase text-gray-500">Customer price</p><p className="mt-1 text-sm font-semibold">{money(testResult.customerPrice)}</p></div><div><p className="text-[10px] uppercase text-gray-500">Our margin</p><p className="mt-1 text-sm font-semibold">{money(testResult.marginAmount)}</p></div><div><p className="text-[10px] uppercase text-gray-500">Margin %</p><p className="mt-1 text-sm font-semibold">{testResult.marginPercent.toFixed(2)}%</p></div></div>{pricingBelowMinimumMargin(testResult, defaults.minimumMarginPercent) && <p role="alert" className="mt-3 text-xs font-medium text-amber-800">Warning: margin is below the {defaults.minimumMarginPercent}% minimum.</p>}</div>}
    </section>

    {editorOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeEditor(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="markup-rule-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 id="markup-rule-title" className="text-base font-bold text-gray-900">{editingId ? 'Edit airline markup rule' : 'Add airline markup rule'}</h2><p className="mt-0.5 text-xs text-gray-500">Overrides the default pricing configuration for matching searches.</p></div><button onClick={closeEditor} aria-label="Close editor" className="rounded p-1.5 text-gray-500 hover:bg-gray-100"><X size={17} /></button></header>
        <div className="overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <label className={labelClass}>Airline<input value={airlineQuery} onFocus={() => setAirlinePickerOpen(true)} onBlur={() => window.setTimeout(() => setAirlinePickerOpen(false), 120)} onChange={event => { setAirlineQuery(event.target.value); setDraft(current => ({ ...current, airlineCode: null })); setAirlinePickerOpen(true); }} placeholder="All airlines" className={`mt-1 ${inputClass}`} /></label>
              {airlinePickerOpen && <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"><button type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setDraft(current => ({ ...current, airlineCode: null })); setAirlineQuery(''); setAirlinePickerOpen(false); }} className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50">All airlines</button>{airlineResults.map(airline => <button key={airline.code} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { setDraft(current => ({ ...current, airlineCode: airline.code })); setAirlineQuery(`${airline.name} (${airline.code})`); setAirlinePickerOpen(false); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-gray-50"><span className="font-medium text-gray-800">{airline.name} ({airline.code})</span><span className="ml-2 text-gray-400">{airline.country}</span></button>)}</div>}
            </div>
            <label className={labelClass}>Cabin<select value={draft.cabin ?? ''} onChange={event => setDraft(current => ({ ...current, cabin: (event.target.value || null) as FlightCabin | null }))} className={`mt-1 ${inputClass}`}><option value="">Any cabin</option>{['Economy', 'Premium Economy', 'Business', 'First'].map(cabin => <option key={cabin}>{cabin}</option>)}</select></label>
          </div>

          <fieldset className="mt-4 space-y-3"><legend className="text-xs font-semibold text-gray-700">Routes <span className="font-normal text-gray-400">(blank means any)</span></legend>{draft.routes.map((route, index) => <div key={index} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <LocationPicker key={`${index}-origin-${route.origin?.value ?? ''}`} label="From" value={route.origin} onChange={value => updateRoute(index, 'origin', value)} onValidityChange={valid => setInvalidRouteFields(current => { const next = new Set(current); const key = `${index}-origin`; if (valid) next.delete(key); else next.add(key); return next; })} />
            <LocationPicker key={`${index}-destination-${route.destination?.value ?? ''}`} label="To" value={route.destination} onChange={value => updateRoute(index, 'destination', value)} onValidityChange={valid => setInvalidRouteFields(current => { const next = new Set(current); const key = `${index}-destination`; if (valid) next.delete(key); else next.add(key); return next; })} />
            <button type="button" onClick={() => { setDraft(current => ({ ...current, routes: current.routes.filter((_, routeIndex) => routeIndex !== index) })); setInvalidRouteFields(new Set()); }} aria-label="Remove route" disabled={draft.routes.length === 1} className="mb-0.5 rounded border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><X size={15} /></button>
          </div>)}<button type="button" onClick={() => { setDraft(current => ({ ...current, routes: [...current.routes, { origin: null, destination: null }] })); setInvalidRouteFields(new Set()); }} className="text-xs font-medium text-primary-700">+ Add route</button>
            <label className="flex items-center gap-2 text-xs text-gray-700"><input type="checkbox" checked={draft.bidirectional} onChange={event => setDraft(current => ({ ...current, bidirectional: event.target.checked }))} /> Apply in both directions</label>
          </fieldset>

          <div className="mt-4 grid gap-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-2">
            <div className="space-y-2"><h3 className="text-xs font-semibold text-gray-700">Airline discount</h3>{draft.source === 'API' && <p className="text-[11px] text-blue-700">API-sourced discount is read-only.</p>}<div className="grid grid-cols-[1fr_1fr] gap-2"><select value={draft.discountType} disabled={draft.source === 'API'} onChange={event => setDraft(current => ({ ...current, discountType: event.target.value as RuleDraft['discountType'] }))} className={inputClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select><input type="number" min="0" step="0.01" value={draft.discountValue ?? ''} disabled={draft.source === 'API'} onChange={event => setDraft(current => ({ ...current, discountValue: event.target.value === '' ? null : Number(event.target.value) }))} placeholder="Optional" className={inputClass} /></div></div>
            <div className="space-y-2"><h3 className="text-xs font-semibold text-gray-700">B2C markup</h3><div className="grid grid-cols-[1fr_1fr] gap-2"><select value={draft.markupType} onChange={event => setDraft(current => ({ ...current, markupType: event.target.value as RuleDraft['markupType'] }))} className={inputClass}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select><input type="number" min="0" step="0.01" value={draft.markupValueB2C} onChange={event => setDraft(current => ({ ...current, markupValueB2C: Number(event.target.value) }))} className={inputClass} /></div></div>
            <label className={labelClass}>Discount passed to customer: <span className="font-bold text-gray-800">{draft.passThroughPercent}%</span><input type="range" min="0" max="100" value={draft.passThroughPercent} onChange={event => setDraft(current => ({ ...current, passThroughPercent: Number(event.target.value) }))} className="mt-2 w-full accent-primary-600" /></label>
            <label className={labelClass}>Priority<input type="number" value={draft.priority} onChange={event => setDraft(current => ({ ...current, priority: Number(event.target.value) }))} className={`mt-1 ${inputClass}`} /></label>
            <label className={labelClass}>Valid from<input type="date" value={draft.validFrom ?? ''} onChange={event => setDraft(current => ({ ...current, validFrom: event.target.value || null }))} className={`mt-1 ${inputClass}`} /></label>
            <label className={labelClass}>Valid to<input type="date" value={draft.validTo ?? ''} onChange={event => setDraft(current => ({ ...current, validTo: event.target.value || null }))} className={`mt-1 ${inputClass}`} /></label>
            <label className="flex items-center gap-2 text-xs text-gray-700"><input type="checkbox" checked={draft.isActive} onChange={event => setDraft(current => ({ ...current, isActive: event.target.checked }))} /> Active</label>
            <label className={`${labelClass} sm:col-span-2`}>Notes (internal)<textarea rows={2} value={draft.notes} onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))} className={`mt-1 ${inputClass}`} /></label>
          </div>

          <section className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-xs font-semibold text-gray-800">Live price preview</h3><p className="mt-1 text-[11px] text-gray-500">Uses this rule, the default tax, and the configured minimum margin.</p></div><label className={labelClass}>Sample published fare<input type="number" min="0" step="0.01" value={sampleFare} onChange={event => setSampleFare(Math.max(0, Number(event.target.value)))} className={`mt-1 ${inputClass}`} /></label></div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><p className="text-[10px] uppercase text-gray-500">Our cost</p><p className="mt-1 text-sm font-semibold text-gray-800">{money(preview.ourCost)}</p></div><div><p className="text-[10px] uppercase text-gray-500">Customer price</p><p className="mt-1 text-sm font-semibold text-gray-800">{money(preview.customerPrice)}</p></div><div><p className="text-[10px] uppercase text-gray-500">Our margin</p><p className="mt-1 text-sm font-semibold text-gray-800">{money(preview.marginAmount)}</p></div><div><p className="text-[10px] uppercase text-gray-500">Margin %</p><p className="mt-1 text-sm font-semibold text-gray-800">{preview.marginPercent.toFixed(2)}%</p></div></div>
            {pricingBelowMinimumMargin(preview, defaults.minimumMarginPercent) && <p role="alert" className="mt-3 text-xs font-medium text-amber-800">Warning: margin is below the {defaults.minimumMarginPercent}% minimum.</p>}
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-xs font-semibold text-gray-700">Bulk add routes</h3><p className="mt-1 text-[11px] text-gray-500">CSV columns: origin,destination. Use airport codes, city names, or country names.</p></div><label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"><Upload size={13} /> Upload CSV<input type="file" accept=".csv,text/csv" className="sr-only" onChange={event => { const file = event.target.files?.[0]; if (file) parseCSV(file); event.target.value = ''; }} /></label></div>
            {csvPreview && <div className="mt-3 space-y-2 border-t border-gray-100 pt-3"><p className="text-xs text-gray-700">Preview: {csvPreview.routes.length} valid route{csvPreview.routes.length === 1 ? '' : 's'}{csvPreview.errors.length ? ` · ${csvPreview.errors.length} error${csvPreview.errors.length === 1 ? '' : 's'}` : ''}</p>{csvPreview.routes.slice(0, 5).map((route, index) => <p key={index} className="text-[11px] text-gray-500">{route.origin?.label ?? 'Any'} → {route.destination?.label ?? 'Any'}</p>)}{csvPreview.errors.map((item, index) => <p key={index} role="alert" className="text-[11px] text-red-700">{item}</p>)}{csvPreview.routes.length > 0 && <button type="button" onClick={() => { setDraft(current => ({ ...current, routes: [...current.routes.filter(route => route.origin || route.destination), ...csvPreview.routes] })); setCsvPreview(null); }} className="text-xs font-semibold text-primary-700">Add valid routes to rule</button>}</div>}
          </section>
          {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
          {overlapWarning.length > 0 && <div role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><p className="font-semibold">Matching rules already exist:</p>{overlapWarning.map(rule => <p key={rule.id} className="mt-1">{airlineLabel(rule.airlineCode)} · {rule.routes.map(route => `${route.origin?.label ?? 'Any'} → ${route.destination?.label ?? 'Any'}`).join('; ')} · {rule.cabin ?? 'Any cabin'} · priority {rule.priority}</p>)}</div>}
        </div>
        <footer className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3"><button onClick={closeEditor} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>{overlapWarning.length > 0 && <button onClick={() => saveRule(true)} className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100">Save anyway</button>}<button onClick={() => saveRule()} className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700">Save rule</button></footer>
      </div>
    </div>}
  </section>;
}