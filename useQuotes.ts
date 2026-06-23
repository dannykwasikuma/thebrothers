import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface QuoteRequest {
  id: string;
  userId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  eventType: string | null;
  eventDate: string | null;
  estimatedGuests: string | null;
  budgetRange: string | null;
  details: string;
  status: 'new' | 'reviewing' | 'quoted' | 'closed';
  adminNotes: string | null;
  createdAt: string;
}

function mapQuoteRequest(row: any): QuoteRequest {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    eventType: row.event_type,
    eventDate: row.event_date,
    estimatedGuests: row.estimated_guests,
    budgetRange: row.budget_range,
    details: row.details,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
  };
}

export interface CreateQuoteRequestInput {
  fullName: string;
  email: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  estimatedGuests?: string;
  budgetRange?: string;
  details: string;
}

/** Submits a new quote request. Requires sign-in (unlike the general
 *  Contact form) so it can be tied to the customer's account and shown
 *  back to them in their own list of requests. */
export function useCreateQuoteRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: CreateQuoteRequestInput) => {
      if (!user) throw new Error('Please sign in to request a quote.');
      const { error } = await supabase.from('quote_requests').insert({
        user_id: user.id,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone || null,
        event_type: input.eventType || null,
        event_date: input.eventDate || null,
        estimated_guests: input.estimatedGuests || null,
        budget_range: input.budgetRange || null,
        details: input.details,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-quote-requests'] });
    },
  });
}

/** Customer's own quote requests. */
export function useListQuoteRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quote-requests', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapQuoteRequest);
    },
  });
}

/** Every quote request — RLS restricts the actual rows returned to
 *  staff/admin only. */
export function useListQuoteRequestsAdmin() {
  return useQuery({
    queryKey: ['admin-quote-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quote_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapQuoteRequest);
    },
  });
}

export function useUpdateQuoteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status?: QuoteRequest['status']; adminNotes?: string }) => {
      const row: Record<string, unknown> = {};
      if (status !== undefined) row.status = status;
      if (adminNotes !== undefined) row.admin_notes = adminNotes;
      const { error } = await supabase.from('quote_requests').update(row).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-quote-requests'] }),
  });
}
