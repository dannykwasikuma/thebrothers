import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

function mapNotification(row: any): AppNotification {
  return { id: row.id, title: row.title, body: row.body, link: row.link, read: row.read, createdAt: row.created_at };
}

/** The signed-in customer's own notifications, newest first. Populated
 *  entirely by server-side triggers (booking confirmed/cancelled, quote
 *  ready) — there's no client-side way to create one, by design. */
export function useListNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []).map(mapNotification);
    },
    // Notifications are time-sensitive (e.g. "your booking was just
    // confirmed") and there's no realtime subscription wiring it up live,
    // so a short poll keeps the bell reasonably fresh without needing the
    // customer to manually refresh the page.
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });
}
