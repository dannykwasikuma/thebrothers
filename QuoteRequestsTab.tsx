import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Calendar, Users, Wallet, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { useListQuoteRequestsAdmin, useUpdateQuoteRequest, type QuoteRequest } from '@/hooks/useQuotes';

const statusStyles: Record<QuoteRequest['status'], string> = {
  new: 'bg-blue-500/20 text-blue-500',
  reviewing: 'bg-yellow-500/20 text-yellow-500',
  quoted: 'bg-primary/20 text-primary',
  closed: 'bg-muted text-muted-foreground',
};

const QuoteRequestsTab: React.FC = () => {
  const { toast } = useToast();
  const { data: quotes, isLoading, error } = useListQuoteRequestsAdmin();
  if (error) console.error('Failed to load quote requests:', error);
  const updateQuote = useUpdateQuoteRequest();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const handleOpen = (q: QuoteRequest) => {
    if (expandedId === q.id) { setExpandedId(null); return; }
    setExpandedId(q.id);
    setNotesDraft(q.adminNotes || '');
    if (q.status === 'new') updateQuote.mutate({ id: q.id, status: 'reviewing' });
  };

  const handleSaveNotes = (id: string) => {
    updateQuote.mutate({ id, adminNotes: notesDraft }, { onSuccess: () => toast({ title: 'Notes Saved' }) });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <FileQuestion className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-serif text-foreground">Quote Requests</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground italic">Loading…</p>
      ) : !quotes || quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No quote requests yet.</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="border border-border bg-card">
              <button onClick={() => handleOpen(q)} className="w-full text-left p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-foreground truncate">{q.fullName}</p>
                    <span className={`text-xs px-2 py-0.5 uppercase tracking-wider font-bold rounded-full ${statusStyles[q.status]}`}>{q.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{q.eventType || 'Custom Event'} {q.estimatedGuests ? `· ${q.estimatedGuests} guests` : ''}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{format(new Date(q.createdAt), 'MMM dd, yyyy')}</span>
              </button>

              {expandedId === q.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  <p className="text-foreground whitespace-pre-line">{q.details}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    {q.eventDate && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(q.eventDate), 'MMM dd, yyyy')}</div>}
                    {q.estimatedGuests && <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {q.estimatedGuests}</div>}
                    {q.budgetRange && <div className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {q.budgetRange}</div>}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 hover:text-primary"><Mail className="w-3.5 h-3.5" /> {q.email}</a>
                    {q.phone && <a href={`tel:${q.phone}`} className="flex items-center gap-1.5 hover:text-primary"><Phone className="w-3.5 h-3.5" /> {q.phone}</a>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-primary uppercase tracking-wider">Internal Notes</label>
                    <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} className="rounded-none resize-none" rows={2} placeholder="Quoted amount, follow-up notes, etc." />
                    <Button size="sm" variant="outline" className="rounded-none" onClick={() => handleSaveNotes(q.id)}>Save Notes</Button>
                  </div>

                  <div className="flex gap-2">
                    {(['reviewing', 'quoted', 'closed'] as QuoteRequest['status'][]).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={q.status === s ? 'default' : 'outline'}
                        className="rounded-none capitalize"
                        onClick={() => updateQuote.mutate({ id: q.id, status: s })}
                      >
                        Mark {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsTab;
