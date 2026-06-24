import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBooking } from '@/hooks/useBookings';
import { useListServices } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Users, ClipboardList } from 'lucide-react';
import { playSuccess } from '@/lib/sounds';

const Booking: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, profile } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedServiceId = searchParams.get('service') || '';
  const preselectedCategory = (searchParams.get('category') as 'catering' | 'ushering') || 'catering';
  const preselectedSubcategory = searchParams.get('subcategory') || '';

  const [serviceCategory, setServiceCategory] = useState<'catering' | 'ushering'>(preselectedCategory);
  const { data: services, error: servicesError } = useListServices({ category: serviceCategory });
  if (servicesError) console.error('Failed to load services:', servicesError);
  const { toast } = useToast();
  const createBookingMutation = useCreateBooking();

  const [formData, setFormData] = useState({
    serviceId:     preselectedServiceId,
    eventDate:     '',
    eventLocation: '',
    guestCount:    '',
    notes:         preselectedSubcategory ? `Service type: ${preselectedSubcategory}` : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services?.find(s => s.id === formData.serviceId);

    createBookingMutation.mutate({
      serviceId:     formData.serviceId || undefined,
      serviceType:   serviceCategory,
      serviceName:   selectedService?.name || preselectedSubcategory || undefined,
      userName:      profile?.fullName || user?.email || 'Client',
      userEmail:     user?.email ?? undefined,
      userPhone:     user?.phone ?? undefined,
      eventDate:     formData.eventDate,
      eventLocation: formData.eventLocation,
      guestCount:    formData.guestCount || undefined,
      notes:         formData.notes || undefined,
    }, {
      onSuccess: (data: any) => {
        playSuccess();
        const id = data?.id || data?.[0]?.id;
        if (id) setLocation(`/booking/confirmation/${id}`);
        else setLocation('/account');
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err?.message || 'Failed to submit. Please try again.', variant: 'destructive' });
      },
    });
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div className="text-center mb-12">
            <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Your Event Awaits</span>
            <h1 className="text-4xl md:text-5xl font-display text-primary mt-3 mb-3">Book a Service</h1>
            <div className="section-rule" />
            <p className="text-muted-foreground font-serif italic text-lg">Secure The Brothers for your upcoming event.</p>
          </div>

          <div className="bg-card border border-border p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-5">
                <h3 className="text-xl font-serif text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <ClipboardList className="w-5 h-5 text-primary" /> Event Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Service Category</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => { setServiceCategory(e.target.value as 'catering' | 'ushering'); setFormData(prev => ({ ...prev, serviceId: '' })); }}
                      className="w-full h-11 px-3 bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="catering">Catering</option>
                      <option value="ushering">Ushering</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Specific Service</label>
                    <select name="serviceId" value={formData.serviceId} onChange={handleChange}
                      className="w-full h-11 px-3 bg-background border border-border text-foreground rounded-none focus:outline-none focus:border-primary text-sm">
                      <option value="">— Select a service —</option>
                      {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Event Date
                    </label>
                    <Input required type="date" name="eventDate" value={formData.eventDate} onChange={handleChange}
                      className="bg-background rounded-none border-border h-11 focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Event Location / Venue
                    </label>
                    <Input required name="eventLocation" value={formData.eventLocation} onChange={handleChange}
                      className="bg-background rounded-none border-border h-11 focus:border-primary"
                      placeholder="e.g., Kempinski Hotel, Accra" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans flex items-center gap-1">
                    <Users className="w-3 h-3" /> Estimated Guests
                  </label>
                  <Input name="guestCount" value={formData.guestCount} onChange={handleChange}
                    className="bg-background rounded-none border-border h-11 focus:border-primary" placeholder="e.g., 200" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Additional Details &amp; Requirements</label>
                  <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={5}
                    className="bg-background rounded-none border-border resize-none focus:border-primary"
                    placeholder="Tell us about your event — dietary requirements, theme, special requests…" />
                </div>
              </div>

              <Button type="submit" disabled={createBookingMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif text-lg h-14 rounded-none hover:scale-[1.01] transition-all shadow-lg shadow-primary/20">
                {createBookingMutation.isPending ? 'Submitting…' : 'Submit Booking Request'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;
