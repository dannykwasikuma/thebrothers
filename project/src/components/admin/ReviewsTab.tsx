import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { useListAllFeedbackAdmin, useUpdateFeedbackStatus, useDeleteFeedback } from '@/hooks/useCatalog';

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all';

/**
 * Moderation queue for customer-submitted feedback (separate from the
 * curated `testimonials` table — see migration_02.sql). New submissions
 * land here as "pending" and only show on the public site once approved,
 * which keeps spam/abuse off the live pages without needing extra
 * external moderation tools.
 */
const ReviewsTab: React.FC = () => {
  const { toast } = useToast();
  const { data: feedback, isLoading } = useListAllFeedbackAdmin();
  const updateStatus = useUpdateFeedbackStatus();
  const deleteFeedback = useDeleteFeedback();
  const [filter, setFilter] = useState<FilterTab>('pending');

  const filtered = feedback?.filter((f) => filter === 'all' || f.status === filter) ?? [];
  const pendingCount = feedback?.filter((f) => f.status === 'pending').length ?? 0;

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: 'approved' }, {
      onSuccess: () => toast({ title: 'Review Approved', description: 'It will now show on the public site.' }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const handleReject = (id: string) => {
    updateStatus.mutate({ id, status: 'rejected' }, {
      onSuccess: () => toast({ title: 'Review Rejected' }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const handleDelete = (id: string, author: string) => {
    if (!confirm(`Permanently delete this review from ${author}?`)) return;
    deleteFeedback.mutate(id, {
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'pending', label: `Pending${pendingCount ? ` (${pendingCount})` : ''}` },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="bg-card border border-border p-6 md:p-8 max-w-4xl">
      <h3 className="text-xl font-serif text-foreground mb-2">Customer Reviews</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Reviews customers submit from the Home or Gallery page land here first. Approve to publish them publicly, or reject to keep them hidden.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <Button key={t.key} size="sm" variant={filter === t.key ? 'default' : 'outline'} className="rounded-none" onClick={() => setFilter(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground italic">Loading…</p>}
        {filtered.map((f) => (
          <div key={f.id} className="border border-border bg-background p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-serif font-bold text-foreground">{f.authorName}</p>
                  <span className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold ${
                    f.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    f.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-destructive/20 text-destructive'
                  }`}>{f.status}</span>
                </div>
                {f.eventLabel && <p className="text-xs text-muted-foreground mt-0.5">{f.eventLabel}</p>}
                <div className="flex text-primary mt-2">
                  {[...Array(f.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
              </div>
              <div className="flex gap-2">
                {f.status !== 'approved' && (
                  <Button size="sm" variant="outline" className="rounded-none h-8 text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => handleApprove(f.id)}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                )}
                {f.status !== 'rejected' && (
                  <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => handleReject(f.id)}>
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                )}
                <Button size="sm" variant="outline" className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(f.id, f.authorName)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-foreground/80 font-sans text-sm mt-3 leading-relaxed">{f.message}</p>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground italic">Nothing here.</p>}
      </div>
    </div>
  );
};

export default ReviewsTab;
