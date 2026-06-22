import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, UserCog, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useListPublicStaff, useUpdatePublicVisibility } from '@/hooks/useCatalog';
import { useUpdateStaffProfile, uploadStaffHubImage } from '@/hooks/useStaffHub';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Public, customer-facing "meet the team" page. Pulls from
 * public_staff_directory (a view that only ever exposes name/title/bio/photo
 * — see migration_02.sql), so it's safe for signed-out visitors to browse.
 * Two ways someone ends up listed here: they opted in themselves from the
 * panel below (only visible to signed-in staff/admin), or the Main Admin
 * featured them from the Admin Catalog/Staff tab.
 */
const OurStaff: React.FC = () => {
  const { profile, isLoaded } = useAuth();
  const { data: staff, isLoading } = useListPublicStaff();
  const updateVisibility = useUpdatePublicVisibility();
  const updateProfile = useUpdateStaffProfile();
  const { toast } = useToast();

  const isStaffOrAdmin = profile?.role === 'staff' || profile?.role === 'admin';

  const [editingMine, setEditingMine] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleToggleVisibility = (show: boolean) => {
    if (!profile) return;
    updateVisibility.mutate(
      { userId: profile.id, show },
      {
        onSuccess: () => toast({ title: show ? 'You\'re Now Listed Publicly' : 'Removed From Public Page' }),
        onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
      }
    );
  };

  const handleSaveMine = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatarUrl;
      if (avatarFile) avatarUrl = await uploadStaffHubImage(avatarFile, profile.id);
      await updateProfile.mutateAsync({ bio: bioDraft, avatarUrl: avatarUrl || undefined });
      toast({ title: 'Profile Updated' });
      setEditingMine(false);
      setAvatarFile(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 mt-12 text-center mb-16">
        <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Get To Know Us</span>
        <h1 className="text-4xl md:text-6xl font-display text-primary mt-4 mb-6">Our Staff</h1>
        <p className="text-xl font-serif text-muted-foreground italic max-w-2xl mx-auto">
          The people behind every event — meet the team that makes it happen.
        </p>
      </div>

      {/* Self-service opt-in panel, shown only to signed-in staff/admin */}
      {isLoaded && isStaffOrAdmin && profile && (
        <div className="max-w-3xl mx-auto px-4 mb-16">
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-primary" />
                <p className="font-serif text-foreground">
                  {profile.showOnPublicPage ? "You're listed on this page." : "You're not on this page yet."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none gap-1.5"
                  onClick={() => handleToggleVisibility(!profile.showOnPublicPage)}
                  disabled={updateVisibility.isPending}
                >
                  {profile.showOnPublicPage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {profile.showOnPublicPage ? 'Hide Me' : 'Show Me Here'}
                </Button>
                <Button size="sm" className="rounded-none" onClick={() => setEditingMine((s) => !s)}>
                  {editingMine ? 'Cancel' : (profile.bio || profile.avatarUrl) ? 'Edit My Bio' : 'Add My Bio & Photo'}
                </Button>
              </div>
            </div>

            {editingMine && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-4 mb-5">
                  {(avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl) ? (
                    <img
                      src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl!}
                      alt={profile.fullName || 'You'}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-serif font-medium flex-shrink-0">
                      {initials(profile.fullName)}
                    </div>
                  )}
                  <label className="text-sm text-primary cursor-pointer hover:underline">
                    Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <Textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="A short bio for customers to see — who you are, what you do here…"
                  rows={3}
                  className="rounded-none bg-background border-border resize-none mb-4"
                />
                <Button size="sm" disabled={saving} onClick={handleSaveMine} className="rounded-none">
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  This is the same bio &amp; photo shown on the internal Team Feed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-muted animate-pulse" />)}
          </div>
        ) : staff && staff.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {staff.map((member) => (
              <motion.div key={member.id} variants={fadeIn} className="bg-card border border-border p-8 text-center relative">
                {member.featuredByAdmin && (
                  <span className="absolute top-3 right-3 text-primary" title="Featured">
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                )}
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.fullName || 'Staff'} className="w-24 h-24 rounded-full object-cover mx-auto mb-5" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-display text-2xl mx-auto mb-5">
                    {initials(member.fullName)}
                  </div>
                )}
                <h3 className="font-serif text-xl text-foreground">{member.fullName || 'Team Member'}</h3>
                {(member.publicRoleLabel || member.staffTitle) && (
                  <p className="text-primary text-xs uppercase tracking-widest mt-1">{member.publicRoleLabel || member.staffTitle}</p>
                )}
                {member.bio && <p className="text-muted-foreground text-sm font-sans mt-4 leading-relaxed">{member.bio}</p>}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-serif italic">No team members listed yet — check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OurStaff;
