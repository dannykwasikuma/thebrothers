import React, { useState } from 'react';
import { Link } from 'wouter';
import { sendPasswordResetEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MailCheck, ArrowLeft } from 'lucide-react';

/**
 * Entry point for "I forgot my password." Sends a reset link to whatever
 * email the person types — same screen shown either way (we don't reveal
 * whether the address has an account, to avoid leaking who's registered).
 */
const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await sendPasswordResetEmail(email, '/reset-password');
    setSubmitting(false);
    if (result.ok) {
      setSent(true);
    } else {
      toast({ title: 'Could Not Send Reset Link', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D0A07] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 bg-cover bg-center" />
      <div className="relative z-10 w-full max-w-md bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-8 md:p-10">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-xs text-[#F5F0E8]/50 hover:text-[#C9A84C] mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <MailCheck className="w-14 h-14 text-[#C9A84C] mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Check Your Email</h1>
            <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">
              If an account exists for <span className="text-[#F5F0E8]">{email}</span>, we've sent a link to reset your password.
              It works once and expires after a while, so use it soon.
            </p>
            <Button onClick={() => setSent(false)} variant="outline" className="w-full border-[#C9A84C]/30 text-[#F5F0E8] hover:bg-[#C9A84C]/10 rounded-none h-11 mt-2">
              Use a Different Email
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Forgot Your Password?</h1>
            <p className="text-[#F5F0E8]/60 text-center text-sm mb-8">Enter your email and we'll send you a link to reset it.</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Email</label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                {submitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
