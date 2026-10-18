export type PackageModule = 'tour' | 'umrah';
export type PackageSettingKind = 'tourType' | 'inclusion' | 'exclusion' | 'amenity' | 'umrahType' | 'service' | 'duration' | 'tag';

export type PackageSetting = {
  id: string;
  kind: PackageSettingKind;
  name: string;
  active: boolean;
  order: number;
};

export const packageSettingTabs: Record<PackageModule, { kind: PackageSettingKind; label: string }[]> = {
  tour: [
    { kind: 'tourType', label: 'Tour Type' },
    { kind: 'inclusion', label: 'Inclusion' },
    { kind: 'exclusion', label: 'Exclusion' },
    { kind: 'amenity', label: 'Amenity' },
  ],
  umrah: [
    { kind: 'umrahType', label: 'Umrah Type' },
    { kind: 'service', label: 'Services' },
    { kind: 'duration', label: 'Duration' },
    { kind: 'amenity', label: 'Amenity' },
    { kind: 'tag', label: 'Tag' },
  ],
};

const defaults: Record<PackageModule, Partial<Record<PackageSettingKind, string[]>>> = {
  tour: {
    tourType: ['Sightseeing', 'Beach Holidays', 'Wildlife Safaris', 'Family', 'Couples', 'Corporate', 'Educational', 'Adventure', 'Join-In', 'Private'],
    inclusion: ['Parking', 'Air Conditioning', 'WiFi Access', 'Entrance Fees', 'Hotel Pickup and Drop-off', 'Professional Tour Guide', 'Transportation', 'Dinner', 'Lunch', 'Complimentary Breakfast'],
    exclusion: ['Alcoholic Beverages', 'Optional Tours', 'Personal Expenses', 'Tips and Gratuities', 'Travel Insurance', 'Visa Charges', 'Airfare & Airport Taxes'],
    amenity: ['Live Entertainment', 'Photography Allowed', 'Pet Friendly', 'Child Friendly', 'Wheelchair Accessible'],
  },
  umrah: {
    umrahType: ['Economy', 'Premium'],
    service: ['Visa', 'Transportation', 'Flight', 'Hotel'],
    duration: [],
    amenity: [],
    tag: [],
  },
};

const keyFor = (module: PackageModule) => `aeropoint-${module}-settings`;
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function readAll(module: PackageModule): PackageSetting[] {
  const key = keyFor(module);
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null') as PackageSetting[] | null;
    if (stored) return stored;
  } catch {
    // Replace malformed settings with the module defaults.
  }

  const seeded = Object.entries(defaults[module]).flatMap(([kind, names]) =>
    (names ?? []).map((name, index) => ({
      id: `${module}-${kind}-${slug(name)}`,
      kind: kind as PackageSettingKind,
      name,
      active: true,
      order: index + 1,
    })));
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function readPackageSettings(module: PackageModule, kind: PackageSettingKind): PackageSetting[] {
  return readAll(module).filter(setting => setting.kind === kind).sort((left, right) => left.order - right.order);
}

export function readActivePackageSettingNames(module: PackageModule, kind: PackageSettingKind): string[] {
  return readPackageSettings(module, kind).filter(setting => setting.active).sort((left, right) => left.order - right.order).map(setting => setting.name);
}

export function isPackageSettingNameTaken(module: PackageModule, kind: PackageSettingKind, name: string, exceptId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return readAll(module).some(setting => setting.kind === kind && setting.id !== exceptId && setting.name.toLowerCase() === normalized);
}

export function addPackageSetting(module: PackageModule, kind: PackageSettingKind, name: string, active: boolean): void {
  const all = readAll(module);
  const order = Math.max(0, ...all.filter(setting => setting.kind === kind).map(setting => setting.order)) + 1;
  all.push({ id: `${module}-${kind}-${slug(name)}-${Date.now().toString(36)}`, kind, name: name.trim(), active, order });
  localStorage.setItem(keyFor(module), JSON.stringify(all));
}

export function updatePackageSetting(module: PackageModule, id: string, changes: { name?: string; active?: boolean }): void {
  const updated = readAll(module).map(setting => setting.id === id ? {
    ...setting,
    ...(changes.name === undefined ? {} : { name: changes.name.trim() }),
    ...(changes.active === undefined ? {} : { active: changes.active }),
  } : setting);
  localStorage.setItem(keyFor(module), JSON.stringify(updated));
}

export function removePackageSettings(module: PackageModule, ids: string[]): void {
  const removed = new Set(ids);
  localStorage.setItem(keyFor(module), JSON.stringify(readAll(module).filter(setting => !removed.has(setting.id))));
}