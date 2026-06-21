import { useQuery, useMutation } from '@tanstack/react-query';
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
