export type ActorRole = 'super_admin' | 'admin' | 'employee' | 'agent' | 'supplier' | 'customer';

export type ManagedAccount = {
  id: number;
  role: string;
  isSuperAdmin?: boolean;
};

export type AccountOverride = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: boolean;
  banned?: boolean;
};

export type TrashRecord = { deletedAt: string; deletedBy: string };

const ACCOUNT_OVERRIDES_KEY = 'aeropoint-account-overrides';
const ACCOUNT_TRASH_KEY = 'aeropoint-account-trash';

export function getCurrentActorRole(): ActorRole {
  const role = localStorage.getItem('aeropoint-current-role');
  return role === 'admin' || role === 'employee' || role === 'agent' || role === 'supplier' || role === 'customer'
    ? role
    : 'super_admin';
}

export function getCurrentAccountId(): number {
  return Number(localStorage.getItem('aeropoint-current-user-id')) || 1;
}

export function canEditAccount(actorRole: ActorRole, account: ManagedAccount): boolean {
  if (actorRole === 'super_admin') return true;
  if (account.isSuperAdmin) return false;
  if (actorRole === 'admin') return true;
  if (actorRole === 'employee') return ['customer', 'agent', 'supplier'].includes(account.role);
  return account.id === getCurrentAccountId();
}

export function canDeleteAccount(actorRole: ActorRole, account: ManagedAccount): boolean {
  if (actorRole === 'super_admin') return true;
  if (account.isSuperAdmin) return false;
  if (account.id === getCurrentAccountId()) return true;
  if (actorRole === 'admin') return true;
  return actorRole === 'employee' && ['customer', 'agent', 'supplier'].includes(account.role);
}

export function isSuperAdmin(actorRole: ActorRole): boolean {
  return actorRole === 'super_admin';
}

export function readAccountOverrides(): Record<number, AccountOverride> {
  return JSON.parse(localStorage.getItem(ACCOUNT_OVERRIDES_KEY) || '{}');
}

export function saveAccountOverride(id: number, override: AccountOverride): void {
  const overrides = readAccountOverrides();
  overrides[id] = { ...overrides[id], ...override };
  localStorage.setItem(ACCOUNT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function readAccountTrash(): Record<number, TrashRecord> {
  return JSON.parse(localStorage.getItem(ACCOUNT_TRASH_KEY) || '{}');
}

export function moveAccountToTrash(id: number, actorRole: ActorRole): void {
  const trash = readAccountTrash();
  trash[id] = { deletedAt: new Date().toISOString(), deletedBy: actorRole };
  localStorage.setItem(ACCOUNT_TRASH_KEY, JSON.stringify(trash));
}

export function restoreAccountFromTrash(id: number): void {
  const trash = readAccountTrash();
  delete trash[id];
  localStorage.setItem(ACCOUNT_TRASH_KEY, JSON.stringify(trash));
}