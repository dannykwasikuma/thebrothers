import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ============================================================
// ADMIN STATS — calls the get_admin_stats() RPC, which already
// zeroes out revenue server-side for non-admin staff callers.
// ============================================================
export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  totalOrders: number;
  totalUsers: number;
  pendingBookings: number;
  pendingOrders: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data as AdminStats;
    },
  });
}

// ============================================================
// STAFF MANAGEMENT (Main Admin only — RLS enforces this server-side too)
// ============================================================
export interface StaffMember {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  staffId: string | null;
  staffTitle: string | null;
  status: 'active' | 'disabled';
  createdAt: string;
}

function mapStaff(row: any): StaffMember {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    staffId: row.staff_id,
    staffTitle: row.staff_title,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function useListStaff() {
  return useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapStaff);
    },
  });
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'disabled' }) => {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-staff'] }),
  });
}

/** Demotes a staff member back to a regular customer (no separate "delete" — this
 *  preserves their order/booking history while removing portal access). */
export function useRevokeStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer', staff_id: null, staff_title: null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-staff'] }),
  });
}

/** Promotes a staff member to a full second Admin. Only the Main Admin can do
 *  this — enforced server-side by the prevent_self_role_escalation trigger,
 *  not just in the UI. Does NOT set is_main_admin (that flag stays unique to
 *  the original Main Admin account, since some tabs/permissions key off it
 *  specifically rather than off role === 'admin'). */
export function usePromoteToAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
    },
  });
}

/** Demotes a second Admin back down to Staff. Same trigger-enforced
 *  restriction as promotion — only the Main Admin can call this successfully. */
export function useDemoteToStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').update({ role: 'staff' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
    },
  });
}

/** Lists everyone with role === 'admin' EXCEPT the Main Admin themself — this
 *  list is for managing secondary admins, and the Main Admin shouldn't see a
 *  "demote" control next to their own name (that account is permanent). */
export function useListAdmins() {
  return useQuery({
    queryKey: ['admin-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .eq('is_main_admin', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapStaff);
    },
  });
}

// ── Invite codes ──
export interface InviteCode {
  code: string;
  title: string;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

function mapInvite(row: any): InviteCode {
  return {
    code: row.code,
    title: row.title,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    active: row.active,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function useListInviteCodes() {
  return useQuery({
    queryKey: ['admin-invite-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_invite_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapInvite);
    },
  });
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useCreateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, maxUses, expiresInDays }: { title: string; maxUses: number; expiresInDays?: number }) => {
      const code = generateInviteCode();
      const { data, error } = await supabase
        .from('staff_invite_codes')
        .insert({
          code,
          title,
          max_uses: maxUses,
          expires_at: expiresInDays ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;
      return mapInvite(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-invite-codes'] }),
  });
}

export function useDeactivateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { error } = await supabase.from('staff_invite_codes').update({ active: false }).eq('code', code);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-invite-codes'] }),
  });
}

// ============================================================
// CUSTOMER MANAGEMENT (Main Admin only)
// ============================================================
export interface CustomerRecord {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  status: 'active' | 'disabled';
  createdAt: string;
}

function mapCustomer(row: any): CustomerRecord {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function useListCustomers(search?: string) {
  return useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').eq('role', 'customer');
      if (search?.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapCustomer);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, fullName, status }: { id: string; fullName?: string; status?: 'active' | 'disabled' }) => {
      const update: Record<string, unknown> = {};
      if (fullName !== undefined) update.full_name = fullName;
      if (status !== undefined) update.status = status;
      const { error } = await supabase.from('profiles').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-customers'] }),
  });
}

/** Anyone signed in can check this — needed by the staff signup page before
 *  it knows whether to show the invite-code form or a "ask your admin" message. */
export function useStaffSignupMode() {
  return useQuery({
    queryKey: ['staff-signup-mode'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_signup_mode');
      if (error) throw error;
      return data as 'admin_only' | 'invite_code';
    },
  });
}

export interface RedeemResult {
  ok: boolean;
  error?: string;
  staffId?: string;
}

/** Redeems an invite code for the currently signed-in user via the
 *  redeem_staff_invite() RPC, which validates the code and promotes
 *  their own profile to staff server-side. After a successful redeem,
 *  the caller must call refreshProfile() from useAuth() themselves —
 *  profile state lives in AuthProvider's local state, not React Query,
 *  so there's no query cache here to invalidate. */
export function useRedeemInviteCode() {
  return useMutation({
    mutationFn: async (code: string): Promise<RedeemResult> => {
      const { data, error } = await supabase.rpc('redeem_staff_invite', { invite_code: code });
      if (error) return { ok: false, error: error.message };
      return { ok: data.ok, error: data.error, staffId: data.staff_id };
    },
  });
}

// ============================================================
// ADMIN SETTINGS (notifications, staff signup mode) — Main Admin only
// ============================================================
export interface AdminSettings {
  staffSignupMode: 'admin_only' | 'invite_code';
  adminPhone: string;
  twilioSid: string;
  twilioToken: string;
  twilioFrom: string;
  notifyOnBooking: boolean;
  notifyOnOrder: boolean;
}

function mapSettings(row: any): AdminSettings {
  return {
    staffSignupMode: row.staff_signup_mode,
    adminPhone: row.admin_phone || '',
    twilioSid: row.twilio_sid || '',
    twilioToken: row.twilio_token || '',
    twilioFrom: row.twilio_from || '',
    notifyOnBooking: row.notify_on_booking,
    notifyOnOrder: row.notify_on_order,
  };
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (error) throw error;
      return mapSettings(data);
    },
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<AdminSettings>) => {
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (settings.staffSignupMode !== undefined) update.staff_signup_mode = settings.staffSignupMode;
      if (settings.adminPhone !== undefined) update.admin_phone = settings.adminPhone;
      if (settings.twilioSid !== undefined) update.twilio_sid = settings.twilioSid;
      if (settings.twilioToken !== undefined) update.twilio_token = settings.twilioToken;
      if (settings.twilioFrom !== undefined) update.twilio_from = settings.twilioFrom;
      if (settings.notifyOnBooking !== undefined) update.notify_on_booking = settings.notifyOnBooking;
      if (settings.notifyOnOrder !== undefined) update.notify_on_order = settings.notifyOnOrder;
      const { error } = await supabase.from('admin_settings').update(update).eq('id', 1);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}

/** Sends a one-off test WhatsApp message using the Main Admin's already-saved
 *  credentials. Calls a dedicated RPC that checks the caller is actually the
 *  Main Admin before sending — see send_test_whatsapp() in schema.sql. */
export function useSendTestNotification() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('send_test_whatsapp');
      if (error) throw error;
    },
  });
}
