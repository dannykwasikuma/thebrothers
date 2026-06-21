import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Announcement {
  id: string;
  message: string;
  linkUrl: string | null;
  linkLabel: string | null;
  active: boolean;
  createdAt: string;
}

function mapAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    message: row.message,
    linkUrl: row.link_url,
    linkLabel: row.link_label,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function useActiveAnnouncement() {
  return useQuery({
    queryKey: ['announcement-active'],
    queryFn: async (): Promise<Announcement | null> => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapAnnouncement(data) : null;
    },
  });
}

export function useListAnnouncements() {
  return useQuery({
    queryKey: ['announcements-all'],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapAnnouncement);
    },
  });
}

export interface CreateAnnouncementInput {
  message: string;
  linkUrl?: string;
  linkLabel?: string;
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          message: input.message,
          link_url: input.linkUrl || null,
          link_label: input.linkLabel || null,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return mapAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-active'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
    },
  });
}

export function useToggleAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('announcements').update({ active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-active'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement-active'] });
      queryClient.invalidateQueries({ queryKey: ['announcements-all'] });
    },
  });
}
