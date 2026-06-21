import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, KeyRound, Copy, Ban, Trash2, Users } from 'lucide-react';
import {
  useListStaff,
  useUpdateStaffStatus,
  useRevokeStaff,
  useListInviteCodes,
  useCreateInviteCode,
  useDeactivateInviteCode,
  useAdminSettings,
  useUpdateAdminSettings,
} from '@/hooks/useAdmin';

const StaffManagementTab: React.FC = () => {
  const { toast } = useToast();

  const { data: settings } = useAdminSettings();
  const updateSettingsMutation = useUpdateAdminSettings();

  const { data: staffList, isLoading: loadingStaff } = useListStaff();
  const updateStatusMutation = useUpdateStaffStatus();
  const revokeMutation = useRevokeStaff();

  const { data: invites, isLoading: loadingInvites } = useListInviteCodes();
  const createInviteMutation = useCreateInviteCode();
  const deactivateInviteMutation = useDeactivateInviteCode();

  const [newEmail, setNewEmail] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [creatingSlot, setCreatingSlot] = useState(false);

  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteUses, setInviteUses] = useState('1');

  const handleSignupModeChange = (mode: 'admin_only' | 'invite_code') => {
    updateSettingsMutation.mutate({ staffSignupMode: mode }, {
      onSuccess: () => toast({ title: 'Setting Updated', description: `Staff signup mode set to ${mode === 'admin_only' ? 'Admin-created only' : 'Invite code self-registration'}.` }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  /** "Creating a staff slot by email" works differently than a localStorage-only
   *  version: there's no row to pre-create until the person has a real Supabase
   *  auth account, and the client SDK can't look up users by email. The practical
   *  approach is: generate a single-use invite code with the intended title, and
   *  share it with that person directly — same secure, server-validated flow as
   *  the general invite codes below, just scoped to one use. */
  const handleCreateStaffSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setCreatingSlot(true);
    createInviteMutation.mutate({ title: newTitle.trim() || 'Staff Member', maxUses: 1 }, {
      onSuccess: (invite) => {
        setCreatingSlot(false);
        toast({
          title: 'Invite Code Created',
          description: `Share code ${invite.code} with ${newEmail} — it's single-use and will activate their staff account.`,
        });
        setNewEmail('');
        setNewTitle('');
      },
      onError: (err: any) => {
        setCreatingSlot(false);
        toast({ title: 'Error', description: err?.message, variant: 'destructive' });
      },
    });
  };

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    createInviteMutation.mutate({ title: inviteTitle.trim() || 'Staff Member', maxUses: parseInt(inviteUses) || 1 }, {
      onSuccess: (invite) => {
        toast({ title: 'Invite Code Created', description: `Code ${invite.code} is ready to share.` });
        setInviteTitle('');
        setInviteUses('1');
      },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast({ title: 'Copied', description: `${code} copied to clipboard.` });
  };

  const handleRevokeStaff = (id: string) => {
    if (!confirm('Revoke this staff account? They will lose portal access immediately and become a regular customer.')) return;
    revokeMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Staff Revoked' }),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const handleStatusToggle = (id: string, currentStatus: 'active' | 'disabled') => {
    updateStatusMutation.mutate({ id, status: currentStatus === 'active' ? 'disabled' : 'active' });
  };

  return (
    <div className="space-y-8 max-w-4xl">

      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Staff Signup Mode
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Choose how new staff members get access to the portal.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSignupModeChange('admin_only')}
            className={`text-left p-5 border transition-all ${settings?.staffSignupMode === 'admin_only' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
          >
            <p className="font-serif text-foreground mb-1">Admin Creates Accounts</p>
            <p className="text-sm text-muted-foreground">You generate a single-use invite code for each person and share it directly with them.</p>
          </button>
          <button
            onClick={() => handleSignupModeChange('invite_code')}
            className={`text-left p-5 border transition-all ${settings?.staffSignupMode === 'invite_code' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
          >
            <p className="font-serif text-foreground mb-1">Invite Code Self-Registration</p>
            <p className="text-sm text-muted-foreground">Generate a reusable code and share it. Anyone with the code can redeem it at /staff-signup.</p>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-2 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Create a Single-Use Staff Invite
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Generates a one-time code intended for a specific person. They'll go to <code className="text-primary">/staff-signup</code> and enter it after creating their account.
        </p>
        <form onSubmit={handleCreateStaffSlot} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-primary uppercase tracking-wider">Their Email (for your reference)</label>
            <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="staff@example.com" className="rounded-none h-11" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-primary uppercase tracking-wider">Title / Role</label>
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Event Coordinator" className="rounded-none h-11" />
          </div>
          <Button type="submit" disabled={creatingSlot} className="rounded-none h-11">{creatingSlot ? 'Creating…' : 'Create Code'}</Button>
        </form>
      </div>

      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Invite Codes
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Generate a reusable code staff can redeem themselves at the Staff Signup page.</p>
        <form onSubmit={handleCreateInvite} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end mb-8">
          <div className="space-y-2">
            <label className="text-xs font-medium text-primary uppercase tracking-wider">Title / Role</label>
            <Input value={inviteTitle} onChange={e => setInviteTitle(e.target.value)} placeholder="e.g. Usher" className="rounded-none h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-primary uppercase tracking-wider">Max Uses</label>
            <Input value={inviteUses} onChange={e => setInviteUses(e.target.value)} type="number" min="1" className="rounded-none h-11" />
          </div>
          <Button type="submit" disabled={createInviteMutation.isPending} className="rounded-none h-11">Generate Code</Button>
        </form>

        <div className="space-y-3">
          {loadingInvites && <p className="text-sm text-muted-foreground italic">Loading…</p>}
          {!loadingInvites && invites?.length === 0 && <p className="text-sm text-muted-foreground italic">No invite codes yet.</p>}
          {invites?.map(inv => (
            <div key={inv.code} className="flex items-center justify-between p-4 border border-border bg-background flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-primary text-lg tracking-wider">{inv.code}</code>
                  <button onClick={() => handleCopyCode(inv.code)} className="text-muted-foreground hover:text-primary">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{inv.title} &middot; used {inv.usedCount}/{inv.maxUses} &middot; {inv.active ? 'active' : 'inactive'}</p>
              </div>
              {inv.active && (
                <Button size="sm" variant="outline" className="rounded-none text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => deactivateInviteMutation.mutate(inv.code)}>
                  <Ban className="w-3.5 h-3.5 mr-1" /> Deactivate
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border p-8">
        <h3 className="text-xl font-serif text-foreground mb-6">Current Staff ({staffList?.length ?? 0})</h3>
        <div className="space-y-3">
          {loadingStaff && <p className="text-sm text-muted-foreground italic">Loading…</p>}
          {!loadingStaff && staffList?.length === 0 && <p className="text-sm text-muted-foreground italic">No staff accounts yet.</p>}
          {staffList?.map(staff => (
            <div key={staff.id} className="flex items-center justify-between p-4 border border-border bg-background flex-wrap gap-3">
              <div>
                <p className="font-serif text-foreground">{staff.fullName || staff.email || staff.phone}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {staff.staffId} &middot; {staff.staffTitle} &middot; {staff.email || staff.phone}
                  {staff.status === 'disabled' && <span className="ml-2 text-destructive uppercase">Disabled</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-none h-8" onClick={() => handleStatusToggle(staff.id, staff.status)}>
                  {staff.status === 'active' ? 'Disable' : 'Re-enable'}
                </Button>
                <Button size="sm" variant="outline" className="rounded-none h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleRevokeStaff(staff.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffManagementTab;
