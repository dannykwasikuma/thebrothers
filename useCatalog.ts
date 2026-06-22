import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Service {
  id: string;
  name: string;
  category: 'catering' | 'ushering';
  subcategory: string | null;
  description: string | null;
  price: number;
  priceUnit: string | null;
  imageUrl: string | null;
  featured: boolean;
}

function mapService(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    price: Number(row.price),
    priceUnit: row.price_unit,
    imageUrl: row.image_url,
    featured: row.featured,
  };
}

export function useListServices(filters?: { category?: string }) {
  return useQuery({
    queryKey: ['services', filters?.category],
    queryFn: async () => {
      let query = supabase.from('services').select('*').eq('active', true);
      if (filters?.category) query = query.eq('category', filters.category);
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapService);
    },
  });
}

export interface ServiceInput {
  name: string;
  category: 'catering' | 'ushering';
  subcategory?: string | null;
  description?: string | null;
  price: number;
  priceUnit?: string | null;
  imageUrl?: string | null;
  featured?: boolean;
  active?: boolean;
}

function serviceInputToRow(input: Partial<ServiceInput>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.category !== undefined) row.category = input.category;
  if (input.subcategory !== undefined) row.subcategory = input.subcategory;
  if (input.description !== undefined) row.description = input.description;
  if (input.price !== undefined) row.price = input.price;
  if (input.priceUnit !== undefined) row.price_unit = input.priceUnit;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.featured !== undefined) row.featured = input.featured;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

/** Admin-only: lists EVERY service including inactive ones, so the admin
 *  dashboard can manage items that are hidden from the public site. The
 *  public-facing useListServices() above intentionally only shows active=true. */
export function useListServicesAdmin() {
  return useQuery({
    queryKey: ['services', 'admin-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapService);
    },
  });
}

function invalidateServiceQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['services'] });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      const { error } = await supabase.from('services').insert(serviceInputToRow(input));
      if (error) throw error;
    },
    onSuccess: () => invalidateServiceQueries(queryClient),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ServiceInput> & { id: string }) => {
      const { error } = await supabase.from('services').update(serviceInputToRow(input)).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateServiceQueries(queryClient),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateServiceQueries(queryClient),
  });
}

export function useListFeaturedServices() {
  return useQuery({
    queryKey: ['services', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapService);
    },
  });
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  rating: number | null;
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    category: row.category,
    rating: row.rating ? Number(row.rating) : null,
  };
}

export function useListProducts(filters?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ['products', filters?.search, filters?.category],
    queryFn: async () => {
      let query = supabase.from('products').select('*').eq('active', true);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
}

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
  rating?: number | null;
  active?: boolean;
}

function productInputToRow(input: Partial<ProductInput>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description;
  if (input.price !== undefined) row.price = input.price;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.category !== undefined) row.category = input.category;
  if (input.rating !== undefined) row.rating = input.rating;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export function useListProductsAdmin() {
  return useQuery({
    queryKey: ['products', 'admin-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    },
  });
}

function invalidateProductQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['products'] });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const { error } = await supabase.from('products').insert(productInputToRow(input));
      if (error) throw error;
    },
    onSuccess: () => invalidateProductQueries(queryClient),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProductInput> & { id: string }) => {
      const { error } = await supabase.from('products').update(productInputToRow(input)).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProductQueries(queryClient),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => invalidateProductQueries(queryClient),
  });
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string | null;
  imageUrl: string;
}

export function useListGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        imageUrl: row.image_url,
      })) as GalleryItem[];
    },
  });
}

export interface GalleryItemInput {
  title: string;
  category?: string | null;
  imageUrl: string;
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GalleryItemInput) => {
      const { error } = await supabase.from('gallery_items').insert({
        title: input.title,
        category: input.category ?? null,
        image_url: input.imageUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<GalleryItemInput> & { id: string }) => {
      const row: Record<string, unknown> = {};
      if (input.title !== undefined) row.title = input.title;
      if (input.category !== undefined) row.category = input.category;
      if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
      const { error } = await supabase.from('gallery_items').update(row).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

/** Uploads an image to the shared "site-images" Storage bucket (created by
 *  supabase/setup_storage_bucket.sql) and returns its public URL, ready to
 *  save into services.image_url, products.image_url, or
 *  gallery_items.image_url. `folder` just keeps files organized in Storage
 *  (e.g. "services", "products", "gallery") — it has no effect on access. */
export async function uploadSiteImage(file: File, folder: 'services' | 'products' | 'gallery'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('site-images').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('site-images').getPublicUrl(path);
  return data.publicUrl;
}

export interface Testimonial {
  id: string;
  authorName: string;
  eventLabel: string | null;
  quote: string;
  rating: number;
  approved: boolean;
}

function mapTestimonial(row: any): Testimonial {
  return {
    id: row.id,
    authorName: row.author_name,
    eventLabel: row.event_label,
    quote: row.quote,
    rating: row.rating,
    approved: row.approved,
  };
}

/** Public-facing: only ever returns approved testimonials (enforced by RLS
 *  too, so this filter is for clarity, not the actual security boundary). */
export function useListTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapTestimonial);
    },
  });
}

/** Admin/staff-facing: returns every testimonial, approved or not, so there's
 *  something to moderate. RLS only allows staff/admin to actually see the
 *  unapproved rows here. */
export function useListTestimonialsAdmin() {
  return useQuery({
    queryKey: ['testimonials', 'admin-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapTestimonial);
    },
  });
}

export interface TestimonialInput {
  authorName: string;
  eventLabel?: string | null;
  quote: string;
  rating: number;
}

/** Lets a signed-in customer submit their own testimonial. It's saved with
 *  approved=false (enforced server-side by a trigger, not just this code)
 *  so it won't show on the public site until staff/admin approves it. */
export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TestimonialInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('You need to be signed in to leave a review.');
      const { error } = await supabase.from('testimonials').insert({
        author_id: userData.user.id,
        author_name: input.authorName,
        event_label: input.eventLabel ?? null,
        quote: input.quote,
        rating: input.rating,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

export function useApproveTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from('testimonials').update({ approved }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

export interface StaffDirectoryEntry {
  id: string;
  fullName: string | null;
  staffTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

/** Public-facing "Our Staff" page data. Backed by the get_staff_directory()
 *  security definer function (see supabase/fix_public_staff_directory.sql),
 *  NOT a direct query against profiles — profiles' RLS deliberately doesn't
 *  let anonymous visitors read staff rows, and this function only returns
 *  name/title/bio/avatar, never email/phone/staff_id. Only staff/admin whose
 *  bio is filled in show up here (set from the Team Feed "My Profile" form). */
export function useListStaffDirectory() {
  return useQuery({
    queryKey: ['staff-directory'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_directory');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        staffTitle: row.staff_title,
        bio: row.bio,
        avatarUrl: row.avatar_url,
      })) as StaffDirectoryEntry[];
    },
  });
}

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/** Submits the public contact form — works for guests too, no sign-in required.
 *  Backed by the contact_messages table, which has an RLS policy explicitly
 *  allowing inserts from anyone (see supabase/schema.sql). */
export function useSubmitContactForm() {
  return useMutation({
    mutationFn: async (formData: ContactFormInput) => {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message,
      });
      if (error) throw error;
    },
  });
}
