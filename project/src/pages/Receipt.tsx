import React from 'react';
import { useGetOrder } from '@/hooks/useOrders';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
const logoUrl = '/logo.png';
import { Printer, Download, ArrowLeft, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptProps {
  orderId: string;
}

const Receipt: React.FC<ReceiptProps> = ({ orderId }) => {
  const { data: order, isLoading } = useGetOrder(orderId);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="min-h-screen bg-background pt-32 pb-24" />;
  if (!order) return <div className="min-h-screen bg-background pt-32 pb-24 text-center">Order not found</div>;

  const paymentMethodLabel = order.paymentMethod === 'momo' ? 'Mobile Money (MoMo)'
                           : order.paymentMethod === 'card' ? 'Credit / Debit Card'
                           : order.paymentMethod === 'pay_on_arrival' ? 'Pay on Arrival'
                           : 'Standard Payment';

  const PaymentIcon = order.paymentMethod === 'momo' ? Smartphone
                    : order.paymentMethod === 'card' ? CreditCard
                    : Banknote;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Actions - Hidden when printing */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 no-print gap-4">
          <Link href="/shop">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Button>
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handlePrint} className="border-primary text-primary rounded-none">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
              <Printer className="w-4 h-4 mr-2" /> Print Receipt
            </Button>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-white text-black p-10 md:p-16 shadow-2xl border border-border/20 print:shadow-none print:border-none print:p-0 mx-auto">
          
          {/* Header */}
          <div className="flex flex-col items-center border-b border-gray-200 pb-8 mb-8">
            <img src={logoUrl} alt="The Brothers Logo" className="h-20 w-auto mb-4" />
            <h1 className="text-3xl font-display font-bold text-center uppercase tracking-widest text-[#0D0A07]">
              The Brothers
            </h1>
            <p className="text-sm font-sans text-gray-500 mt-2 uppercase tracking-widest">
              Ushering & Catering Services
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
            <div>
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-1">Receipt No.</p>
              <p className="text-lg font-serif font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-1">Date & Time</p>
              <p className="font-serif">{format(new Date(order.createdAt), 'MMMM dd, yyyy - HH:mm')}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-gray-50 p-6">
            <div>
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-serif font-bold text-lg">{order.shippingName}</p>
              <p className="font-sans text-gray-600">{order.shippingEmail}</p>
              <p className="font-sans text-gray-600">{order.shippingPhone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-2">Delivery Address</p>
              <p className="font-sans text-gray-600 whitespace-pre-line">{order.shippingAddress || 'N/A'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-10">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b-2 border-gray-800 text-sm uppercase tracking-wider text-gray-500">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-center">Qty</th>
                  <th className="pb-3 font-medium text-right">Unit Price</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 font-serif text-lg">{item.productName}</td>
                    <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-600">GHS {item.price.toFixed(2)}</td>
                    <td className="py-4 text-right font-medium">GHS {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-t-2 border-gray-800 pt-6">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Payment Method</p>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 text-sm font-medium rounded-full">
                  <PaymentIcon className="w-4 h-4 text-gray-600" />
                  {paymentMethodLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-400 font-sans uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              {order.notes && (
                <div className="mt-4 text-sm text-gray-500 italic">
                  Note: {order.notes}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 text-right">
              <div className="flex justify-between text-gray-500 mb-2">
                <span>Subtotal</span>
                <span>GHS {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 mb-4">
                <span>Tax & Fees</span>
                <span>GHS 0.00</span>
              </div>
              <div className="flex justify-between items-end border-t border-gray-200 pt-4">
                <span className="text-lg font-serif font-bold uppercase tracking-widest text-[#0D0A07]">Grand Total</span>
                <span className="text-4xl font-serif font-bold text-[#C9A84C]">GHS {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center text-gray-400 text-sm font-sans uppercase tracking-widest border-t border-gray-100 pt-8">
            Thank you for choosing The Brothers
          </div>

        </div>
      </div>
    </div>
  );
};

export default Receipt;
