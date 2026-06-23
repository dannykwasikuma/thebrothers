import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

/**
 * Handles the second half of the "forgot password" flow — the page the
 * emailed link lands on. Supabase encodes the recovery token in the URL
 * hash (#access_token=…&type=recovery). When the page loads, Supabase's
 * client library reads that hash, exchanges it for a short-lived session,
 * and fires an AUTH_STATE_CHANGE event with type "PASSWORD_RECOVERY".
 *
 * The critical fix: we must listen for that event via onAuthStateChange
 * rather than calling getSession() immediately on mount, because the token
 * exchange is asynchronous and getSession() will return null if called
 * before Supabase finishes parsing the URL hash.
 */
const ResetPasswordPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event. Supabase fires this
    // automatically when it detects a recovery token in the URL hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready');
      }
    });

    // Also check for an existing recovery session — handles the case where
    // the user refreshes the page after Supabase already parsed the hash.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('ready');
      } else {
        // Give Supabase up to 3 seconds to fire PASSWORD_RECOVERY before
        // we decide the link is invalid. Without this delay the "invalid"
        // screen flashes for a moment on every valid link.
        const timer = setTimeout(() => {
          setStatus((s) => s === 'checking' ? 'invalid' : s);
        }, 3000);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password Too Short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: 'Re-enter the same password in both fields.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);
    if (result.ok) {
      setDone(true);
    } else {
      toast({ title: 'Could Not Update Password', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D0A07] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 bg-cover bg-center" />
      <div className="relative z-10 w-full max-w-md bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-8 md:p-10">

        {status === 'checking' && (
          <div className="text-center py-8 space-y-3">
            <Loader2 className="w-10 h-10 text-[#C9A84C] mx-auto animate-spin" />
            <p className="text-[#F5F0E8]/60 text-sm">Verifying your reset link…</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="text-center space-y-4">
            <ShieldAlert className="w-14 h-14 text-destructive mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Link Expired or Invalid</h1>
            <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">
              This reset link is no longer valid. Reset links work once and expire after a short time — request a fresh one below.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11 mt-2">
                Request a New Link
              </Button>
            </Link>
          </div>
        )}

        {status === 'ready' && !done && (
          <>
            <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Set a New Password</h1>
            <p className="text-[#F5F0E8]/60 text-center text-sm mb-8">Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">New Password</label>
                <Input
                  type="password" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Confirm New Password</label>
                <Input
                  type="password" required minLength={6}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</> : 'Update Password'}
              </Button>
            </form>
          </>
        )}

        {status === 'ready' && done && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-[#C9A84C] mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Password Updated</h1>
            <p className="text-[#F5F0E8]/60 text-sm">You can now sign in with your new password.</p>
            <Button onClick={() => setLocation('/sign-in')} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11 mt-2">
              Go to Sign In
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPasswordPage;
