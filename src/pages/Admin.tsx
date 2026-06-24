import React, { useState } from 'react';
import { format } from 'date-fns';
import { ShieldAlert, Users, TrendingUp, Calendar, ShoppingBag, Check, Bell, Send, Info, UserCog, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useListAdminBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { useListAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import {
  useAdminStats,
  useAdminSettings,
  useUpdateAdminSettings,
  useSendTestNotification,
} from '@/hooks/useAdmin';
import StaffManagementTab from '@/components/admin/StaffManagementTab';
import CustomerManagementTab from '@/components/admin/CustomerManagementTab';
import AnnouncementsTab from '@/components/admin/AnnouncementsTab';
import CatalogManagementTab from '@/components/admin/CatalogManagementTab';
import ReviewsTab from '@/components/admin/ReviewsTab';
import ContactMessagesTab from '@/components/admin/ContactMessagesTab';
import { useSendNotification } from '@/hooks/useNotifications';
import { useListCustomers } from '@/hooks/useAdmin';
import { playSuccess, playError } from '@/lib/sounds';

/** Inline panel that lets the Main Admin send an in-app notification to a
 *  specific customer (by email/name search) or broadcast to all customers. */
const InAppNotificationSender: React.FC = () => {
  const { toast } = useToast();
  const send = useSendNotification();
  const { data: customers } = useListCustomers?.() ?? { data: [] };
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [link, setLink] = React.useState('');
  const [userId, setUserId] = React.useState('');

  const handleSend = () => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    send.mutate(
      { userId: userId || undefined, title: title.trim(), body: body.trim() || undefined, link: link.trim() || undefined },
      {
        onSuccess: () => {
          playSuccess();
          toast({ title: userId ? 'Notification Sent' : 'Broadcast Sent to All Customers' });
          setTitle(''); setBody(''); setLink(''); setUserId('');
        },
        onError: (err: any) => { playError(); toast({ title: 'Error', description: err?.message, variant: 'destructive' }); },
      }
    );
  };

  return (
    <div className="bg-card border border-border p-8">
      <h3 className="text-xl font-serif text-foreground mb-2 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" /> Send In-App Notification
      </h3>
      <p className="text-sm text-muted-foreground mb-6">Send a notification to a specific customer or broadcast to everyone. Shows in the bell icon in their Navbar.</p>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-primary uppercase tracking-wider">Recipient</label>
          <select value={userId} onChange={e => setUserId(e.target.value)} className="h-10 px-3 w-full bg-background border border-border rounded-none text-sm">
            <option value="">All Customers (Broadcast)</option>
            {(customers ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.fullName || c.email || c.phone}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-primary uppercase tracking-wider">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Your booking has been confirmed!" className="rounded-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-primary uppercase tracking-wider">Message (optional)</label>
          <Textarea value={body} onChange={e => setBody(e.target.value)} rows={2} placeholder="Additional details…" className="rounded-none resize-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-primary uppercase tracking-wider">Link (optional)</label>
          <Input value={link} onChange={e => setLink(e.target.value)} placeholder="e.g. /account" className="rounded-none" />
        </div>
        <Button disabled={send.isPending} onClick={handleSend} className="rounded-none gap-2">
          <Send className="w-4 h-4" /> {send.isPending ? 'Sending…' : userId ? 'Send to Customer' : 'Broadcast to All'}
        </Button>
      </div>
    </div>
  );
};

type TabKey = 'dashboard' | 'bookings' | 'orders' | 'messages' | 'staff' | 'customers' | 'catalog' | 'reviews' | 'announcements' | 'notifications';

const Admin: React.FC = () => {
  const { isLoaded, isSignedIn, profile } = useAuth();
  const isMainAdmin = Boolean(profile?.isMainAdmin);
  const isStaffOrAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: bookings } = useListAdminBookings();
  const { data: orders } = useListAdminOrders();

  const updateBookingMutation = useUpdateBookingStatus();
  const updateOrderMutation = useUpdateOrderStatus();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // ── Notification settings (Main Admin only) ──
  const { data: notif } = useAdminSettings();
  const updateSettingsMutation = useUpdateAdminSettings();
  const sendTestMutation = useSendTestNotification();
  const [settingsDraft, setSettingsDraft] = useState({ adminPhone: '', twilioSid: '', twilioToken: '', twilioFrom: '' });
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  React.useEffect(() => {
    if (notif) {
      setSettingsDraft({
        adminPhone: notif.adminPhone,
        twilioSid: notif.twilioSid,
        twilioToken: notif.twilioToken,
        twilioFrom: notif.twilioFrom,
      });
    }
  }, [notif]);

  const handleSaveNotifSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsDraft, {
      onSuccess: () => {
        toast({ title: 'Settings Saved', description: 'Your notification credentials have been saved.' });
        setTestStatus({ type: 'success', message: 'Settings saved. Send a test message to verify.' });
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const handleSendTest = () => {
    setTestStatus({ type: null, message: '' });
    sendTestMutation.mutate(undefined, {
      onSuccess: () => {
        setTestStatus({ type: 'success', message: 'Test message sent — check your WhatsApp.' });
        toast({ title: 'Test Sent!', description: 'Check your WhatsApp for the test message.' });
      },
      onError: (err: any) => {
        setTestStatus({ type: 'error', message: `Error: ${err?.message}` });
        toast({ title: 'Send Failed', description: err?.message, variant: 'destructive' });
      },
    });
  };

  const handleBookingStatus = (id: string, status: string) => {
    updateBookingMutation.mutate({ id, data: { status } }, {
      onSuccess: () => toast({ title: `Booking marked as ${status}` }),
    });
  };

  const handleOrderStatus = (id: string, status: string) => {
    updateOrderMutation.mutate({ id, data: { status } }, {
      onSuccess: () => toast({ title: `Order marked as ${status}` }),
    });
  };

  // ── Access gating ──
  if (!isLoaded) return <div className="min-h-screen pt-32 bg-background" />;

  if (!isSignedIn || !profile) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-serif text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to access the admin portal.</p>
        </div>
      </div>
    );
  }

  if (!isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-serif text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You do not have staff or administrator privileges for this portal.</p>
        </div>
      </div>
    );
  }

  if (profile.status === 'disabled') {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <Lock className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-serif text-foreground">Account Disabled</h1>
          <p className="text-muted-foreground">Your staff account has been disabled. Please contact the Main Admin.</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; adminOnly?: boolean }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'orders', label: 'Orders' },
    { key: 'messages', label: 'Messages' },
    { key: 'catalog', label: 'Catalog', adminOnly: true },
    { key: 'reviews', label: 'Reviews', adminOnly: true },
    { key: 'staff', label: 'Staff', adminOnly: true },
    { key: 'customers', label: 'Customers', adminOnly: true },
    { key: 'announcements', label: 'Announcements', adminOnly: true },
    { key: 'notifications', label: 'Notifications', adminOnly: true },
  ];
  const visibleTabs = tabs.filter(t => !t.adminOnly || isMainAdmin);

  const pendingBookingsList = bookings?.filter(b => b.status === 'pending') ?? [];
  const pendingOrdersList = orders?.filter(o => o.status === 'pending') ?? [];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Backstage</span>
            <h1 className="text-4xl font-display text-primary mt-1">
              {isMainAdmin ? 'Admin Control Panel' : 'Staff Portal'}
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {visibleTabs.map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.key)}
                className="rounded-none font-serif tracking-wide"
              >
                {tab.key === 'notifications' && <Bell className="w-4 h-4 mr-1.5" />}
                {tab.key === 'staff' && <UserCog className="w-4 h-4 mr-1.5" />}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-10 flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
          <span className={`px-2.5 py-1 rounded-sm ${isMainAdmin ? 'bg-primary/15 text-primary' : 'bg-blue-500/15 text-blue-400'}`}>
            {isMainAdmin ? 'Main Admin' : `Staff${profile.staffId ? ` · ${profile.staffId}` : ''}`}
          </span>
          {!isMainAdmin && <span>Limited view — bookings &amp; orders only</span>}
        </div>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          loadingStats ? (
            <div className="text-center py-20">Loading statistics...</div>
          ) : stats ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isMainAdmin && (
                  <div className="bg-card border border-border p-6 flex items-center gap-4 card-glow">
                    <div className="p-3 bg-primary/10 text-primary"><TrendingUp className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Total Revenue</p>
                      <p className="text-2xl font-serif font-bold text-foreground">GHS {Number(stats.totalRevenue).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                <div className="bg-card border border-border p-6 flex items-center gap-4 card-glow">
                  <div className="p-3 bg-primary/10 text-primary"><Calendar className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Total Bookings</p>
                    <p className="text-2xl font-serif font-bold text-foreground">{stats.totalBookings}</p>
                  </div>
                </div>
                <div className="bg-card border border-border p-6 flex items-center gap-4 card-glow">
                  <div className="p-3 bg-primary/10 text-primary"><ShoppingBag className="w-6 h-6" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Total Orders</p>
                    <p className="text-2xl font-serif font-bold text-foreground">{stats.totalOrders}</p>
                  </div>
                </div>
                {isMainAdmin && (
                  <div className="bg-card border border-border p-6 flex items-center gap-4 card-glow">
                    <div className="p-3 bg-primary/10 text-primary"><Users className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Total Users</p>
                      <p className="text-2xl font-serif font-bold text-foreground">{stats.totalUsers}</p>
                    </div>
                  </div>
                )}
              </div>

              {isMainAdmin && (!notif?.adminPhone || !notif?.twilioSid ? (
                <div className="bg-primary/8 border border-primary/30 p-5 flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground font-serif">WhatsApp notifications aren't set up yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Get instantly notified on WhatsApp every time a new booking or order comes in.</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-none flex-shrink-0" onClick={() => setActiveTab('notifications')}>
                    Set Up Now
                  </Button>
                </div>
              ) : (
                <div className="bg-green-500/8 border border-green-500/25 p-4 flex items-center gap-3">
                  <Bell className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-foreground/80">WhatsApp notifications are <span className="text-green-500 font-medium">active</span> — alerts go to {notif.adminPhone}</p>
                </div>
              ))}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-card border border-border p-6">
                  <h3 className="text-xl font-serif text-foreground border-b border-border pb-3 mb-4 flex justify-between">
                    <span>Pending Bookings</span>
                    <span className="text-destructive font-bold">{stats.pendingBookings}</span>
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-auto">
                    {pendingBookingsList.map(booking => (
                      <div key={booking.id} className="p-4 border border-border bg-background flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-foreground">{booking.userName || 'Guest'}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(booking.createdAt), 'MMM dd')}</span>
                        </div>
                        <p className="text-sm font-sans">{booking.serviceName || booking.serviceType.toUpperCase()} - {format(new Date(booking.eventDate), 'MMM dd, yyyy')}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-none" onClick={() => handleBookingStatus(booking.id, 'confirmed')}>
                            <Check className="w-4 h-4 mr-1" /> Confirm
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingBookingsList.length === 0 && <p className="text-muted-foreground text-sm italic">All caught up.</p>}
                  </div>
                </div>

                <div className="bg-card border border-border p-6">
                  <h3 className="text-xl font-serif text-foreground border-b border-border pb-3 mb-4 flex justify-between">
                    <span>Pending Orders</span>
                    <span className="text-destructive font-bold">{stats.pendingOrders}</span>
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-auto">
                    {pendingOrdersList.map(order => (
                      <div key={order.id} className="p-4 border border-border bg-background flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()} - {order.shippingName}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd')}</span>
                        </div>
                        {isMainAdmin && <p className="text-sm font-sans text-primary font-bold">GHS {order.total.toFixed(2)}</p>}
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-none" onClick={() => handleOrderStatus(order.id, 'processing')}>Process</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-none" onClick={() => handleOrderStatus(order.id, 'delivered')}>Deliver</Button>
                        </div>
                      </div>
                    ))}
                    {pendingOrdersList.length === 0 && <p className="text-muted-foreground text-sm italic">All caught up.</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* ── BOOKINGS TABLE ── */}
        {activeTab === 'bookings' && (
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Ref</th><th className="p-4">Client</th><th className="p-4">Service</th>
                  <th className="p-4">Event Date</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings?.map(b => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs">{b.id.slice(0, 8)}</td>
                    <td className="p-4 font-medium text-foreground">{b.userName || b.userEmail || 'N/A'}</td>
                    <td className="p-4">{b.serviceName || b.serviceType}</td>
                    <td className="p-4">{format(new Date(b.eventDate), 'MMM dd, yyyy')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded-sm ${b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : b.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-border text-foreground'}`}>{b.status}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {b.status === 'pending' && <Button size="sm" variant="outline" className="text-green-500 border-green-500/30 hover:bg-green-500/10 h-8" onClick={() => handleBookingStatus(b.id, 'confirmed')}>Approve</Button>}
                      {b.status !== 'cancelled' && <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8" onClick={() => handleBookingStatus(b.id, 'cancelled')}>Cancel</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ORDERS TABLE ── */}
        {activeTab === 'orders' && (
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Order #</th><th className="p-4">Customer</th>
                  {isMainAdmin && <th className="p-4">Total (GHS)</th>}
                  <th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders?.map(o => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 font-medium text-foreground">{o.shippingName}</td>
                    {isMainAdmin && <td className="p-4 text-primary font-bold">{o.total.toFixed(2)}</td>}
                    <td className="p-4">{format(new Date(o.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded-sm ${o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : o.status === 'delivered' ? 'bg-green-500/20 text-green-500' : o.status === 'processing' ? 'bg-blue-500/20 text-blue-500' : 'bg-border text-foreground'}`}>{o.status}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <select value={o.status} onChange={(e) => handleOrderStatus(o.id, e.target.value)} className="h-8 px-2 bg-background border border-border text-xs rounded-none">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CONTACT MESSAGES INBOX ── */}
        {activeTab === 'messages' && <ContactMessagesTab />}

        {/* ── CATALOG MANAGEMENT (Main Admin only) ── */}
        {activeTab === 'catalog' && isMainAdmin && <CatalogManagementTab />}

        {/* ── CUSTOMER REVIEWS MODERATION (Main Admin only) ── */}
        {activeTab === 'reviews' && isMainAdmin && <ReviewsTab />}

        {/* ── STAFF MANAGEMENT (Main Admin only) ── */}
        {activeTab === 'staff' && isMainAdmin && <StaffManagementTab />}

        {/* ── CUSTOMER MANAGEMENT (Main Admin only) ── */}
        {activeTab === 'customers' && isMainAdmin && <CustomerManagementTab />}

        {/* ── ANNOUNCEMENTS (Main Admin only) ── */}
        {activeTab === 'announcements' && isMainAdmin && <AnnouncementsTab />}

        {/* ── NOTIFICATIONS SETTINGS (Main Admin only) ── */}
        {activeTab === 'notifications' && isMainAdmin && (
          <div className="space-y-8 max-w-3xl">

            <div className="bg-card border border-border p-8">
              <h3 className="text-xl font-serif text-foreground mb-2 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> WhatsApp &amp; SMS Notifications
              </h3>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                When a client submits a booking or places a shop order, you'll receive an instant WhatsApp alert.{' '}
                <span className="text-primary">Setup:</span> create a free{' '}
                <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Twilio account</a>, enable the WhatsApp Sandbox, then enter your credentials below.
              </p>
              <form onSubmit={handleSaveNotifSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Your WhatsApp Number</label>
                    <Input type="tel" placeholder="+233547164110" value={settingsDraft.adminPhone} onChange={(e) => setSettingsDraft(p => ({ ...p, adminPhone: e.target.value }))} className="bg-background rounded-none border-border h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Twilio From / WhatsApp Sender</label>
                    <Input type="tel" placeholder="whatsapp:+14155238886" value={settingsDraft.twilioFrom} onChange={(e) => setSettingsDraft(p => ({ ...p, twilioFrom: e.target.value }))} className="bg-background rounded-none border-border h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Twilio Account SID</label>
                    <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={settingsDraft.twilioSid} onChange={(e) => setSettingsDraft(p => ({ ...p, twilioSid: e.target.value }))} className="bg-background rounded-none border-border h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Twilio Auth Token</label>
                    <Input type="password" placeholder="••••••••••••••••••••••••••••••••" value={settingsDraft.twilioToken} onChange={(e) => setSettingsDraft(p => ({ ...p, twilioToken: e.target.value }))} className="bg-background rounded-none border-border h-11" />
                  </div>
                </div>
                <Button type="submit" disabled={updateSettingsMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
                  {updateSettingsMutation.isPending ? 'Saving…' : 'Save Credentials'}
                </Button>
              </form>
            </div>

            <div className="bg-card border border-border p-8">
              <h3 className="text-xl font-serif text-foreground mb-6">Notification Triggers</h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between py-3 border-b border-border/60">
                  <div>
                    <p className="font-serif text-foreground">New Booking Alert</p>
                    <p className="text-sm text-muted-foreground">Send WhatsApp when a client submits a booking request</p>
                  </div>
                  <button type="button" className={`notif-toggle ${notif?.notifyOnBooking ? 'on' : ''}`}
                    onClick={() => updateSettingsMutation.mutate({ notifyOnBooking: !notif?.notifyOnBooking })} aria-label="Toggle booking notifications" />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-serif text-foreground">New Shop Order Alert</p>
                    <p className="text-sm text-muted-foreground">Send WhatsApp when a customer places a shop order</p>
                  </div>
                  <button type="button" className={`notif-toggle ${notif?.notifyOnOrder ? 'on' : ''}`}
                    onClick={() => updateSettingsMutation.mutate({ notifyOnOrder: !notif?.notifyOnOrder })} aria-label="Toggle order notifications" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-8">
              <h3 className="text-xl font-serif text-foreground mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" /> Test Your Setup
              </h3>
              {testStatus.type && (
                <div className={`mb-5 p-3 text-sm rounded-sm ${testStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/25' : 'bg-destructive/10 text-destructive border border-destructive/25'}`}>{testStatus.message}</div>
              )}
              <Button variant="outline" className="rounded-none" disabled={sendTestMutation.isPending} onClick={handleSendTest}>{sendTestMutation.isPending ? 'Sending…' : 'Send Test Notification'}</Button>
            </div>

            <InAppNotificationSender />
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
