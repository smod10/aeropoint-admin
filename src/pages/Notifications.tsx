import { CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getReadNotificationIds, markAllNotificationsRead, markNotificationRead, notifications } from '../data/notifications';

export default function Notifications() {
  const navigate = useNavigate();
  const [readIds, setReadIds] = useState(getReadNotificationIds);
  const unreadCount = notifications.filter(notification => !readIds.includes(notification.id)).length;

  const openNotification = (id: string, path: string) => {
    markNotificationRead(id);
    setReadIds(current => current.includes(id) ? current : [...current, id]);
    navigate(path);
  };

  const markAllRead = () => {
    markAllNotificationsRead();
    setReadIds(notifications.map(notification => notification.id));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><CheckCheck size={16} /> Mark all read</button>}
      </header>

      <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white">
        {notifications.map(notification => {
          const Icon = notification.icon;
          const isUnread = !readIds.includes(notification.id);
          return (
            <button key={notification.id} onClick={() => openNotification(notification.id, notification.path)} className="flex w-full items-start gap-4 px-4 py-5 text-left hover:bg-gray-50 sm:px-6">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700"><Icon size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><span className="text-sm font-semibold text-gray-900">{notification.title}</span>{isUnread && <span className="h-2 w-2 rounded-full bg-secondary-500" />}</span>
                <span className="mt-1 block text-sm text-gray-600">{notification.detail}</span>
                <span className="mt-2 block text-xs text-gray-400">{notification.time}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
