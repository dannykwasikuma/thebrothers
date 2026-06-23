import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Booking {
  id: string;
  userId: string | null;
  serviceType: string;
  serviceName: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  eventDate: string;
  eventLocation: string | null;
  guestCount: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

function mapBooking(row: any): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    serviceType: row.service_type,
    serviceName: row.service_name,
    userName: row.user_name,
    userEmail: row.user_email,
    userPhone: row.user_phone,
    eventDate: row.event_date,
    eventLocation: row.event_location,
    guestCount: row.guest_count,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface CreateBookingInput {
  serviceId?: string;
  serviceType: string;
  serviceName?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  eventDate: string;
  eventLocation?: string;
  guestCount?: string;
  notes?: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      if (!user) throw new Error('You must be signed in to book a service.');

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          service_id: input.serviceId,
          service_type: input.serviceType,
          service_name: input.serviceName,
          user_name: input.userName,
          user_email: input.userEmail,
          user_phone: input.userPhone,
          event_date: input.eventDate,
          event_location: input.eventLocation,
          guest_count: input.guestCount,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return mapBooking(data);
      // Note: the WhatsApp/SMS alert to the Main Admin is sent automatically by a
      // database trigger (trg_notify_new_booking in schema.sql) the moment this row
      // is inserted — not from here. This keeps Twilio credentials entirely server-side,
      // so a customer's browser never needs read access to them.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}

/** Single booking lookup, used by the printable BookingReceipt page. RLS
 *  still applies — a customer can only fetch their own booking, staff/admin
 *  can fetch any. */
export function useGetBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['booking', bookingId],
    enabled: Boolean(bookingId),
    queryFn: async () => {
      const { data, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      if (error) throw error;
      return mapBooking(data);
    },
  });
}

/** Customer's own bookings (used in Account page). */
export function useListBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookings', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBooking);
    },
  });
}

/** All bookings — only staff/admin can actually read these rows (enforced by RLS). */
export function useListAdminBookings() {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapBooking);
    },
  });
}

/** Lets a customer cancel their own booking. Only works while status is
 *  'pending' or 'confirmed' — enforced server-side by RLS + a trigger (see
 *  supabase/fix_customer_cancel_booking.sql), not just this check, so a
 *  customer can never sneak through a cancel on a completed booking even
 *  if this client-side guard were somehow bypassed. */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status: string } }) => {
      const { error } = await supabase.from('bookings').update({ status: data.status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}
