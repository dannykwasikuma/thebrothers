import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useStaffSignupMode, useRedeemInviteCode } from '@/hooks/useAdmin';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, KeyRound } from 'lucide-react';

const StaffSignup: React.FC = () => {
  const { isLoaded, profile, refreshProfile } = useAuth();
  const { data: signupMode, isLoading: loadingMode } = useStaffSignupMode();
  const redeemMutation = useRedeemInviteCode();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

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
          <Link href="/admin"><Button className="rounded-none">Go to Portal</Button></Link>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    redeemMutation.mutate(code, {
      onSuccess: async (result) => {
        if (result.ok) {
          toast({ title: 'Welcome to the Team!', description: `Your Staff ID is ${result.staffId}.` });
          await refreshProfile();
          setLocation('/admin');
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
      </motion.div>
    </div>
  );
};

export default StaffSignup;
