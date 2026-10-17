import type { StaySetting, StaySettingKind } from '../types/hotel';
import { readHotelListings, writeHotelListings } from './hotelStorage';

const KEY = 'aeropoint-stay-settings';
const SEED_KEY = 'aeropoint-stay-settings-seeded';

// Defaults are listed in creation order; Stay Management shows the newest first.
const defaults: Record<StaySettingKind, string[]> = {
  stayAmenity: ['Free WiFi', 'Swimming Pool', 'Parking', 'Restaurant', 'Gym/Fitness Center', 'Spa', '24-Hour Front Desk', 'Airport Shuttle', 'Bar/Lounge', 'Conference Rooms'],
  roomType: ['Single Room', 'Double Room', 'Twin Room', 'Triple Room', 'Family Room', 'Suite', 'Deluxe Room', 'Executive Room', 'King Room', 'Queen Room'],
  roomAmenity: ['Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Safe', 'Private Bathroom', 'Balcony', 'Coffee/Tea Maker', 'Hairdryer', 'Work Desk', 'Iron and Ironing Board'],
  accommodation: ['Hotel', 'Apartment', 'Villa', 'Resort', 'Guest House', 'Hostel', 'Chalet', 'Cottage', 'Bungalow', 'Holiday Home'],
  board: ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive', 'Self Catering'],
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const seedRecords: StaySetting[] = (Object.keys(defaults) as StaySettingKind[]).flatMap(kind =>
  defaults[kind].map((name, index) => ({ id: `setting-${kind}-${slug(name)}`, kind, name, active: true, order: index + 1 })));

function persist(settings: StaySetting[]) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

function readAll(): StaySetting[] {
  let stored: StaySetting[];
  try {
    stored = JSON.parse(localStorage.getItem(KEY) || '[]') as StaySetting[];
  } catch {
    stored = [];
  }
  if (localStorage.getItem(SEED_KEY) === 'true') return stored;
  const ids = new Set(stored.map(setting => setting.id));
  const all = [...stored, ...seedRecords.filter(setting => !ids.has(setting.id))];
  persist(all);
  localStorage.setItem(SEED_KEY, 'true');
  return all;
}

// Newest first, matching the Stay Management lists.
export function readStaySettings(kind: StaySettingKind): StaySetting[] {
  return readAll().filter(setting => setting.kind === kind).sort((left, right) => right.order - left.order);
}

// Names offered by forms: active settings in creation order.
export function readActiveStayNames(kind: StaySettingKind): string[] {
  return readStaySettings(kind).filter(setting => setting.active).sort((left, right) => left.order - right.order).map(setting => setting.name);
}

export function readAllStayNames(kind: StaySettingKind): string[] {
  return readStaySettings(kind).sort((left, right) => left.order - right.order).map(setting => setting.name);
}

function usageOf(kind: StaySettingKind, name: string) {
  const matches = (value: string) => value === name;
  return readHotelListings().filter(hotel => {
    if (kind === 'accommodation') return matches(hotel.category);
    if (kind === 'stayAmenity') return hotel.amenities.some(matches);
    if (kind === 'roomType') return hotel.rooms.some(room => matches(room.roomType));
    if (kind === 'roomAmenity') return hotel.rooms.some(room => room.facilities.some(matches));
    return hotel.rooms.some(room => room.options.some(option => matches(option.board)));
  }).length;
}

export function stayUsageCount(setting: StaySetting): number {
  return usageOf(setting.kind, setting.name);
}

export function isStaySettingNameTaken(kind: StaySettingKind, name: string, exceptId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return readAll().some(setting => setting.kind === kind && setting.id !== exceptId && setting.name.toLowerCase() === normalized);
}

export function addStaySetting(kind: StaySettingKind, name: string, active: boolean): void {
  const all = readAll();
  const order = Math.max(0, ...all.filter(setting => setting.kind === kind).map(setting => setting.order)) + 1;
  persist([...all, { id: `setting-${kind}-${slug(name)}-${Date.now().toString(36)}`, kind, name: name.trim(), active, order }]);
}

function renameInHotels(kind: StaySettingKind, from: string, to: string) {
  const swap = (value: string) => value === from ? to : value;
  writeHotelListings(readHotelListings().map(hotel => ({
    ...hotel,
    category: kind === 'accommodation' ? swap(hotel.category) : hotel.category,
    amenities: kind === 'stayAmenity' ? hotel.amenities.map(swap) : hotel.amenities,
    rooms: hotel.rooms.map(room => ({
      ...room,
      roomType: kind === 'roomType' ? swap(room.roomType) : room.roomType,
      facilities: kind === 'roomAmenity' ? room.facilities.map(swap) : room.facilities,
      options: kind === 'board' ? room.options.map(option => ({ ...option, board: swap(option.board) })) : room.options,
    })),
  })));
}

// Hotels store setting names, so a rename is carried through to every hotel that uses the old name.
export function updateStaySetting(id: string, changes: { name?: string; active?: boolean }): void {
  const all = readAll();
  const current = all.find(setting => setting.id === id);
  if (!current) return;
  const name = changes.name?.trim();
  if (name && name !== current.name) renameInHotels(current.kind, current.name, name);
  persist(all.map(setting => setting.id === id ? { ...setting, ...(name ? { name } : {}), ...(changes.active === undefined ? {} : { active: changes.active }) } : setting));
}

// Settings still used by a hotel cannot be removed; they can be deactivated instead.
export function removeStaySettings(ids: string[]): { removed: number; blocked: { name: string; hotels: number }[] } {
  const all = readAll();
  const blocked: { name: string; hotels: number }[] = [];
  const removable = new Set<string>();
  for (const setting of all.filter(item => ids.includes(item.id))) {
    const hotels = usageOf(setting.kind, setting.name);
    if (hotels > 0) blocked.push({ name: setting.name, hotels });
    else removable.add(setting.id);
  }
  persist(all.filter(setting => !removable.has(setting.id)));
  return { removed: removable.size, blocked };
}
