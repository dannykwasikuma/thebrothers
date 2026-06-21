import React from 'react';
import { BUSINESS, mailtoLink, locationsList } from '@/lib/business';

const Terms: React.FC = () => (
  <div className="min-h-screen bg-background pt-32 pb-24 px-4">
    <div className="max-w-3xl mx-auto">
      <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Legal</span>
      <h1 className="text-4xl font-display text-primary mt-3 mb-2">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-12">Last updated: June 2026</p>

      <div className="space-y-10 font-sans text-foreground/85 leading-relaxed">
        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">1. Agreement to Terms</h2>
          <p>
            These Terms of Service ("Terms") govern your use of the {BUSINESS.name} website, mobile experience, and
            booking platform (together, the "Service"), operated from {locationsList()}. By creating
            an account, making a booking, or placing an order through the Service, you agree to be bound by these Terms.
            If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">2. Accounts</h2>
          <p className="mb-3">
            You must create an account to book a service or place an order. You agree to provide accurate,
            current information and to keep your login credentials confidential. You are responsible for all
            activity that occurs under your account.
          </p>
          <p>
            Staff and administrator accounts are provisioned separately by {BUSINESS.name} and are subject to
            additional internal policies governing access to customer data, bookings, and operational tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">3. Bookings and Orders</h2>
          <p className="mb-3">
            Submitting a booking request through the Service constitutes a request for catering, ushering, or
            event planning services, which {BUSINESS.name} will confirm, decline, or follow up on directly. A
            booking is not guaranteed until confirmed by our team.
          </p>
          <p className="mb-3">
            Shop orders are confirmed once payment or payment arrangement (including Mobile Money or pay-on-arrival,
            where offered) has been recorded. We reserve the right to cancel or adjust an order if information
            provided is inaccurate or if fulfilment is not possible.
          </p>
          <p>
            Event dates, guest counts, menus, and pricing discussed during booking are subject to confirmation in
            writing (including via WhatsApp or email) before being treated as final.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">4. Pricing and Payment</h2>
          <p>
            Prices displayed on the Service are in Ghana Cedis (GHS) unless otherwise stated and may be adjusted
            for custom requests, guest count, location, or seasonal demand. Accepted payment methods may include
            Mobile Money (MTN, Vodafone Cash, AirtelTigo Money), card payment where available, and pay-on-arrival
            for select services. All payment details you provide are used solely to process your transaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">5. Cancellations and Changes</h2>
          <p>
            We understand plans change. Please contact us as early as possible if you need to amend or cancel a
            booking or order. Depending on how close to the event date a cancellation occurs, deposits or
            preparation costs already incurred may not be fully refundable. We will always communicate this
            clearly before confirming a booking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">6. Conduct</h2>
          <p>
            You agree not to misuse the Service — including attempting to access accounts that are not yours,
            interfering with the proper functioning of the site, or submitting false booking or contact
            information. We reserve the right to suspend or disable accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">7. Intellectual Property</h2>
          <p>
            All content on the Service — including the {BUSINESS.name} name, logo, photography, and written
            content — belongs to {BUSINESS.name} or its licensors and may not be reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">8. Limitation of Liability</h2>
          <p>
            {BUSINESS.name} strives to deliver every event and order to the standard our clients expect. To the
            extent permitted by law, our liability for any claim arising from use of the Service is limited to
            the amount paid for the relevant booking or order. We are not liable for indirect or consequential
            losses, including those arising from circumstances outside our reasonable control (severe weather,
            venue issues, or third-party vendor failures).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">9. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time to reflect changes in our services or legal requirements.
            Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">10. Contact Us</h2>
          <p>
            Questions about these Terms can be sent to{' '}
            <a href={mailtoLink('Question about Terms of Service')} className="text-primary hover:underline">
              {BUSINESS.email}
            </a>, or you can reach us by phone at {BUSINESS.phones.map(p => p.display).join(' / ')}.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Terms;
