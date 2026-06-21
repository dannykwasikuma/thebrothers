import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string | null;
  shippingName: string;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  notes: string | null;
  paymentMethod: string | null;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    shippingName: row.shipping_name,
    shippingEmail: row.shipping_email,
    shippingPhone: row.shipping_phone,
    shippingAddress: row.shipping_address,
    notes: row.notes,
    paymentMethod: row.payment_method,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((i: any) => ({
      productName: i.product_name,
      price: Number(i.price),
      quantity: i.quantity,
    })),
  };
}

export interface CreateOrderInput {
  shippingName: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  notes?: string;
  paymentMethod?: string;
  momoNumber?: string;
  momoNetwork?: string;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ data }: { data: CreateOrderInput }) => {
      if (!user) throw new Error('You must be signed in to check out.');

      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      if (cartError) throw cartError;
      if (!cartItems || cartItems.length === 0) throw new Error('Your cart is empty.');

      const total = cartItems.reduce((sum, i: any) => sum + Number(i.price) * i.quantity, 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          shipping_name: data.shippingName,
          shipping_email: data.shippingEmail,
          shipping_phone: data.shippingPhone,
          shipping_address: data.shippingAddress,
          notes: data.notes,
          payment_method: data.paymentMethod,
          momo_number: data.momoNumber,
          momo_network: data.momoNetwork,
          total,
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItemRows = cartItems.map((i: any) => ({
        order_id: order.id,
        product_name: i.product_name,
        price: i.price,
        quantity: i.quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemRows);
      if (itemsError) throw itemsError;

      // Empty the cart now that it's been converted into an order.
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      const fullOrder: Order = {
        ...mapOrder(order),
        items: orderItemRows.map((i) => ({ productName: i.product_name, price: Number(i.price), quantity: i.quantity })),
      };

      // Note: the WhatsApp/SMS alert to the Main Admin is sent automatically by a
      // database trigger (trg_notify_after_order_items in schema.sql) the moment
      // order_items are inserted above — not from here. This keeps Twilio
      // credentials entirely server-side, never exposed to a customer's browser.

      return fullOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

/** Single order lookup, used by the Receipt page. RLS already ensures the
 *  caller can only see their own order unless they're staff/admin. */
export function useGetOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    enabled: Boolean(orderId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      return mapOrder(data);
    },
  });
}

export function useListOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['orders', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapOrder);
    },
  });
}

export function useListAdminOrders() {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapOrder);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status: string } }) => {
      const { error } = await supabase.from('orders').update({ status: data.status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}
