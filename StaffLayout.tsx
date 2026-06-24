import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/layout/NotificationBell';
import { LayoutDashboard, ShieldCheck, Users2, LogOut, Menu, X } from 'lucide-react';
const logoUrl = '/logo.png';

interface StaffLayoutProps { children: React.ReactNode; }

/** Staff/admin pages get their OWN shell — no Shop/Gallery/Cart nav, no
 *  WhatsApp float, no customer Footer. This is what makes the staff side
 *  of the site feel like a real internal tool rather than the public
 *  website with a couple of extra pages bolted on. */
const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMainAdmin = Boolean(profile?.isMainAdmin);

  const navItems = [
    { label: 'Dashboard', href: '/staff-dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Admin Console', href: '/admin', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Team Feed', href: '/team', icon: <Users2 className="w-4 h-4" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0D0A]">
      <header className="sticky top-0 z-40 bg-[#15110C] border-b border-[#C9A84C]/15">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/staff-dashboard" className="flex items-center gap-2.5">
            <img src={logoUrl} alt="The Brothers" className="h-8 w-auto" />
            <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-[#C9A84C]/70 border-l border-[#C9A84C]/20 pl-2.5">
              {isMainAdmin ? 'Admin' : 'Staff'}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-sm transition-colors cursor-pointer ${
                    location === item.href ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'text-[#F5F0E8]/70 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5'
                  }`}
                >
                  {item.icon} {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button onClick={handleSignOut} className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-sm text-[#F5F0E8]/60 hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <button className="md:hidden p-2 text-[#F5F0E8]" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden border-t border-[#C9A84C]/15 px-4 py-2 space-y-1 overflow-hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-2.5 text-sm text-[#F5F0E8]/80 cursor-pointer">
                  {item.icon} {item.label}
                </span>
              </Link>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-2 px-2 py-2.5 text-sm text-destructive w-full text-left">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.nav>
        )}
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="border-t border-[#C9A84C]/10 py-6 text-center text-xs text-[#F5F0E8]/30">
        The Brothers · Staff Portal
      </footer>
    </div>
  );
};

export default StaffLayout;
