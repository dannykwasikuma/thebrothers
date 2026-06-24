import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, MapPin, Users, Printer, ArrowLeft, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { BUSINESS, whatsappLink } from '@/lib/business';
import { playSuccess } from '@/lib/sounds';

interface BookingConfirmationProps { bookingId: string; }

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ bookingId }) => {
  const { data: booking, isLoading } = useGetBooking(bookingId);

  useEffect(() => { playSuccess(); }, []);

  if (isLoading) return <div className="min-h-screen bg-background pt-32 flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!booking) return <div className="min-h-screen bg-background pt-32 text-center text-muted-foreground">Booking not found.</div>;

  const waMessage = `Hello! I just submitted a booking request (ID: ${booking.id.slice(0, 8).toUpperCase()}) for ${booking.serviceName || booking.serviceType} on ${format(new Date(booking.eventDate), 'MMMM dd, yyyy')}. Please confirm.`;

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back link — hidden when printing */}
        <div className="no-print mb-6">
          <Link href="/account">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground rounded-none">
              <ArrowLeft className="w-4 h-4 mr-2" /> My Account
            </Button>
          </Link>
        </div>

        {/* Confirmation card */}
        <div className="bg-card border border-border p-8 md:p-12 text-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-5" />
          <h1 className="text-3xl font-display text-primary mb-2">Booking Received!</h1>
          <p className="text-muted-foreground font-serif mb-8">
            We've received your booking request. Our team will confirm shortly — usually within a few hours.
          </p>

          <div className="bg-background border border-border p-6 text-left space-y-4 mb-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Booking ID</span>
              <span className="font-mono font-bold text-foreground">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Service</span>
              <span className="font-serif text-foreground">{booking.serviceName || booking.serviceType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{format(new Date(booking.eventDate), 'EEEE, MMMM dd, yyyy')}</span>
            </div>
            {booking.eventLocation && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{booking.eventLocation}</span>
              </div>
            )}
            {booking.guestCount && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Users className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{booking.guestCount} Guests</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 font-bold uppercase tracking-wider">Pending Confirmation</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-serif mb-6 leading-relaxed">
            You'll hear from us at <span className="text-foreground">{booking.customerEmail || booking.customerPhone}</span>.
            If you'd like to follow up right away, contact us on WhatsApp below.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center no-print">
            <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto btn-shimmer text-[#0D0A07] rounded-none gap-2">
                <MessageCircle className="w-4 h-4" /> Follow Up on WhatsApp
              </Button>
            </a>
            <Button variant="outline" className="rounded-none gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Business contact strip — shows nicely when printed */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p className="font-serif">{BUSINESS.name}</p>
          <p>{BUSINESS.phones.map(p => p.display).join(' · ')}</p>
          <p>{BUSINESS.email}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
