import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useGetCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

const Checkout: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: cart, isLoading } = useGetCart();
  const createOrderMutation = useCreateOrder();

  const [formData, setFormData] = useState({
    shippingName: '',
    shippingEmail: '',
    shippingPhone: '',
    shippingAddress: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | 'pay_on_arrival'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('mtn');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'momo' && !momoNumber) {
      toast({ title: 'MoMo Number required', variant: 'destructive' });
      return;
    }

    createOrderMutation.mutate({
      shippingName: formData.shippingName,
      shippingEmail: formData.shippingEmail || undefined,
      shippingPhone: formData.shippingPhone || undefined,
      shippingAddress: formData.shippingAddress || undefined,
      notes: formData.notes || undefined,
      paymentMethod,
      ...(paymentMethod === 'momo' ? { momoNumber, momoNetwork } : {}),
    }, {
      onSuccess: (order) => {
        toast({ title: 'Order Placed Successfully!' });
        setLocation(`/receipt/${order.id}`);
      },
      onError: (err: any) => {
        toast({ title: 'Checkout Failed', description: err?.message || 'Please try again.', variant: 'destructive' });
      },
    });
  };

  if (isLoading) return <div className="min-h-screen pt-32 pb-24 bg-background" />;
  if (!cart || cart.items.length === 0) {
    setLocation('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Almost There</span>
          <h1 className="text-4xl md:text-5xl font-display text-primary mt-3">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="bg-card border border-border p-8">
              <h2 className="text-2xl font-serif text-foreground mb-6 border-b border-border pb-2">Shipping Details</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input required name="shippingName" value={formData.shippingName} onChange={handleChange} className="rounded-none bg-background border-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input required type="email" name="shippingEmail" value={formData.shippingEmail} onChange={handleChange} className="rounded-none bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input required name="shippingPhone" value={formData.shippingPhone} onChange={handleChange} className="rounded-none bg-background border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Delivery Address / Location</label>
                  <Textarea required name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} className="rounded-none bg-background border-border resize-none" rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Order Notes (Optional)</label>
                  <Textarea name="notes" value={formData.notes} onChange={handleChange} className="rounded-none bg-background border-border resize-none" rows={2} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-8">
              <h2 className="text-2xl font-serif text-foreground mb-6 border-b border-border pb-2">Payment Method</h2>
              <div className="space-y-4">

                <div
                  className={`border p-4 cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}
                  onClick={() => setPaymentMethod('momo')}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'momo' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-serif font-bold text-lg text-foreground">Mobile Money (MoMo)</span>
                  </div>
                  {paymentMethod === 'momo' && (
                    <div className="pl-10 mt-4 space-y-4">
                      <select
                        value={momoNetwork}
                        onChange={(e) => setMomoNetwork(e.target.value)}
                        className="w-full h-10 px-3 bg-background border border-border rounded-none text-sm"
                      >
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodafone">Vodafone Cash</option>
                        <option value="airteltigo">AirtelTigo Money</option>
                      </select>
                      <Input
                        placeholder="MoMo Number (e.g. 024XXXXXXX)"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        className="rounded-none bg-background border-border"
                      />
                    </div>
                  )}
                </div>

                <div
                  className={`border p-4 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-serif font-bold text-lg text-foreground">Credit / Debit Card</span>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="pl-10 mt-4 space-y-4">
                      <p className="text-sm text-muted-foreground italic">Card payments aren't wired to a processor yet — choose MoMo or Pay on Arrival for now.</p>
                    </div>
                  )}
                </div>

                <div
                  className={`border p-4 cursor-pointer transition-all ${paymentMethod === 'pay_on_arrival' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}
                  onClick={() => setPaymentMethod('pay_on_arrival')}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'pay_on_arrival' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-serif font-bold text-lg text-foreground">Pay on Arrival</span>
                  </div>
                  {paymentMethod === 'pay_on_arrival' && (
                    <div className="pl-10 mt-2">
                      <p className="text-sm text-muted-foreground italic">Our team will collect payment when we meet you at your event or delivery location.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border p-8 sticky top-32 shadow-xl">
              <h2 className="text-2xl font-serif text-foreground mb-6 border-b border-border pb-3">Order Summary</h2>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm font-sans">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.quantity}x</span>
                      <span className="text-foreground line-clamp-1">{item.productName}</span>
                    </div>
                    <span className="text-foreground font-medium whitespace-nowrap ml-4">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 font-sans mb-8 border-t border-border pt-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>GHS {cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>Calculated later</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <span className="text-xl font-serif text-foreground font-bold">Total</span>
                  <span className="text-3xl font-serif text-primary font-bold">GHS {cart.total.toFixed(2)}</span>
                </div>
              </div>

              <Button type="submit" disabled={createOrderMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif text-lg h-14 rounded-none hover:scale-[1.01] transition-all shadow-lg shadow-primary/20">
                {createOrderMutation.isPending ? 'Processing…' : 'Complete Order'}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
