import React from 'react';
import { useGetBooking } from '@/hooks/useBookings';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
const logoUrl = '/logo.png';
import { Printer, Download, ArrowLeft, MapPin, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface BookingReceiptProps {
  bookingId: string;
}

const BookingReceipt: React.FC<BookingReceiptProps> = ({ bookingId }) => {
  const { data: booking, isLoading } = useGetBooking(bookingId);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="min-h-screen bg-background pt-32 pb-24" />;
  if (!booking) return <div className="min-h-screen bg-background pt-32 pb-24 text-center">Booking not found</div>;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Actions - Hidden when printing */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 no-print gap-4">
          <Link href="/account">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Account
            </Button>
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handlePrint} className="border-primary text-primary rounded-none">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
              <Printer className="w-4 h-4 mr-2" /> Print
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
              Booking Confirmation
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
            <div>
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-1">Booking Reference</p>
              <p className="text-lg font-serif font-bold">#{booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-1">Requested On</p>
              <p className="font-serif">{format(new Date(booking.createdAt), 'MMMM dd, yyyy - HH:mm')}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-gray-50 p-6">
            <div>
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-2">Booked By</p>
              <p className="font-serif font-bold text-lg">{booking.userName}</p>
              <p className="font-sans text-gray-600">{booking.userEmail}</p>
              <p className="font-sans text-gray-600">{booking.userPhone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-2">Status</p>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="mb-10">
            <p className="text-xs text-gray-400 font-sans uppercase tracking-wider mb-4">Event Details</p>
            <div className="border-t-2 border-gray-800 pt-6">
              <p className="font-serif font-bold text-2xl mb-4">{booking.serviceName || booking.serviceType}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-gray-700">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Event Date</p>
                    <p>{format(new Date(booking.eventDate), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Location</p>
                    <p>{booking.eventLocation || 'To be confirmed'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Guests</p>
                    <p>{booking.guestCount || 'TBD'}</p>
                  </div>
                </div>
              </div>
              {booking.notes && (
                <div className="mt-6 text-sm text-gray-500 italic border-t border-gray-100 pt-4">
                  Note: {booking.notes}
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 text-center text-gray-400 text-sm font-sans uppercase tracking-widest border-t border-gray-100 pt-8">
            This confirms your booking request with The Brothers. Our team will be in touch to finalize details.
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingReceipt;
