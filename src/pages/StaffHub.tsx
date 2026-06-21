import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useListStaffPosts,
  useCreateStaffPost,
  useDeleteStaffPost,
  useAddStaffComment,
  useUpdateStaffProfile,
  uploadStaffHubImage,
  type StaffPost,
} from '@/hooks/useStaffHub';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ImagePlus, Send, Trash2, MessageCircle, ShieldAlert, UserCog, X } from 'lucide-react';

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

const Avatar: React.FC<{ url?: string | null; name?: string | null; size?: number }> = ({ url, name, size = 40 }) => (
  url ? (
    <img src={url} alt={name || 'Staff'} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div
      className="rounded-full bg-primary/15 border border-primary/30 text-primary flex items-center justify-center font-serif font-medium flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  )
);

const PostCard: React.FC<{ post: StaffPost; currentUserId?: string; isMainAdmin: boolean }> = ({ post, currentUserId, isMainAdmin }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const deletePost = useDeleteStaffPost();
  const addComment = useAddStaffComment();
  const { toast } = useToast();

  const canDelete = currentUserId === post.authorId || isMainAdmin;

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate({ postId: post.id, content: commentText.trim() }, {
      onSuccess: () => setCommentText(''),
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="p-5 flex items-start gap-3">
        <Avatar url={post.author?.avatarUrl} name={post.author?.fullName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-serif text-foreground font-medium">{post.author?.fullName || 'Staff Member'}</p>
              <p className="text-xs text-muted-foreground">
                {post.author?.staffTitle ? `${post.author.staffTitle} · ` : ''}
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            {canDelete && (
              <button
                onClick={() => deletePost.mutate(post.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="mt-3 text-foreground font-sans whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>
      </div>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="w-full max-h-[480px] object-cover" />
      )}

      <div className="px-5 py-3 border-t border-border flex items-center gap-4">
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments.length > 0 ? `${post.comments.length} comment${post.comments.length === 1 ? '' : 's'}` : 'Comment'}
        </button>
      </div>

      {showComments && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar url={c.author?.avatarUrl} name={c.author?.fullName} size={30} />
              <div className="bg-muted rounded-md px-3 py-2 flex-1">
                <p className="text-xs font-medium text-foreground">{c.author?.fullName || 'Staff'}</p>
                <p className="text-sm text-foreground/90">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="flex items-center gap-2 pt-1">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="rounded-full bg-background border-border h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0" disabled={!commentText.trim() || addComment.isPending}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

const StaffHub: React.FC = () => {
  const { isLoaded, isSignedIn, profile } = useAuth();
  const { toast } = useToast();
  const { data: posts, isLoading } = useListStaffPosts();
  const createPost = useCreateStaffPost();
  const updateProfile = useUpdateStaffProfile();

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  if (!isLoaded) return <div className="min-h-screen bg-background pt-32" />;

  if (!isSignedIn || !profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-serif text-foreground">Staff Only</h1>
          <p className="text-muted-foreground">The Team Feed is reserved for staff and admin accounts.</p>
        </div>
      </div>
    );
  }

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !profile) return;

    let imageUrl: string | undefined;
    try {
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadStaffHubImage(imageFile, profile.id);
      }
    } catch (err: any) {
      setUploading(false);
      toast({ title: 'Image Upload Failed', description: err?.message, variant: 'destructive' });
      return;
    }
    setUploading(false);

    createPost.mutate({ content: content.trim(), imageUrl }, {
      onSuccess: () => {
        setContent('');
        clearImage();
      },
      onError: (err: any) => toast({ title: 'Error', description: err?.message, variant: 'destructive' }),
    });
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    let avatarUrl = profile.avatarUrl;
    try {
      if (avatarFile) {
        avatarUrl = await uploadStaffHubImage(avatarFile, profile.id);
      }
      await updateProfile.mutateAsync({ bio: bioDraft, avatarUrl: avatarUrl || undefined });
      toast({ title: 'Profile Updated' });
      setEditingProfile(false);
      setAvatarFile(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Internal</span>
            <h1 className="text-3xl font-display text-primary mt-1">Team Feed</h1>
          </div>
          <Button variant="outline" size="sm" className="rounded-none gap-1.5" onClick={() => setEditingProfile((s) => !s)}>
            <UserCog className="w-4 h-4" /> My Profile
          </Button>
        </div>

        {editingProfile && (
          <div className="bg-card border border-border rounded-md p-6 mb-8">
            <div className="flex items-center gap-4 mb-5">
              <Avatar url={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl} name={profile.fullName} size={64} />
              <div>
                <label className="text-sm text-primary cursor-pointer hover:underline">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                </label>
                <p className="text-xs text-muted-foreground mt-1">{profile.fullName} · {profile.staffTitle || profile.role}</p>
              </div>
            </div>
            <Textarea
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              placeholder="Short bio — tell the team a bit about yourself…"
              className="rounded-none bg-background border-border resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" className="rounded-none" disabled={savingProfile} onClick={handleSaveProfile}>
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <form onSubmit={handlePost} className="bg-card border border-border rounded-md p-5 mb-8">
          <div className="flex items-start gap-3">
            <Avatar url={profile.avatarUrl} name={profile.fullName} />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share an update from an event, a photo, or a note for the team…"
              className="rounded-none bg-background border-border resize-none flex-1"
              rows={3}
            />
          </div>

          {imagePreview && (
            <div className="relative mt-3 ml-[52px]">
              <img src={imagePreview} alt="" className="max-h-64 rounded-md object-cover" />
              <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 ml-[52px]">
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              <ImagePlus className="w-4 h-4" /> Add Photo
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            </label>
            <Button type="submit" size="sm" className="rounded-none" disabled={!content.trim() || createPost.isPending || uploading}>
              {uploading ? 'Uploading…' : createPost.isPending ? 'Posting…' : 'Post'}
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-md" />)}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={profile.id} isMainAdmin={profile.isMainAdmin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No posts yet. Be the first to share an update with the team.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffHub;
