import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { User, Calendar, ShoppingBag, Settings, LogOut, FileText, Star, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useListBookings } from '@/hooks/useBookings';
import { useListOrders } from '@/hooks/useOrders';
import { useCreateTestimonial } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'orders' | 'profile' | 'review'>('overview');
  const [, setLocation] = useLocation();

  const { profile, isLoaded, signOut, updateProfile } = useAuth();
  const { data: bookings, isLoading: loadingBookings } = useListBookings();
  const { data: orders, isLoading: loadingOrders } = useListOrders();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const createTestimonial = useCreateTestimonial();
  const [reviewQuote, setReviewQuote] = useState('');
  const [reviewEventLabel, setReviewEventLabel] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.fullName || '');
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfile({ fullName });
    setSavingProfile(false);
    if (result.ok) {
      toast({ title: "Profile Updated Successfully" });
    } else {
      toast({ title: "Error", description: result.error || "Could not update profile", variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewQuote.trim()) {
      toast({ title: 'Please write a few words about your experience', variant: 'destructive' });
      return;
    }
    createTestimonial.mutate(
      { authorName: profile?.fullName || 'A Valued Customer', eventLabel: reviewEventLabel || null, quote: reviewQuote.trim(), rating: reviewRating },
      {
        onSuccess: () => {
          setReviewSubmitted(true);
          setReviewQuote('');
          setReviewEventLabel('');
          setReviewRating(5);
        },
        onError: (err: any) => toast({ title: 'Could Not Submit Review', description: err?.message, variant: 'destructive' }),
      }
    );
  };

  if (!isLoaded) return <div className="min-h-screen pt-32 bg-background" />;

  const totalBookings = bookings?.length ?? 0;
  const totalOrders = orders?.length ?? 0;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-primary mb-10">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-6 py-4 font-serif transition-colors ${activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
            >
              <User className="inline-block w-5 h-5 mr-3 mb-1" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full text-left px-6 py-4 font-serif transition-colors ${activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
            >
              <Calendar className="inline-block w-5 h-5 mr-3 mb-1" /> My Bookings
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-6 py-4 font-serif transition-colors ${activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
            >
              <ShoppingBag className="inline-block w-5 h-5 mr-3 mb-1" /> Order History
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-6 py-4 font-serif transition-colors ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
            >
              <Settings className="inline-block w-5 h-5 mr-3 mb-1" /> Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`w-full text-left px-6 py-4 font-serif transition-colors ${activeTab === 'review' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
            >
              <MessageSquareQuote className="inline-block w-5 h-5 mr-3 mb-1" /> Leave a Review
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-6 py-4 font-serif text-destructive hover:bg-muted transition-colors mt-8"
            >
              <LogOut className="inline-block w-5 h-5 mr-3 mb-1" /> Sign Out
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-card border border-border p-8 flex flex-col items-center text-center">
                    <Calendar className="w-10 h-10 text-primary mb-4" />
                    <span className="text-4xl font-display text-foreground">{totalBookings}</span>
                    <span className="text-muted-foreground font-serif uppercase tracking-widest mt-2">Total Bookings</span>
                  </div>
                  <div className="bg-card border border-border p-8 flex flex-col items-center text-center">
                    <ShoppingBag className="w-10 h-10 text-primary mb-4" />
                    <span className="text-4xl font-display text-foreground">{totalOrders}</span>
                    <span className="text-muted-foreground font-serif uppercase tracking-widest mt-2">Shop Orders</span>
                  </div>
                </div>

                <div className="bg-card border border-border p-8">
                  <h3 className="text-xl font-serif text-foreground border-b border-border pb-4 mb-6">Recent Activity</h3>
                  {(bookings?.length || orders?.length) ? (
                    <div className="space-y-6">
                      {[...(bookings ?? []).map(b => ({ type: 'booking' as const, date: b.createdAt, description: `Booking request for ${b.serviceName || b.serviceType}` })),
                        ...(orders ?? []).map(o => ({ type: 'order' as const, date: o.createdAt, description: `Order placed — GHS ${o.total.toFixed(2)}` }))]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 6)
                        .map((activity, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                              {activity.type === 'booking' ? <Calendar className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-foreground font-medium font-sans">{activity.description}</p>
                              <p className="text-sm text-muted-foreground font-sans">{format(new Date(activity.date), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-sans italic">No recent activity found.</p>
                  )}
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="bg-card border border-border">
                <div className="p-6 md:p-8 border-b border-border flex justify-between items-center">
                  <h3 className="text-2xl font-serif text-foreground">Event Bookings</h3>
                  <Link href="/booking">
                    <Button variant="outline" className="border-primary text-primary rounded-none">New Booking</Button>
                  </Link>
                </div>
                <div className="p-0">
                  {loadingBookings ? <div className="p-8 text-center">Loading...</div> :
                   bookings && bookings.length > 0 ? (
                    <div className="divide-y divide-border">
                      {bookings.map(booking => (
                        <div key={booking.id} className="p-6 md:p-8 flex flex-col sm:flex-row justify-between gap-6 hover:bg-muted/30 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-serif font-bold text-xl text-foreground">{booking.serviceName || 'Custom Booking'}</span>
                              <span className={`text-xs px-2 py-1 uppercase tracking-wider font-bold ${
                                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-muted-foreground font-sans text-sm">
                              {format(new Date(booking.eventDate), 'MMMM dd, yyyy')} • {booking.eventLocation}
                            </p>
                            <p className="text-muted-foreground font-sans text-sm">
                              {booking.serviceType.toUpperCase()} • {booking.guestCount || 'TBD'} Guests
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center text-muted-foreground italic font-serif">You have no bookings yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-card border border-border">
                <div className="p-6 md:p-8 border-b border-border flex justify-between items-center">
                  <h3 className="text-2xl font-serif text-foreground">Shop Orders</h3>
                  <Link href="/shop">
                    <Button variant="outline" className="border-primary text-primary rounded-none">Shop Now</Button>
                  </Link>
                </div>
                <div className="p-0">
                  {loadingOrders ? <div className="p-8 text-center">Loading...</div> :
                   orders && orders.length > 0 ? (
                    <div className="divide-y divide-border">
                      {orders.map(order => (
                        <div key={order.id} className="p-6 md:p-8 flex flex-col sm:flex-row justify-between gap-6 hover:bg-muted/30 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-serif font-bold text-lg text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className={`text-xs px-2 py-1 uppercase tracking-wider font-bold ${
                                order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-primary/20 text-primary'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-muted-foreground font-sans text-sm">
                              {format(new Date(order.createdAt), 'MMMM dd, yyyy')} • {order.items.length} items
                            </p>
                            <p className="text-primary font-bold font-sans">
                              GHS {order.total.toFixed(2)}
                            </p>
                          </div>
                          <div className="sm:self-center">
                            <Link href={`/receipt/${order.id}`}>
                              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                                <FileText className="w-4 h-4 mr-2" /> View Receipt
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center text-muted-foreground italic font-serif">You have no orders yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-card border border-border p-8 md:p-12">
                <h3 className="text-2xl font-serif text-foreground border-b border-border pb-4 mb-8">Profile Settings</h3>

                <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {profile?.email ? 'Email Address' : 'Phone Number'} (used to sign in — not editable here)
                    </label>
                    <Input disabled value={profile?.email || profile?.phone || ''} className="bg-muted border-none opacity-50 rounded-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input name="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="bg-background border-border rounded-none" />
                  </div>

                  <Button type="submit" disabled={savingProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif rounded-none px-8">
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </div>
            )}

            {/* REVIEW TAB */}
            {activeTab === 'review' && (
              <div className="bg-card border border-border p-8 md:p-12">
                <h3 className="text-2xl font-serif text-foreground border-b border-border pb-4 mb-8">Tell the World How We Did</h3>

                {reviewSubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <Star className="w-12 h-12 text-primary mx-auto fill-primary" />
                    <p className="text-foreground font-serif text-lg">Thank you for your feedback!</p>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Our team will review it shortly. Approved reviews appear publicly on our homepage.
                    </p>
                    <Button variant="outline" className="rounded-none mt-2" onClick={() => setReviewSubmitted(false)}>Leave Another Review</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" onClick={() => setReviewRating(n)} className="p-1">
                            <Star className={`w-7 h-7 transition-colors ${n <= reviewRating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Which event was this for? (optional)</label>
                      <Input placeholder="e.g. Wedding Reception, June 2026" value={reviewEventLabel} onChange={(e) => setReviewEventLabel(e.target.value)} className="bg-background border-border rounded-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Review</label>
                      <Textarea
                        required
                        placeholder="Tell us, and future customers, how the service went…"
                        value={reviewQuote}
                        onChange={(e) => setReviewQuote(e.target.value)}
                        className="bg-background border-border rounded-none resize-none"
                        rows={4}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your review will be checked by our team before it appears publicly — this usually takes a short while.
                    </p>
                    <Button type="submit" disabled={createTestimonial.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif rounded-none px-8">
                      {createTestimonial.isPending ? 'Submitting…' : 'Submit Review'}
                    </Button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
