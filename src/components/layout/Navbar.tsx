import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useGetCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SERVICE_MENU } from '@/lib/serviceMenu';
const logoUrl = '/logo.png';

const Navbar: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: cart } = useGetCart();
  const { isSignedIn, profile, signOut } = useAuth();

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const isServiceRoute = location.startsWith('/services/') || location === '/catering' || location === '/ushering';

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setLocation('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); setMobileServicesOpen(false); }, [location]);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const scheduleCloseServices = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 150);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ];

  const trailingLinks = [
    { name: 'Gallery', path: '/gallery' },
    { name: 'Shop', path: '/shop' },
    { name: 'Booking', path: '/booking' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500 no-print',
        isScrolled
          ? 'bg-[#0D0A07]/97 backdrop-blur-md py-2 shadow-lg border-b border-[#C9A84C]/25'
          : 'bg-gradient-to-b from-[#0D0A07]/85 to-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-3 z-50 group">
          <img
            src={logoUrl}
            alt="The Brothers Catering Services Logo"
            className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display font-bold text-base md:text-lg text-[#C9A84C] tracking-wide whitespace-nowrap">
              THE BROTHERS CATERING SERVICES
            </span>
            <span className="text-[#F5F0E8]/50 text-[10px] tracking-[0.22em] uppercase font-sans">
              Quality Services You Can Trust
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'nav-link-underline text-[0.78rem] font-medium tracking-[0.12em] uppercase font-serif transition-colors duration-200 hover:text-[#C9A84C] pb-0.5',
                location === link.path ? 'text-[#C9A84C] active' : 'text-[#F5F0E8]/75'
              )}
            >
              {link.name}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={openServices}
            onMouseLeave={scheduleCloseServices}
          >
            <button
              className={cn(
                'nav-link-underline flex items-center gap-1 text-[0.78rem] font-medium tracking-[0.12em] uppercase font-serif transition-colors duration-200 hover:text-[#C9A84C] pb-0.5',
                isServiceRoute ? 'text-[#C9A84C] active' : 'text-[#F5F0E8]/75'
              )}
              onClick={() => setServicesOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
            >
              Services
              <ChevronDown className={cn('h-3 w-3 transition-transform duration-300', servicesOpen && 'rotate-180')} />
            </button>

            <div
              className={cn(
                'absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all duration-300 origin-top',
                servicesOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
              )}
            >
              <div className="w-[640px] max-w-[90vw] bg-[#0D0A07] border border-[#C9A84C]/25 shadow-2xl rounded-sm p-3 grid grid-cols-2 gap-1">
                {SERVICE_MENU.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setServicesOpen(false)}
                    className={cn(
                      'block px-4 py-3 text-sm font-sans rounded-sm transition-colors duration-150',
                      location === item.path
                        ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                        : 'text-[#F5F0E8]/80 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {trailingLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'nav-link-underline text-[0.78rem] font-medium tracking-[0.12em] uppercase font-serif transition-colors duration-200 hover:text-[#C9A84C] pb-0.5',
                location === link.path ? 'text-[#C9A84C] active' : 'text-[#F5F0E8]/75'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 z-50">
          <Link href="/cart" className="relative text-[#F5F0E8] hover:text-[#C9A84C] transition-colors p-2 group">
            <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            {cartItemsCount > 0 && (
              <span className="badge-pulse absolute top-0 right-0 bg-[#8B0000] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-8 w-8 rounded-full border-2 border-[#C9A84C]/50 hover:border-[#C9A84C] transition-colors flex items-center justify-center text-[#C9A84C] text-sm font-medium bg-[#1A1410]"
              >
                {(profile?.fullName || profile?.email || '?').charAt(0).toUpperCase()}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0D0A07] border border-[#C9A84C]/25 rounded-sm shadow-xl py-2 z-50">
                  <p className="px-4 py-2 text-xs text-[#F5F0E8]/50 truncate border-b border-[#F5F0E8]/8 mb-1">
                    {profile?.fullName || profile?.email || profile?.phone}
                  </p>
                  <Link href="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[#F5F0E8] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]">
                    My Account
                  </Link>
                  {(profile?.role === 'staff' || profile?.role === 'admin') && (
                    <>
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[#F5F0E8] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]">
                        Admin Portal
                      </Link>
                      <Link href="/team" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-[#F5F0E8] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]">
                        Team Feed
                      </Link>
                    </>
                  )}
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#F5F0E8] hover:bg-[#8B0000]/10 hover:text-[#8B0000] text-left">
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-[#F5F0E8]/80 hover:text-[#C9A84C] hover:bg-[#C9A84C]/8 border border-[#C9A84C]/20 hover:border-[#C9A84C]/50 transition-all"
              >
                <User className="h-3.5 w-3.5" /> Login
              </Button>
            </Link>
          )}

          <button
            className="lg:hidden text-[#F5F0E8] p-2 hover:text-[#C9A84C] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'lg:hidden absolute top-full left-0 right-0 bg-[#0D0A07]/98 backdrop-blur-md border-b border-[#C9A84C]/20 shadow-2xl overflow-hidden transition-all duration-300 max-h-[85vh] overflow-y-auto',
          mobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col py-4 px-5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'text-[1.05rem] font-serif py-3 border-b border-[#F5F0E8]/8 transition-colors flex items-center justify-between',
                location === link.path ? 'text-[#C9A84C]' : 'text-[#F5F0E8]'
              )}
            >
              {link.name}
              {location === link.path && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
            </Link>
          ))}

          <button
            onClick={() => setMobileServicesOpen((o) => !o)}
            className={cn(
              'text-[1.05rem] font-serif py-3 border-b border-[#F5F0E8]/8 transition-colors flex items-center justify-between w-full text-left',
              isServiceRoute ? 'text-[#C9A84C]' : 'text-[#F5F0E8]'
            )}
          >
            Services
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', mobileServicesOpen && 'rotate-180')} />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 pl-4 border-b border-[#F5F0E8]/8',
              mobileServicesOpen ? 'max-h-[600px] py-2' : 'max-h-0'
            )}
          >
            {SERVICE_MENU.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'block py-2.5 text-sm font-sans transition-colors',
                  location === item.path ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/70'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {trailingLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'text-[1.05rem] font-serif py-3 border-b border-[#F5F0E8]/8 transition-colors flex items-center justify-between',
                location === link.path ? 'text-[#C9A84C]' : 'text-[#F5F0E8]'
              )}
            >
              {link.name}
              {location === link.path && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
            </Link>
          ))}

          <div className="flex gap-3 mt-5">
            <Link href="/booking" className="flex-1">
              <Button className="w-full bg-[#C9A84C] text-[#0D0A07] font-semibold rounded-none">
                Book a Service
              </Button>
            </Link>
            {!isSignedIn && (
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full text-[#F5F0E8] border-[#C9A84C]/30 hover:bg-[#C9A84C]/10 rounded-none">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
