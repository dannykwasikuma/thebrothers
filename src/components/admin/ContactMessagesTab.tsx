import React, { useState } from 'react';
import { useListContactMessages, useUpdateContactMessageStatus } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MailOpen, MessageSquare, Check, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

type Filter = 'new' | 'read' | 'replied' | 'all';

const ContactMessagesTab: React.FC = () => {
  const { toast } = useToast();
  const { data: messages, isLoading } = useListContactMessages();
  const updateStatus = useUpdateContactMessageStatus();
  const [filter, setFilter] = useState<Filter>('new');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = messages?.filter(m => filter === 'all' || m.status === filter) ?? [];
  const newCount = messages?.filter(m => m.status === 'new').length ?? 0;

  const markAs = (id: string, status: 'read' | 'replied') => {
    updateStatus.mutate({ id, status }, {
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'new', label: `New${newCount ? ` (${newCount})` : ''}` },
    { key: 'read', label: 'Read' },
    { key: 'replied', label: 'Replied' },
    { key: 'all', label: 'All' },
  ];

  const statusIcon = (s: string) =>
    s === 'new' ? <Clock className="w-3.5 h-3.5 text-yellow-500" /> :
    s === 'replied' ? <Check className="w-3.5 h-3.5 text-green-500" /> :
    <MailOpen className="w-3.5 h-3.5 text-muted-foreground" />;

  return (
    <div className="bg-card border border-border p-6 md:p-8 max-w-4xl">
      <h3 className="text-xl font-serif text-foreground mb-1">Contact Inbox</h3>
      <p className="text-sm text-muted-foreground mb-6">Messages sent through the Contact page and Quote Request form.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <Button key={f.key} size="sm" variant={filter === f.key ? 'default' : 'outline'} className="rounded-none" onClick={() => setFilter(f.key)}>
            {f.key === 'new' && newCount > 0 && <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5" />}
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground italic">Loading…</p>}
        {filtered.map(msg => (
          <div key={msg.id} className={`border border-border bg-background transition-colors ${msg.status === 'new' ? 'border-l-2 border-l-yellow-500' : ''}`}>
            <button
              className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
              onClick={() => {
                setExpanded(expanded === msg.id ? null : msg.id);
                if (msg.status === 'new') markAs(msg.id, 'read');
              }}
            >
              <Mail className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-bold text-foreground">{msg.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">{statusIcon(msg.status)} {msg.status}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{format(new Date(msg.createdAt), 'MMM dd, yyyy · HH:mm')}</span>
                </div>
                {msg.subject && <p className="text-sm text-primary font-medium mt-0.5">{msg.subject}</p>}
                <p className="text-sm text-muted-foreground truncate mt-0.5">{msg.message}</p>
              </div>
            </button>

            {expanded === msg.id && (
              <div className="border-t border-border p-5 space-y-4 bg-background/50">
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {msg.email}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                  {msg.phone && (
                    <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="w-3.5 h-3.5" /> {msg.phone}
                    </a>
                  )}
                </div>
                <p className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message to Brothers Catering')}`}
                    target="_blank" rel="noopener noreferrer"
                  >
                    <Button size="sm" className="rounded-none gap-1.5" onClick={() => markAs(msg.id, 'replied')}>
                      <MessageSquare className="w-3.5 h-3.5" /> Reply via Email
                    </Button>
                  </a>
                  {msg.status !== 'replied' && (
                    <Button size="sm" variant="outline" className="rounded-none" onClick={() => markAs(msg.id, 'replied')}>
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark as Replied
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-4">No messages here.</p>
        )}
      </div>
    </div>
  );
};

export default ContactMessagesTab;
