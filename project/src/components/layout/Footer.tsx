import React from 'react';
import { Link } from 'wouter';
import { MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import { BUSINESS, whatsappLink, mailtoLink, telLink } from '@/lib/business';
import SocialLinks from '@/components/SocialLinks';
const logoUrl = '/logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D0A07] text-[#F5F0E8] pt-20 pb-8 border-t border-[#C9A84C]/20 no-print relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.05) 0%, transparent 70%)'
      }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 inline-block">
              <img src={logoUrl} alt={`${BUSINESS.name} Logo`} className="h-12 w-auto object-contain" />
              <span className="font-display font-bold text-lg text-[#C9A84C] tracking-wide">
                {BUSINESS.name}
              </span>
            </Link>
            <p className="text-[#C9A84C]/80 text-sm font-serif italic">{BUSINESS.slogan}</p>
            <p className="text-[#F5F0E8]/65 text-sm font-sans max-w-xs leading-relaxed">
              Ghana's premier ushering and catering services. Delivering cinematic hospitality and unforgettable culinary experiences for your most prestigious events.
            </p>
            <SocialLinks variant="icons" className="pt-2" />
          </div>

          <div>
            <h3 className="font-serif text-sm font-bold text-[#C9A84C] mb-6 uppercase tracking-[0.18em]">Services</h3>
            <ul className="space-y-3 font-sans text-[#F5F0E8]/75 text-[0.95rem]">
              <li><Link href="/catering" className="hover:text-[#C9A84C] transition-colors">Wedding Catering</Link></li>
              <li><Link href="/catering" className="hover:text-[#C9A84C] transition-colors">Corporate Catering</Link></li>
              <li><Link href="/event-planning" className="hover:text-[#C9A84C] transition-colors">Event Planning</Link></li>
              <li><Link href="/catering" className="hover:text-[#C9A84C] transition-colors">Buffet Services</Link></li>
              <li><Link href="/ushering" className="hover:text-[#C9A84C] transition-colors">Ushering Services</Link></li>
              <li><Link href="/shop" className="hover:text-[#C9A84C] transition-colors">Shop Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-sm font-bold text-[#C9A84C] mb-6 uppercase tracking-[0.18em]">Company</h3>
            <ul className="space-y-3 font-sans text-[#F5F0E8]/75 text-[0.95rem]">
              <li><Link href="/about" className="hover:text-[#C9A84C] transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-[#C9A84C] transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-[#C9A84C] transition-colors">Contact</Link></li>
              <li><Link href="/account" className="hover:text-[#C9A84C] transition-colors">My Account</Link></li>
              <li><Link href="/booking" className="hover:text-[#C9A84C] transition-colors">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-sm font-bold text-[#C9A84C] mb-6 uppercase tracking-[0.18em]">Contact Us</h3>
            <ul className="space-y-3.5 font-sans text-[#F5F0E8]/75 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                <span>{BUSINESS.locations.join(' | ')}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                <a href={mailtoLink()} className="hover:text-[#C9A84C] transition-colors break-all">{BUSINESS.email}</a>
              </li>
              {BUSINESS.phones.map((phone) => (
                <li key={phone.raw} className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <a href={telLink(phone.raw)} className="hover:text-[#C9A84C] transition-colors">{phone.display}</a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2.5 mt-6">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-sm font-medium hover:bg-[#128C7E] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
              <a
                href={mailtoLink('Enquiry from website')}
                className="inline-flex items-center justify-center gap-2 border border-[#C9A84C]/40 text-[#C9A84C] px-4 py-2.5 rounded-sm font-medium hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] transition-all duration-200"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#F5F0E8]/10 text-center text-[#F5F0E8]/45 text-sm font-sans flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-[#C9A84C] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
