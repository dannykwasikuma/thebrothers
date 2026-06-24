import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSubmitQuoteRequest } from '@/hooks/useCatalog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PhoneInput from '@/components/PhoneInput';
import { CheckCircle2, FileText, Loader2 } from 'lucide-react';

const EVENT_TYPES = [
  'Wedding Reception', 'Corporate Event', 'Birthday Party', 'Funeral/Memorial',
  'Outdoor Party', 'Private Dinner', 'Buffet Event', 'Ushering Service',
  'School/Hostel Catering', 'Other',
];

const QuoteRequest: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const submit = useSubmitQuoteRequest();
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: profile?.fullName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    location: '',
    details: '',
  });

  React.useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        name: f.name || profile.fullName || '',
        email: f.email || profile.email || '',
      }));
    }
  }, [profile?.id]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventType) {
      toast({ title: 'Select an event type', variant: 'destructive' });
      return;
    }
    submit.mutate(form, {
      onSuccess: () => setDone(true),
      onError: (err: any) => toast({ title: 'Could Not Submit', description: err?.message, variant: 'destructive' }),
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Custom Events</span>
            <h1 className="text-4xl md:text-5xl font-display text-primary mt-4 mb-4">Request a Quote</h1>
            <p className="text-muted-foreground font-serif italic text-lg max-w-xl mx-auto">
              Tell us about your event and we'll put together a personalised quote — usually within 24 hours.
            </p>
          </div>

          {done ? (
            <div className="bg-card border border-border p-12 text-center space-y-5">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
              <h2 className="text-2xl font-display text-primary">Quote Request Sent!</h2>
              <p className="text-muted-foreground font-serif">
                We've received your request and will get back to you within 24 hours with a personalised quote.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <Link href="/"><Button variant="outline" className="rounded-none">Back to Home</Button></Link>
                <Link href="/booking"><Button className="rounded-none">Book Directly Instead</Button></Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border p-8 md:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-primary uppercase tracking-wider">Your Name</label>
                  <Input required value={form.name} onChange={set('name')} className="rounded-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary uppercase tracking-wider">Email Address</label>
                  <Input required type="email" value={form.email} onChange={set('email')} className="rounded-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary uppercase tracking-wider">Phone Number</label>
                <PhoneInput value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-primary uppercase tracking-wider">Event Type</label>
                  <select required value={form.eventType} onChange={set('eventType')}
                    className="h-10 px-3 w-full bg-background border border-border rounded-none text-sm text-foreground">
                    <option value="">Select type…</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary uppercase tracking-wider">Event Date</label>
                  <Input required type="date" value={form.eventDate} onChange={set('eventDate')}
                    min={new Date().toISOString().split('T')[0]} className="rounded-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-primary uppercase tracking-wider">Expected Guests</label>
                  <Input required placeholder="e.g. 150" value={form.guestCount} onChange={set('guestCount')} className="rounded-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-primary uppercase tracking-wider">Event Location</label>
                  <Input required placeholder="e.g. Kumasi City Hotel" value={form.location} onChange={set('location')} className="rounded-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-primary uppercase tracking-wider">Additional Details</label>
                <Textarea required rows={5} value={form.details} onChange={set('details')}
                  placeholder="Describe your requirements — menu preferences, setup style, special requests, dietary needs, etc."
                  className="rounded-none resize-none" />
              </div>

              <Button type="submit" disabled={submit.isPending}
                className="w-full btn-shimmer text-[#0D0A07] font-serif text-lg h-12 rounded-none gap-2">
                {submit.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : <><FileText className="w-4 h-4" /> Submit Quote Request</>
                }
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QuoteRequest;
