import { mockUsers } from './mockUsers';

export type HotelOwner = { id: number; name: string; email: string; role: string };

// Properties are owned by suppliers and agents.
export const hotelOwners: HotelOwner[] = mockUsers
  .filter(user => user.role === 'supplier' || user.role === 'agent')
  .map(user => ({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role }));

export function findHotelOwner(id: number | null): HotelOwner | undefined {
  return id === null ? undefined : hotelOwners.find(owner => owner.id === id);
}
