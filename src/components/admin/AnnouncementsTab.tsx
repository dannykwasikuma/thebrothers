import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  useListAnnouncements,
  useCreateAnnouncement,
  useToggleAnnouncement,
  useDeleteAnnouncement,
} from '@/hooks/useAnnouncements';

const AnnouncementsTab: React.FC = () => {
  const { toast } = useToast();
  const { data: announcements, isLoading } = useListAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const toggleAnnouncement = useToggleAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    createAnnouncement.mutate(
      { message: message.trim(), linkUrl: linkUrl.trim() || undefined, linkLabel: linkLabel.trim() || undefined },
      {
        onSuccess: () => {
          toast({ title: 'Announcement Posted', description: 'It will now show on the homepage.' });
          setMessage('');
          setLinkUrl('');
          setLinkLabel('');
        },
        onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
      }
    );
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-2 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" /> Post a Homepage Announcement
        </h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Shown as a dismissible banner near the top of the homepage. Posting a new one
          automatically becomes the active banner — older ones stay in your history below
          but won't show unless re-activated.
        </p>

        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. We're now open for Christmas bookings — reserve your date early!"
              className="rounded-none bg-background border-border resize-none"
              rows={2}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Link (optional)</label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/booking" className="rounded-none h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-primary uppercase tracking-wider font-sans">Link Label (optional)</label>
              <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Book Now" className="rounded-none h-11" />
            </div>
          </div>
          <Button type="submit" disabled={createAnnouncement.isPending || !message.trim()} className="rounded-none">
            {createAnnouncement.isPending ? 'Posting…' : 'Post Announcement'}
          </Button>
        </form>
      </div>

      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-6">History</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !announcements || announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 p-4 border border-border bg-background">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm">{a.message}</p>
                  {a.linkUrl && (
                    <p className="text-xs text-primary mt-1">{a.linkLabel || a.linkUrl} → {a.linkUrl}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none h-8"
                    onClick={() => toggleAnnouncement.mutate({ id: a.id, active: !a.active })}
                  >
                    {a.active ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                    {a.active ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => deleteAnnouncement.mutate(a.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsTab;
