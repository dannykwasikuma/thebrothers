import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { playNotificationPing } from '@/lib/sounds';
import { format } from 'date-fns';

const NotificationBell: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { data: notifications } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const previousUnreadCount = useRef<number | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play a soft ping only when the unread count goes UP between polls — not
  // on first load (that would ping for every pre-existing unread item every
  // time the page is opened) and not when it goes down (marking things read).
  useEffect(() => {
    if (!notifications) return;
    const currentUnread = notifications.filter((n) => !n.read).length;
    if (previousUnreadCount.current !== null && currentUnread > previousUnreadCount.current) {
      playNotificationPing();
    }
    previousUnreadCount.current = currentUnread;
  }, [notifications]);

  if (!isSignedIn) return null;

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-[#F5F0E8]/80 hover:text-[#C9A84C] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-[#C9A84C] text-[#0D0A07] text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1A1410] border border-[#C9A84C]/25 rounded-md shadow-2xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-[#C9A84C]/15">
            <span className="text-sm font-serif text-[#F5F0E8]">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-[#C9A84C] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {!notifications || notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#F5F0E8]/40 italic">Nothing yet — we'll let you know when something changes.</p>
          ) : (
            <div className="divide-y divide-[#C9A84C]/10">
              {notifications.map((n) => (
                <Link key={n.id} href={n.link || '/account'}>
                  <div
                    onClick={() => { if (!n.read) markRead.mutate(n.id); setOpen(false); }}
                    className={`p-3 cursor-pointer hover:bg-[#C9A84C]/5 transition-colors ${!n.read ? 'bg-[#C9A84C]/[0.04]' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm text-[#F5F0E8] font-medium">{n.title}</p>
                        {n.body && <p className="text-xs text-[#F5F0E8]/50 mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[10px] text-[#F5F0E8]/30 mt-1 uppercase tracking-wider">{format(new Date(n.createdAt), 'MMM dd, h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
