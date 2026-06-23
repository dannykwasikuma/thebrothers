import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useCreateQuoteRequest } from '@/hooks/useQuotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const RequestQuote: React.FC = () => {
  const { isSignedIn, isLoaded, profile, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createQuote = useCreateQuoteRequest();
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [estimatedGuests, setEstimatedGuests] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast({ title: 'Please describe your event', variant: 'destructive' });
      return;
    }
    createQuote.mutate(
      { fullName, email, phone: phone || undefined, eventType: eventType || undefined, eventDate: eventDate || undefined, estimatedGuests: estimatedGuests || undefined, budgetRange: budgetRange || undefined, details: details.trim() },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err: any) => toast({ title: 'Could Not Submit Request', description: err?.message, variant: 'destructive' }),
      }
    );
  };

  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0D0A07] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md text-center bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-10">
          <h1 className="text-2xl font-display text-[#C9A84C] mb-3">Sign In to Request a Quote</h1>
          <p className="text-[#F5F0E8]/60 text-sm mb-8">We tie your quote request to your account so our team can follow up and you can track its status.</p>
          <Link href={`/sign-in?redirect=${encodeURIComponent('/request-quote')}`}>
            <Button className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0A07] pt-32 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/ushering" className="inline-flex items-center gap-1.5 text-sm text-[#F5F0E8]/50 hover:text-[#C9A84C] mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Ushering
        </Link>

        {submitted ? (
          <div className="bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-10 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-[#C9A84C] mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Request Sent</h1>
            <p className="text-[#F5F0E8]/60 text-sm max-w-md mx-auto">
              Thank you — our team will review your event details and get back to you with a custom quote shortly.
            </p>
            <Button onClick={() => setLocation('/account')} className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11 mt-2">
              View My Account
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Large or Custom Events</span>
              <h1 className="text-4xl font-display text-[#F5F0E8] mt-3">Request a Quote</h1>
              <p className="text-[#F5F0E8]/60 mt-4 max-w-lg mx-auto">
                Tell us about your event and we'll put together a custom quote — perfect for large gatherings or anything that doesn't fit our standard packages.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-8 md:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Full Name</label>
                  <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Email</label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Phone (optional)</label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Event Type</label>
                  <Input placeholder="e.g. Wedding, Corporate Gala" value={eventType} onChange={(e) => setEventType(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Event Date</label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Estimated Guests</label>
                  <Input placeholder="e.g. 300-500" value={estimatedGuests} onChange={(e) => setEstimatedGuests(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Budget Range</label>
                  <Input placeholder="e.g. GHS 10,000-15,000" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Tell Us About Your Event</label>
                <Textarea
                  required
                  placeholder="What are you planning? Any specific services, themes, or requirements we should know about?"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none resize-none"
                  rows={5}
                />
              </div>

              <Button type="submit" disabled={createQuote.isPending} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-12">
                {createQuote.isPending ? 'Sending…' : 'Submit Request'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestQuote;
