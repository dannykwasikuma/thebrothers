import React from 'react';
import { BUSINESS, mailtoLink } from '@/lib/business';

const Privacy: React.FC = () => (
  <div className="min-h-screen bg-background pt-32 pb-24 px-4">
    <div className="max-w-3xl mx-auto">
      <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Legal</span>
      <h1 className="text-4xl font-display text-primary mt-3 mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-12">Last updated: June 2026</p>

      <div className="space-y-10 font-sans text-foreground/85 leading-relaxed">
        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">1. Introduction</h2>
          <p>
            {BUSINESS.name} ("we", "us", "our") respects your privacy. This Privacy Policy explains what
            information we collect through our website and booking platform, how we use it, and the choices
            you have. By using the Service, you agree to the practices described here.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">2. Information We Collect</h2>
          <p className="mb-3">We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="text-foreground font-medium">Account details</span> — name, email address, and/or phone number when you sign up.</li>
            <li><span className="text-foreground font-medium">Booking information</span> — event date, location, guest count, service type, and any notes you provide.</li>
            <li><span className="text-foreground font-medium">Order and delivery details</span> — shipping name, address, phone number, and order contents.</li>
            <li><span className="text-foreground font-medium">Payment-related information</span> — such as your Mobile Money number and network, used solely to process payment, never stored in full card detail on our servers.</li>
            <li><span className="text-foreground font-medium">Communications</span> — messages you send us through the Contact form, WhatsApp, or email.</li>
            <li><span className="text-foreground font-medium">Staff profile information</span> — for staff/admin accounts only: bio, profile photo, and internal team posts within the Team Feed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">3. How We Use Your Information</h2>
          <p className="mb-3">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and fulfil your bookings and orders</li>
            <li>Send booking confirmations, receipts, and order updates via email and/or WhatsApp</li>
            <li>Notify our team of new bookings or orders so they can respond promptly</li>
            <li>Respond to enquiries submitted through the Contact page</li>
            <li>Improve our services and the usability of the Service</li>
            <li>Maintain the security of accounts and prevent misuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">4. How We Share Information</h2>
          <p className="mb-3">
            We do not sell your personal information. We share information only as needed to operate the
            Service, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With our internal staff and Main Admin, to manage and fulfil your bookings and orders</li>
            <li>With Supabase, our database and authentication provider, which securely stores account and booking data</li>
            <li>With Twilio, to deliver WhatsApp/SMS notifications about new bookings and orders to our team</li>
            <li>When required by law or to protect the rights, safety, or property of {BUSINESS.name} or others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">5. Data Security</h2>
          <p>
            We use industry-standard practices to protect your information, including encrypted storage and
            access controls that restrict who can view bookings, orders, and account details based on role
            (customer, staff, or Main Admin). No method of transmission or storage is 100% secure, but we work
            to protect your information using commercially reasonable safeguards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">6. Data Retention</h2>
          <p>
            We retain booking, order, and account information for as long as your account is active or as
            needed to provide our services, comply with legal obligations, resolve disputes, and enforce our
            agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">7. Your Choices</h2>
          <p>
            You can review and update your account details at any time from your Account page. You may request
            that we delete your account and associated personal information by contacting us using the details
            below, subject to any records we are required to keep for legal or accounting purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">8. Children's Privacy</h2>
          <p>
            The Service is not directed at children under 18, and we do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated version here with a
            revised "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-foreground mb-3">10. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or your personal information, contact us at{' '}
            <a href={mailtoLink('Privacy question')} className="text-primary hover:underline">
              {BUSINESS.email}
            </a>, or by phone at {BUSINESS.phones.map(p => p.display).join(' / ')}.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
