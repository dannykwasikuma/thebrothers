import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquarePlus, X, Send } from 'lucide-react';
import { useListApprovedFeedback, useSubmitFeedback } from '@/hooks/useCatalog';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

/** Star-rating picker used inside the feedback form — five clickable stars,
 *  filled up to whichever the person has hovered/clicked. */
const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className="p-0.5"
        >
          <Star className={`w-6 h-6 transition-colors ${(hover || value) >= n ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#3A3430]'}`} />
        </button>
      ))}
    </div>
  );
};

/**
 * Drop-in section: a "Share Your Experience" prompt that opens a small
 * feedback form, plus a grid of already-approved reviews underneath. Used
 * on both Home and Gallery so customers can leave/read feedback from
 * either page, per the brief — every approved review automatically shows
 * in both places since they all read from the same table.
 */
const CustomerReviews: React.FC<{ heading?: string }> = ({ heading = 'What Our Clients Say' }) => {
  const { profile } = useAuth();
  const { data: reviews, isLoading } = useListApprovedFeedback();
  const submitFeedback = useSubmitFeedback();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  useEffect(() => { if (profile?.fullName && !authorName) setAuthorName(profile.fullName); }, [profile?.fullName]);
  const [eventLabel, setEventLabel] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) {
      toast({ title: 'A Couple Things Missing', description: 'Please add your name and a short message.', variant: 'destructive' });
      return;
    }
    submitFeedback.mutate(
      { authorName: authorName.trim(), eventLabel: eventLabel.trim() || undefined, rating, message: message.trim() },
      {
        onSuccess: () => {
          toast({ title: 'Thank You!', description: "Your review has been submitted and will appear once it's reviewed." });
          setFormOpen(false);
          setMessage('');
          setEventLabel('');
          setRating(5);
        },
        onError: (err: any) => toast({ title: 'Could Not Submit', description: err?.message, variant: 'destructive' }),
      }
    );
  };

  return (
    <section className="py-24 px-4 bg-[#0D0A07] border-t border-[#C9A84C]/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
        >
          <div>
            <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Customer Reviews</span>
            <h2 className="text-3xl md:text-5xl font-display text-[#C9A84C] mt-4">{heading}</h2>
          </div>
          <Button
            onClick={() => setFormOpen((o) => !o)}
            className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none gap-2 self-start md:self-auto"
          >
            {formOpen ? <X className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
            {formOpen ? 'Close' : 'Share Your Experience'}
          </Button>
        </motion.div>

        {formOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-6 md:p-8 mb-14 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Your Name</label>
                <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Event (optional)</label>
                <Input value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} placeholder="e.g. Wedding Reception, East Legon"
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Your Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Your Review</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4}
                placeholder="Tell us — and future clients — how the service went…"
                className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none resize-none" />
            </div>
            <p className="text-xs text-[#F5F0E8]/40">Reviews are checked before they appear publicly.</p>
            <Button type="submit" disabled={submitFeedback.isPending} className="bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none gap-2">
              <Send className="w-4 h-4" /> {submitFeedback.isPending ? 'Submitting…' : 'Submit Review'}
            </Button>
          </motion.form>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <div key={i} className="h-56 bg-muted/10 animate-pulse rounded-none" />)}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <div key={r.id} className="h-full bg-[#0A0806] border border-[#C9A84C]/12 rounded-none p-8 flex flex-col">
                <div className="flex text-[#C9A84C] mb-5">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[#F5F0E8]/70 font-serif italic mb-7 flex-grow text-sm leading-relaxed">"{r.message}"</p>
                <div className="border-t border-[#C9A84C]/10 pt-5">
                  <p className="font-serif font-bold text-[#F5F0E8]">{r.authorName}</p>
                  {r.eventLabel && <p className="text-xs font-sans text-[#C9A84C]/60 mt-1 tracking-wider uppercase">{r.eventLabel}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#F5F0E8]/40 font-serif italic py-8">
            No reviews yet — be the first to share your experience.
          </p>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
