import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageSquareReply, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { useListContactMessages, useUpdateContactMessageStatus, type ContactMessage } from '@/hooks/useCatalog';

const statusStyles: Record<ContactMessage['status'], string> = {
  new: 'bg-blue-500/20 text-blue-500',
  read: 'bg-muted text-muted-foreground',
  replied: 'bg-green-500/20 text-green-500',
};

const ContactMessagesTab: React.FC = () => {
  const { data: messages, isLoading, error } = useListContactMessages();
  if (error) console.error('Failed to load contact messages:', error);
  const updateStatus = useUpdateContactMessageStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleOpen = (msg: ContactMessage) => {
    setExpandedId(expandedId === msg.id ? null : msg.id);
    if (msg.status === 'new') updateStatus.mutate({ id: msg.id, status: 'read' });
  };

  const newCount = messages?.filter(m => m.status === 'new').length ?? 0;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Inbox className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-serif text-foreground">Contact Messages {newCount > 0 && <span className="text-sm font-sans text-primary">({newCount} new)</span>}</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground italic">Loading…</p>
      ) : !messages || messages.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No messages yet — submissions from the Contact page will appear here.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="border border-border bg-card">
              <button onClick={() => handleOpen(msg)} className="w-full text-left p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-foreground truncate">{msg.name}</p>
                    <span className={`text-xs px-2 py-0.5 uppercase tracking-wider font-bold rounded-full ${statusStyles[msg.status]}`}>{msg.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{msg.subject || msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{format(new Date(msg.createdAt), 'MMM dd, yyyy')}</span>
              </button>

              {expandedId === msg.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                  <p className="text-foreground whitespace-pre-line">{msg.message}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-primary"><Mail className="w-3.5 h-3.5" /> {msg.email}</a>
                    {msg.phone && <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-primary"><Phone className="w-3.5 h-3.5" /> {msg.phone}</a>}
                  </div>
                  {msg.status !== 'replied' && (
                    <Button size="sm" className="rounded-none gap-1.5" onClick={() => updateStatus.mutate({ id: msg.id, status: 'replied' })}>
                      <MessageSquareReply className="w-3.5 h-3.5" /> Mark as Replied
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessagesTab;
