import React from 'react';
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/hooks/useCart';
import { Link } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { playClick, playError, playSuccess } from '@/lib/sounds';

const Cart: React.FC = () => {
  const { data: cart, isLoading } = useGetCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const { toast } = useToast();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    playClick();
    updateItemMutation.mutate({ id: itemId, quantity: newQuantity });
  };

  const handleRemove = (itemId: string) => {
    playError();
    removeItemMutation.mutate(itemId, {
      onSuccess: () => toast({ title: "Item removed" }),
    });
  };

  const handleClear = () => {
    playError();
    clearCartMutation.mutate(undefined, {
      onSuccess: () => toast({ title: "Cart cleared" }),
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background pt-32 pb-24 flex items-center justify-center"><div className="animate-pulse w-16 h-16 bg-primary/20 rounded-full" /></div>;
  }

  const isEmpty = !cart || cart.items.length === 0;
  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-display text-primary mb-10">Your Cart</h1>

        {isEmpty ? (
          <div className="bg-card border border-border p-16 text-center">
            <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground opacity-20 mb-6" />
            <h2 className="text-2xl font-serif text-foreground mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground font-sans mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif px-8 h-12 rounded-none">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border">
                {cart.items.map((item, idx) => (
                  <div key={item.id} className={`p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 ${idx !== 0 ? 'border-t border-border' : ''}`}>
                    <div className="flex-grow">
                      <h3 className="text-xl font-serif text-foreground mb-2">{item.productName}</h3>
                      <p className="text-primary font-bold">GHS {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border bg-background">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateItemMutation.isPending}
                          className="p-2 hover:bg-muted text-foreground disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-sans">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateItemMutation.isPending}
                          className="p-2 hover:bg-muted text-foreground"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleClear} disabled={clearCartMutation.isPending} className="text-muted-foreground border-border rounded-none">
                  Clear Cart
                </Button>
                <Link href="/shop">
                  <Button variant="link" className="text-primary font-serif">Continue Shopping</Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border p-8 sticky top-32">
                <h3 className="text-2xl font-serif text-foreground border-b border-border pb-4 mb-6">Order Summary</h3>
                <div className="space-y-4 font-sans mb-8">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>GHS {cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="text-lg font-serif text-foreground font-bold">Total</span>
                    <span className="text-2xl font-serif text-primary font-bold">GHS {cart.total.toFixed(2)}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif text-lg h-14 rounded-none">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
