import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Navbar from './Navbar';
import Footer from './Footer';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { whatsappLink } from '@/lib/business';

interface RootLayoutProps { children: React.ReactNode; }

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* key={location} remounts main on every route change so page-enter
          CSS animation re-triggers, giving each page a smooth slide-in. */}
      <main key={location} className="flex-grow page-enter">
        {children}
      </main>
      <Footer />

      {/* WhatsApp float */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float no-print"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Back to top */}
      <button
        className={`back-to-top no-print${showTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
};

export default RootLayout;
