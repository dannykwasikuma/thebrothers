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

// ── Admin: Services management ──────────────────────────────────────────
export interface AdminService extends Service {
  active: boolean;
}

function mapServiceAdmin(row: any): AdminService {
  return { ...mapService(row), active: row.active };
}

/** Lists every service including inactive ones — for the Admin Catalog tab,
 *  where the Main Admin needs to see (and re-activate) hidden items too. */
export function useListAllServicesAdmin() {
  return useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapServiceAdmin);
    },
  });
}

export interface ServiceInput {
  name: string;
  category: 'catering' | 'ushering';
  subcategory?: string;
  description?: string;
  price: number;
  priceUnit?: string;
  imageUrl?: string;
  featured?: boolean;
  active?: boolean;
}

function serviceInputToRow(input: Partial<ServiceInput>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.category !== undefined) row.category = input.category;
  if (input.subcategory !== undefined) row.subcategory = input.subcategory || null;
  if (input.description !== undefined) row.description = input.description || null;
  if (input.price !== undefined) row.price = input.price;
  if (input.priceUnit !== undefined) row.price_unit = input.priceUnit || null;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl || null;
  if (input.featured !== undefined) row.featured = input.featured;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

/** Creates a new service. RLS (see schema.sql "Admin manages services")
 *  rejects this server-side for anyone whose role isn't 'admin', so this
 *  is safe to expose only behind the Admin UI without extra checks here. */
export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      const { error } = await supabase.from('services').insert(serviceInputToRow(input));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/** Updates any subset of a service's fields — used both for full edits and
 *  for the quick inline "just change the price" case from the Catalog tab. */
export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ServiceInput> & { id: string }) => {
      const { error } = await supabase.from('services').update(serviceInputToRow(input)).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/** Soft-deletes by setting active=false rather than a hard DELETE, so a
 *  service that's already referenced by past bookings keeps working there
 *  (bookings store their own copy of service_name/service_type) while
 *  disappearing from anything customer-facing going forward. */
export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').update({ active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
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

// ── Admin: Products management ──────────────────────────────────────────
export interface AdminProduct extends Product {
  active: boolean;
}

function mapProductAdmin(row: any): AdminProduct {
  return { ...mapProduct(row), active: row.active };
}

export function useListAllProductsAdmin() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapProductAdmin);
    },
  });
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  active?: boolean;
}

function productInputToRow(input: Partial<ProductInput>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description || null;
  if (input.price !== undefined) row.price = input.price;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl || null;
  if (input.category !== undefined) row.category = input.category || null;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const { error } = await supabase.from('products').insert(productInputToRow(input));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProductInput> & { id: string }) => {
      const { error } = await supabase.from('products').update(productInputToRow(input)).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/** Soft-delete, same reasoning as useDeleteService — past orders keep their
 *  own copy of product_name/price in order_items regardless. */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').update({ active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string | null;
  imageUrl: string;
  startingPrice: number | null;
  priceUnit: string | null;
  description: string | null;
}

function mapGalleryItem(row: any): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.image_url,
    startingPrice: row.starting_price !== null && row.starting_price !== undefined ? Number(row.starting_price) : null,
    priceUnit: row.price_unit,
    description: row.description,
  };
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
      return (data ?? []).map(mapGalleryItem);
    },
  });
}

// ── Admin: Gallery management ───────────────────────────────────────────
export interface GalleryInput {
  title: string;
  category?: string;
  imageUrl: string;
  startingPrice?: number | null;
  priceUnit?: string;
  description?: string;
}

function galleryInputToRow(input: Partial<GalleryInput>) {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.category !== undefined) row.category = input.category || null;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.startingPrice !== undefined) row.starting_price = input.startingPrice;
  if (input.priceUnit !== undefined) row.price_unit = input.priceUnit || null;
  if (input.description !== undefined) row.description = input.description || null;
  return row;
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GalleryInput) => {
      const { error } = await supabase.from('gallery_items').insert(galleryInputToRow(input));
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<GalleryInput> & { id: string }) => {
      const { error } = await supabase.from('gallery_items').update(galleryInputToRow(input)).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

/** Gallery has no `active` flag in the schema (unlike services/products), so
 *  removing an item here is a real, permanent delete — the Admin UI should
 *  confirm with the person before calling this. */
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

/** Uploads a gallery photo to the 'gallery' storage bucket and returns its
 *  public URL. Requires a public bucket named 'gallery' to be created once
 *  in the Supabase dashboard (Storage -> New bucket -> name it gallery ->
 *  toggle Public on) — same pattern as the existing 'staff-hub' bucket. */
export async function uploadGalleryImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('gallery').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('gallery').getPublicUrl(path);
  return data.publicUrl;
}

export interface Testimonial {
  id: string;
  authorName: string;
  eventLabel: string | null;
  quote: string;
  rating: number;
}

export function useListTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        authorName: row.author_name,
        eventLabel: row.event_label,
        quote: row.quote,
        rating: row.rating,
      })) as Testimonial[];
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

// ============================================================
// CUSTOMER FEEDBACK / REVIEWS — public submission, admin-approved
// ============================================================
// Separate from `testimonials` above (the small hand-picked homepage set).
// This is the open inbox: anyone can submit, but a submission only shows
// publicly once the Main Admin approves it from the Admin Reviews tab —
// see supabase/migration_02.sql for the customer_feedback table + policies.
export interface CustomerFeedback {
  id: string;
  authorName: string;
  eventLabel: string | null;
  rating: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

function mapFeedback(row: any): CustomerFeedback {
  return {
    id: row.id,
    authorName: row.author_name,
    eventLabel: row.event_label,
    rating: row.rating,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** Public-facing list — only ever returns approved entries, enforced by RLS
 *  even if this query were called with no filter at all. */
export function useListApprovedFeedback() {
  return useQuery({
    queryKey: ['feedback-approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapFeedback);
    },
  });
}

export interface FeedbackInput {
  authorName: string;
  eventLabel?: string;
  rating: number;
  message: string;
}

/** Submits a new piece of customer feedback. Works for guests and signed-in
 *  customers alike — if signed in, the row is linked to their account via
 *  user_id, but that's optional (RLS allows inserts from anyone). */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FeedbackInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('customer_feedback').insert({
        user_id: user?.id ?? null,
        author_name: input.authorName,
        event_label: input.eventLabel || null,
        rating: input.rating,
        message: input.message,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedback-approved'] }),
  });
}

// ── Admin: feedback moderation ──────────────────────────────────────────
/** Lists every submission regardless of status, for the Main Admin's review
 *  queue. RLS restricts this to staff/admin callers (see migration_02.sql). */
export function useListAllFeedbackAdmin() {
  return useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapFeedback);
    },
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase.from('customer_feedback').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-approved'] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customer_feedback').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-approved'] });
    },
  });
}

// ============================================================
// PUBLIC STAFF DIRECTORY ("Our Staff" page)
// ============================================================
// Reads from the public_staff_directory VIEW (see migration_02.sql), which
// only ever exposes safe fields (name, title, bio, photo) for staff who
// opted in themselves or were featured by the Main Admin — never email,
// phone, status, or any other private profile field.
export interface PublicStaffMember {
  id: string;
  fullName: string | null;
  staffTitle: string | null;
  publicRoleLabel: string | null;
  bio: string | null;
  avatarUrl: string | null;
  featuredByAdmin: boolean;
}

function mapPublicStaff(row: any): PublicStaffMember {
  return {
    id: row.id,
    fullName: row.full_name,
    staffTitle: row.staff_title,
    publicRoleLabel: row.public_role_label,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    featuredByAdmin: row.featured_by_admin,
  };
}

export function useListPublicStaff() {
  return useQuery({
    queryKey: ['public-staff-directory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_staff_directory')
        .select('*')
        .order('featured_by_admin', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapPublicStaff);
    },
  });
}

/** Lets a staff/admin member toggle whether THEY show up on the public Our
 *  Staff page. Separate from useUpdateStaffProfile (bio/avatar, in
 *  useStaffHub.ts) since this lives on the public-page opt-in, not the
 *  internal Team Feed editor — kept here so OurStaff.tsx and Account-style
 *  profile screens can both reach it without importing the Staff Hub hook. */
export function useUpdatePublicVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, show }: { userId: string; show: boolean }) => {
      const { error } = await supabase.from('profiles').update({ show_on_public_page: show }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['public-staff-directory'] }),
  });
}

/** Lets any Admin (Main Admin or a promoted second Admin) feature/unfeature
 *  someone with role staff/admin on the public page, independent of whether
 *  that person has opted in themselves. Enforced server-side: the updated
 *  prevent_self_role_escalation trigger (see migration_02.sql) only allows
 *  this column to change when the caller's own profile has role='admin' or
 *  is_main_admin=true — a plain staff account gets a clear Postgres error
 *  if it tries to call this directly. */
export function useSetStaffFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, featured }: { userId: string; featured: boolean }) => {
      const { error } = await supabase.from('profiles').update({ featured_by_admin: featured }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['public-staff-directory'] }),
  });
}

// ============================================================
// CONTACT MESSAGES — Admin inbox
// ============================================================
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

function mapContactMessage(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function useListContactMessages() {
  return useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapContactMessage);
    },
  });
}

export function useUpdateContactMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactMessage['status'] }) => {
      const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-messages'] }),
  });
}

// ============================================================
// QUOTE REQUESTS
// ============================================================
export interface QuoteRequestInput {
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  location: string;
  details: string;
}

/** Anyone can submit a quote request — stored as a contact_message with
 *  subject "Quote Request" so it lands in the existing admin inbox. */
export function useSubmitQuoteRequest() {
  return useMutation({
    mutationFn: async (input: QuoteRequestInput) => {
      const message = [
        `Event Type: ${input.eventType}`,
        `Event Date: ${input.eventDate}`,
        `Guest Count: ${input.guestCount}`,
        `Location: ${input.location}`,
        `Details: ${input.details}`,
      ].join('\n');
      const { error } = await supabase.from('contact_messages').insert({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        subject: `Quote Request — ${input.eventType}`,
        message,
      });
      if (error) throw error;
    },
  });
}
