import { CalendarCheck, CreditCard, UserRoundPlus } from 'lucide-react';

export const notifications = [
  { id: 'booking', title: 'New flight booking', detail: 'A booking is waiting for review.', time: '10 min ago', icon: CalendarCheck, path: '/bookings' },
  { id: 'payment', title: 'Payment received', detail: 'A transaction has been completed.', time: '32 min ago', icon: CreditCard, path: '/payments' },
  { id: 'user', title: 'New customer registered', detail: 'Review the latest customer profile.', time: '1 hour ago', icon: UserRoundPlus, path: '/users' },
];

const readNotificationsKey = 'aeropoint-read-notifications';

export function getReadNotificationIds(): string[] {
  return JSON.parse(localStorage.getItem(readNotificationsKey) || '[]') as string[];
}

export function markNotificationRead(id: string) {
  const readIds = new Set(getReadNotificationIds());
  readIds.add(id);
  localStorage.setItem(readNotificationsKey, JSON.stringify([...readIds]));
}

export function markAllNotificationsRead() {
  localStorage.setItem(readNotificationsKey, JSON.stringify(notifications.map(notification => notification.id)));
}
