import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { playNotification, playClick } from '@/lib/sounds';

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const prevUnreadRef = useRef(0);

  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unread = notifications?.filter(n => !n.isRead).length ?? 0;

  // Play a ping whenever new unread notifications arrive
  useEffect(() => {
    if (unread > prevUnreadRef.current && prevUnreadRef.current !== 0) {
      playNotification();
    }
    prevUnreadRef.current = unread;
  }, [unread]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: (typeof notifications)[0]) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link) setLocation(n.link);
    setOpen(false);
  };

  if (!notifications) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); playClick(); }}
        className="relative p-2 text-[#F5F0E8]/70 hover:text-[#C9A84C] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#C9A84C] text-[#0D0A07] text-[10px] font-bold rounded-full flex items-center justify-center gold-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1A1410] border border-[#C9A84C]/25 shadow-2xl z-50 mobile-menu-enter">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#C9A84C]/15">
            <span className="font-serif text-[#F5F0E8] text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-[#C9A84C] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#C9A84C]/10">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-[#F5F0E8]/40 text-sm font-serif italic">
                No notifications yet.
              </p>
            ) : notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 hover:bg-[#C9A84C]/5 transition-colors ${!n.isRead ? 'bg-[#C9A84C]/8' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="w-2 h-2 bg-[#C9A84C] rounded-full mt-1.5 flex-shrink-0" />}
                  <div className={!n.isRead ? '' : 'pl-4'}>
                    <p className={`text-sm ${!n.isRead ? 'text-[#F5F0E8] font-medium' : 'text-[#F5F0E8]/70'}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-[#F5F0E8]/50 mt-0.5 leading-relaxed line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-[#F5F0E8]/30 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
