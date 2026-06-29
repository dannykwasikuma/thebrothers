import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useStaffSignupMode, useRedeemInviteCode } from '@/hooks/useAdmin';
import { signUpWithEmail } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { playSuccessChime } from '@/lib/sounds';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, KeyRound } from 'lucide-react';

const StaffSignup: React.FC = () => {
  const { isLoaded, isSignedIn, profile, refreshProfile } = useAuth();
  const { data: signupMode, isLoading: loadingMode } = useStaffSignupMode();
  const redeemMutation = useRedeemInviteCode();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // If the person doesn't have an account yet, collect the basics inline
  // here instead of sending them through the separate customer sign-up flow
  // first — one page, one step, straight to "here's your Staff ID".
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);

  if (!isLoaded || loadingMode) return <div className="min-h-screen bg-background pt-32" />;

  if (profile && profile.role !== 'customer') {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="max-w-md text-center bg-card border border-border p-10">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">You're All Set</h1>
          <p className="text-muted-foreground mb-6">
            Your account is already registered as <span className="text-primary font-medium capitalize">{profile.role}</span>
            {profile.staffId ? ` (ID: ${profile.staffId})` : ''}.
          </p>
          <Link href="/staff-dashboard"><Button className="rounded-none">Go to Portal</Button></Link>
        </div>
      </div>
    );
  }

  if (signupMode !== 'invite_code') {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="max-w-md text-center bg-card border border-border p-10">
          <KeyRound className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Self-Registration Disabled</h1>
          <p className="text-muted-foreground mb-6">
            Staff self-registration is currently turned off. Please ask the Main Admin to create a staff account
            for you directly using your email address.
          </p>
          <Link href="/"><Button variant="outline" className="rounded-none">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const handleCreateAccountAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreatingAccount(true);
    const result = await signUpWithEmail(email, password, fullName);
    if (!result.ok) {
      setCreatingAccount(false);
      setError(result.error || 'Could not create your account.');
      return;
    }
    // signUpWithEmail succeeding does NOT guarantee a usable session — if
    // email confirmation is required, the person isn't actually signed in
    // until they click the link in their inbox. Check for a real session
    // before assuming we can move straight to code redemption.
    const { data } = await supabase.auth.getSession();
    setCreatingAccount(false);
    if (data.session) {
      await refreshProfile();
      toast({ title: 'Account Created', description: 'Now enter your invite code below to activate your staff account.' });
    } else {
      setAwaitingEmailConfirm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    redeemMutation.mutate(code, {
      onSuccess: async (result) => {
        if (result.ok) {
          playSuccessChime();
          toast({ title: 'Welcome to the Team!', description: `Your Staff ID is ${result.staffId}.` });
          await refreshProfile();
          setLocation('/staff-dashboard');
        } else {
          setError(result.error || 'Something went wrong. Please check your code and try again.');
        }
      },
      onError: (err: any) => {
        setError(err?.message || 'Something went wrong. Please try again.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card border border-border p-10"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 mx-auto">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>

        {awaitingEmailConfirm ? (
          <>
            <h1 className="text-2xl font-display text-primary text-center mb-2">Check Your Email</h1>
            <p className="text-muted-foreground text-center text-sm mb-6">
              We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Click it, then come back to this page and sign in to enter your invite code.
            </p>
            <Link href={`/sign-in?redirect=${encodeURIComponent('/staff-signup')}`}>
              <Button className="w-full rounded-none h-12">I've Confirmed — Sign In</Button>
            </Link>
          </>
        ) : !isSignedIn ? (
          <>
            <h1 className="text-2xl font-display text-primary text-center mb-2">Create Your Staff Account</h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              First, set up your sign-in details. You'll enter your invite code on the next step.
            </p>
            <form onSubmit={handleCreateAccountAndContinue} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-primary uppercase tracking-wider">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-none h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-primary uppercase tracking-wider">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-none h-11" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-primary uppercase tracking-wider">Password</label>
                <Input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-none h-11" required />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/25 p-3 rounded-sm">{error}</div>
              )}
              <Button type="submit" disabled={creatingAccount} className="w-full rounded-none h-12">
                {creatingAccount ? 'Creating Account…' : 'Continue'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href={`/sign-in?redirect=${encodeURIComponent('/staff-signup')}`} className="text-primary hover:underline">Sign in instead</Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-display text-primary text-center mb-2">Staff Registration</h1>
            <p className="text-muted-foreground text-center text-sm mb-8">
              Enter the invite code your Main Admin shared with you to activate your staff account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-primary uppercase tracking-wider">Invite Code</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="rounded-none h-12 text-center text-lg tracking-widest font-mono"
                  maxLength={9}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/25 p-3 rounded-sm">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={redeemMutation.isPending || !code.trim()} className="w-full rounded-none h-12">
                {redeemMutation.isPending ? 'Verifying…' : 'Activate Staff Account'}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default StaffSignup;
