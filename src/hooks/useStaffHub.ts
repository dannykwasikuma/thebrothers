import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface StaffPostAuthor {
  id: string;
  fullName: string | null;
  staffTitle: string | null;
  avatarUrl: string | null;
}

export interface StaffComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: StaffPostAuthor | null;
}

export interface StaffPost {
  id: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: StaffPostAuthor | null;
  comments: StaffComment[];
}

function mapAuthor(row: any): StaffPostAuthor | null {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    staffTitle: row.staff_title,
    avatarUrl: row.avatar_url,
  };
}

function mapComment(row: any): StaffComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
    author: mapAuthor(row.author),
  };
}

function mapPost(row: any): StaffPost {
  return {
    id: row.id,
    authorId: row.author_id,
    content: row.content,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    author: mapAuthor(row.author),
    comments: (row.comments ?? []).map(mapComment).sort(
      (a: StaffComment, b: StaffComment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
  };
}

const POST_SELECT = `
  *,
  author:profiles!staff_posts_author_id_fkey ( id, full_name, staff_title, avatar_url ),
  comments:staff_post_comments (
    *,
    author:profiles!staff_post_comments_author_id_fkey ( id, full_name, staff_title, avatar_url )
  )
`;

export function useListStaffPosts() {
  return useQuery({
    queryKey: ['staff-posts'],
    queryFn: async (): Promise<StaffPost[]> => {
      const { data, error } = await supabase
        .from('staff_posts')
        .select(POST_SELECT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapPost);
    },
  });
}

export interface CreateStaffPostInput {
  content: string;
  imageUrl?: string;
}

export function useCreateStaffPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStaffPostInput) => {
      if (!user) throw new Error('You must be signed in to post.');
      const { data, error } = await supabase
        .from('staff_posts')
        .insert({ author_id: user.id, content: input.content, image_url: input.imageUrl ?? null })
        .select(POST_SELECT)
        .single();
      if (error) throw error;
      return mapPost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-posts'] });
    },
  });
}

export function useDeleteStaffPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('staff_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-posts'] });
    },
  });
}

export function useAddStaffComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('You must be signed in to comment.');
      const { data, error } = await supabase
        .from('staff_post_comments')
        .insert({ post_id: postId, author_id: user.id, content })
        .select('*, author:profiles!staff_post_comments_author_id_fkey ( id, full_name, staff_title, avatar_url )')
        .single();
      if (error) throw error;
      return mapComment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-posts'] });
    },
  });
}

/** Uploads an image to the 'staff-hub' storage bucket and returns its public URL.
 *  Requires a public bucket named 'staff-hub' to be created once in the Supabase
 *  dashboard (Storage -> New bucket -> name it staff-hub -> toggle Public on). */
export async function uploadStaffHubImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('staff-hub').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('staff-hub').getPublicUrl(path);
  return data.publicUrl;
}

export function useUpdateStaffProfile() {
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (updates: { bio?: string; avatarUrl?: string }) => {
      if (!user) throw new Error('Not signed in.');
      const { error } = await supabase
        .from('profiles')
        .update({ bio: updates.bio, avatar_url: updates.avatarUrl })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
    },
  });
}
