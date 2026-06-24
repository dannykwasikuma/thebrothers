import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { signInWithEmail, signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

function useRedirectParam(): string {
  if (typeof window === 'undefined') return '/staff-dashboard';
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  return redirect ? decodeURIComponent(redirect) : '/staff-dashboard';
}

/**
 * A separate door from the customer sign-in, used by staff and the Main
 * Admin. Same underlying Supabase auth as customers (one set of accounts,
 * one database) — the only difference is this page checks the resulting
 * profile's role immediately after sign-in and refuses entry (with a clear
 * message) to anyone whose account is a plain customer, signing them back
 * out so they aren't left in a half-authenticated state.
 */
const StaffSignIn: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const redirectTo = useRedirectParam();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await signInWithEmail(email, password);
    if (!result.ok) {
      setSubmitting(false);
      toast({ title: 'Sign In Failed', description: result.error, variant: 'destructive' });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setSubmitting(false);
      toast({ title: 'Sign In Failed', description: 'Could not verify your session. Please try again.', variant: 'destructive' });
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', session.user.id)
      .single();

    setSubmitting(false);

    if (error || !profile) {
      console.error('Staff sign-in profile lookup failed:', error);
      toast({ title: 'Error', description: 'Could not load your profile. Please try again.', variant: 'destructive' });
      return;
    }

    if (profile.role === 'customer') {
      await signOut();
      toast({
        title: 'Not a Staff Account',
        description: 'This sign-in is reserved for staff and admin. Use the Customer Login instead.',
        variant: 'destructive',
      });
      return;
    }

    if (profile.status === 'disabled') {
      await signOut();
      toast({
        title: 'Account Disabled',
        description: 'Your staff account has been disabled. Please contact the Main Admin.',
        variant: 'destructive',
      });
      return;
    }

    setLocation(redirectTo);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D0A07] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 bg-cover bg-center" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 12px)' }}
      />
      <div className="relative z-10 w-full max-w-md bg-[#1A1410] border border-[#C9A84C]/40 rounded-md p-8 md:p-10 shadow-2xl">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-[#F5F0E8]/50 hover:text-[#C9A84C] mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login options
        </Link>

        <div className="h-14 w-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 flex items-center justify-center mb-6 mx-auto">
          <ShieldCheck className="h-6 w-6 text-[#C9A84C]" />
        </div>
        <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Staff &amp; Admin Portal</h1>
        <p className="text-[#F5F0E8]/55 text-center text-sm mb-8">Authorized personnel only</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Email</label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Password</label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
            {submitting ? 'Verifying…' : 'Sign In to Portal'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#F5F0E8]/50 mt-8">
          New staff member?{' '}
          <Link href="/staff-signup" className="text-[#C9A84C] hover:underline">
            Enter your invite code to get started
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StaffSignIn;
