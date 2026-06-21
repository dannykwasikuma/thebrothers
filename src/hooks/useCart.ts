import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

function mapCartItem(row: any): CartItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    price: Number(row.price),
    quantity: row.quantity,
  };
}

export function useGetCart() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cart', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Cart> => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const items = (data ?? []).map(mapCartItem);
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ data }: { data: { productId: string; quantity: number } }) => {
      if (!user) throw new Error('You must be signed in to add items to your cart.');

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, price')
        .eq('id', data.productId)
        .single();
      if (productError) throw productError;

      // If it's already in the cart, bump the quantity instead of erroring on the unique constraint.
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', data.productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + data.quantity })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: data.productId,
          product_name: product.name,
          price: product.price,
          quantity: data.quantity,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}
