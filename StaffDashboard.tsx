import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useListAdminBookings } from '@/hooks/useBookings';
import { useListAdminOrders } from '@/hooks/useOrders';
import { useListAnnouncements } from '@/hooks/useAnnouncements';
import { useListContactMessages } from '@/hooks/useCatalog';
import { useListQuoteRequestsAdmin } from '@/hooks/useQuotes';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import {
  Calendar, ShoppingBag, Megaphone, Mail, FileQuestion, Users2,
  LayoutDashboard, ArrowRight, Clock, CheckCircle2,
} from 'lucide-react';

/** Small reusable stat tile used across the top of the dashboard. */
const StatTile: React.FC<{ label: string; value: number | string; icon: React.ReactNode; href: string; accent?: boolean }> = ({ label, value, icon, href, accent }) => (
  <Link href={href}>
    <div className={`p-5 border rounded-md transition-all duration-200 cursor-pointer hover:border-primary/50 hover:scale-[1.03] ${accent ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
      </div>
      <p className="text-3xl font-display text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
    </div>
  </Link>
);

const QuickLink: React.FC<{ label: string; href: string; icon: React.ReactNode }> = ({ label, href, icon }) => (
  <Link href={href}>
    <div className="flex items-center gap-3 p-4 border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:translate-x-1 transition-all duration-200 cursor-pointer">
      <span className="text-primary">{icon}</span>
      <span className="font-serif text-foreground">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto" />
    </div>
  </Link>
);

const StaffDashboard: React.FC = () => {
  const { profile } = useAuth();
  const isMainAdmin = Boolean(profile?.isMainAdmin);

  const { data: bookings } = useListAdminBookings();
  const { data: orders } = useListAdminOrders();
  const { data: announcements } = useListAnnouncements();
  const { data: messages } = useListContactMessages();
  const { data: quotes } = useListQuoteRequestsAdmin();

  const todaysBookings = (bookings ?? []).filter(b => {
    try { return isToday(parseISO(b.eventDate)); } catch { return false; }
  });
  const upcomingBookings = (bookings ?? [])
    .filter(b => b.status !== 'cancelled' && b.status !== 'completed')
    .filter(b => { try { return isFuture(parseISO(b.eventDate)) || isToday(parseISO(b.eventDate)); } catch { return false; } })
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 5);

  const pendingBookingsCount = (bookings ?? []).filter(b => b.status === 'pending').length;
  const newOrdersCount = (orders ?? []).filter(o => o.status === 'pending').length;
  const newMessagesCount = (messages ?? []).filter(m => m.status === 'new').length;
  const newQuotesCount = (quotes ?? []).filter(q => q.status === 'new').length;
  const activeAnnouncement = (announcements ?? []).find(a => a.active);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <p className="text-primary text-sm uppercase tracking-widest font-sans">{greeting}{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}</p>
          <h1 className="text-3xl md:text-4xl font-display text-foreground mt-1">
            {isMainAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
          </h1>
          {profile?.staffId && <p className="text-sm text-muted-foreground mt-1">Staff ID: {profile.staffId} {profile.staffTitle ? `· ${profile.staffTitle}` : ''}</p>}
        </motion.div>

        {/* ANNOUNCEMENT BANNER */}
        {activeAnnouncement && (
          <div className="mb-8 p-4 border border-primary/30 bg-primary/5 rounded-md flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{activeAnnouncement.message}</p>
              {activeAnnouncement.linkUrl && activeAnnouncement.linkLabel && (
                <Link href={activeAnnouncement.linkUrl}>
                  <span className="text-sm text-primary hover:underline cursor-pointer">{activeAnnouncement.linkLabel}</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* AT-A-GLANCE STATS */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            <StatTile key="today" label="Today's Bookings" value={todaysBookings.length} icon={<Calendar className="w-5 h-5" />} href="/admin" accent={todaysBookings.length > 0} />,
            <StatTile key="pending" label="Pending Bookings" value={pendingBookingsCount} icon={<Clock className="w-5 h-5" />} href="/admin" />,
            <StatTile key="orders" label="New Orders" value={newOrdersCount} icon={<ShoppingBag className="w-5 h-5" />} href="/admin" />,
            isMainAdmin
              ? <StatTile key="messages" label="New Messages" value={newMessagesCount} icon={<Mail className="w-5 h-5" />} href="/admin" />
              : <StatTile key="quotes" label="Quote Requests" value={newQuotesCount} icon={<FileQuestion className="w-5 h-5" />} href="/admin" />,
          ].map((tile, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              {tile}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >

          {/* UPCOMING EVENTS */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-serif text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming Events
            </h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic p-6 border border-border bg-card text-center">No upcoming events on the books right now.</p>
            ) : (
              <div className="border border-border bg-card divide-y divide-border">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-serif text-foreground truncate">{b.serviceName || b.serviceType}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.userName} · {b.eventLocation || 'Location TBD'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-foreground">{format(parseISO(b.eventDate), 'MMM dd')}</p>
                      <span className={`text-xs uppercase tracking-wider font-bold ${b.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin">
              <span className="text-sm text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                Manage all bookings <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" /> Quick Links
            </h2>
            <div className="space-y-3">
              <QuickLink label="Admin Console" href="/admin" icon={<LayoutDashboard className="w-4 h-4" />} />
              <QuickLink label="Team Feed & My Profile" href="/team" icon={<Users2 className="w-4 h-4" />} />
              {isMainAdmin && <QuickLink label="Quote Requests" href="/admin" icon={<FileQuestion className="w-4 h-4" />} />}
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center text-sm text-muted-foreground italic">
          <CheckCircle2 className="w-4 h-4 inline-block mr-1.5 text-primary" />
          Everything here updates automatically — no need to refresh.
        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
