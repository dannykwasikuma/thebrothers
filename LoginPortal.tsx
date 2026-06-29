import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Users, ShieldCheck } from 'lucide-react';
import { BUSINESS } from '@/lib/business';

/** Returns the explicit redirect param only if one was actually given —
 *  unlike SignInPage/StaffSignIn's version of this hook, this one must NOT
 *  invent a default of '/' here. If it did, every link below would carry
 *  an unconditional "?redirect=/", which the destination pages treat as an
 *  explicit override and honor literally — exactly the bug where staff
 *  signing in always landed on the customer homepage instead of their
 *  dashboard, even though no one actually asked to go there. */
function useRedirectParam(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  return redirect ? decodeURIComponent(redirect) : null;
}

const LoginPortal: React.FC = () => {
  const redirectTo = useRedirectParam();
  const redirectQS = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D0A07] px-4 relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 bg-cover bg-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl text-center"
      >
        <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">{BUSINESS.name}</span>
        <h1 className="text-3xl md:text-4xl font-display text-[#C9A84C] mt-3 mb-3">Welcome Back</h1>
        <p className="text-[#F5F0E8]/60 font-serif italic mb-12">Choose how you'd like to sign in</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href={`/sign-in${redirectQS}`}>
            <div className="group bg-[#1A1410] border border-[#C9A84C]/25 hover:border-[#C9A84C] rounded-md p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer h-full flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-6 group-hover:bg-[#C9A84C]/20 transition-colors">
                <Users className="h-7 w-7 text-[#C9A84C]" />
              </div>
              <h2 className="text-xl font-serif text-[#F5F0E8] mb-2">Customer Login</h2>
              <p className="text-sm text-[#F5F0E8]/55 leading-relaxed">
                Book services, track your orders, and manage your account.
              </p>
            </div>
          </Link>

          <Link href={`/staff/sign-in${redirectQS}`}>
            <div className="group bg-[#1A1410] border border-[#C9A84C]/25 hover:border-[#C9A84C] rounded-md p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer h-full flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-6 group-hover:bg-[#C9A84C]/20 transition-colors">
                <ShieldCheck className="h-7 w-7 text-[#C9A84C]" />
              </div>
              <h2 className="text-xl font-serif text-[#F5F0E8] mb-2">Staff &amp; Admin Login</h2>
              <p className="text-sm text-[#F5F0E8]/55 leading-relaxed">
                Access the staff portal, manage bookings, and view assigned events.
              </p>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-[#F5F0E8]/50 mt-10">
          New here?{' '}
          <Link href={`/sign-up${redirectQS}`} className="text-[#C9A84C] hover:underline">
            Create a customer account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPortal;
