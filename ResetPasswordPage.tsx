import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Supabase needs a moment to read the recovery token out of the URL and
  // establish a session after the page first mounts — until that resolves,
  // we don't actually know yet whether this is a valid recovery link.
  const [checkingLink, setCheckingLink] = useState(true);
  const [validLink, setValidLink] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setValidLink(Boolean(data.session));
      setCheckingLink(false);
    });
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

        {checkingLink ? (
          <p className="text-center text-[#F5F0E8]/60 text-sm py-8">Checking your reset link…</p>
        ) : done ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-[#C9A84C] mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Password Updated</h1>
            <p className="text-[#F5F0E8]/60 text-sm">You can now sign in with your new password.</p>
            <Button onClick={() => setLocation('/sign-in')} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11 mt-2">
              Go to Sign In
            </Button>
          </div>
        ) : !validLink ? (
          <div className="text-center space-y-4">
            <ShieldAlert className="w-14 h-14 text-destructive mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Link Expired or Invalid</h1>
            <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">
              This reset link is no longer valid. Reset links only work once and expire after a while — request a new one below.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11 mt-2">
                Request a New Link
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Set a New Password</h1>
            <p className="text-[#F5F0E8]/60 text-center text-sm mb-8">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">New Password</label>
                <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Confirm New Password</label>
                <Input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                {submitting ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
