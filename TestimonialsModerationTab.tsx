import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Star, Check, X, Trash2, Info } from 'lucide-react';
import { useListTestimonialsAdmin, useApproveTestimonial, useDeleteTestimonial } from '@/hooks/useCatalog';

const TestimonialsModerationTab: React.FC = () => {
  const { toast } = useToast();
  const { data: testimonials, isLoading, error } = useListTestimonialsAdmin();
  if (error) console.error('Failed to load testimonials (admin):', error);
  const approveMutation = useApproveTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const pending = testimonials?.filter(t => !t.approved) ?? [];
  const approved = testimonials?.filter(t => t.approved) ?? [];

  const handleApprove = (id: string, approve: boolean) => {
    approveMutation.mutate({ id, approved: approve }, {
      onSuccess: () => toast({ title: approve ? 'Review Published' : 'Review Hidden' }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Review Deleted' }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const Stars: React.FC<{ n: number }> = ({ n }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />)}
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-primary/5 border border-primary/20 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Customers can submit a review from their account. New reviews stay hidden from the public site until you approve them here.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-serif text-foreground mb-4">Pending Review ({pending.length})</h3>
        {isLoading ? <p className="text-sm text-muted-foreground italic">Loading…</p> : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No reviews waiting for approval.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(t => (
              <div key={t.id} className="p-4 border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-foreground">{t.authorName}{t.eventLabel ? ` — ${t.eventLabel}` : ''}</p>
                  <Stars n={t.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{t.quote}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="rounded-none gap-1.5" onClick={() => handleApprove(t.id, true)}><Check className="w-3.5 h-3.5" /> Publish</Button>
                  <Button size="sm" variant="outline" className="rounded-none gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-serif text-foreground mb-4">Published ({approved.length})</h3>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Nothing published yet.</p>
        ) : (
          <div className="space-y-3">
            {approved.map(t => (
              <div key={t.id} className="p-4 border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-foreground">{t.authorName}{t.eventLabel ? ` — ${t.eventLabel}` : ''}</p>
                  <Stars n={t.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{t.quote}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="rounded-none gap-1.5" onClick={() => handleApprove(t.id, false)}><X className="w-3.5 h-3.5" /> Unpublish</Button>
                  <Button size="sm" variant="outline" className="rounded-none gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(t.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsModerationTab;
