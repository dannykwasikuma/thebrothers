import React, { useState } from 'react';
import { Link } from 'wouter';
import { sendPasswordResetEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Always points at /reset-password — that page reads the recovery
    // session Supabase attaches when the person opens the emailed link.
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
        {!sent ? (
          <>
            <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Reset Your Password</h1>
            <p className="text-[#F5F0E8]/60 text-center text-sm mb-8">
              Enter the email on your account and we'll send you a link to reset your password.
            </p>
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
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-[#C9A84C] mx-auto" />
            <h1 className="text-2xl font-display text-[#C9A84C]">Check Your Email</h1>
            <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">
              If an account exists for <span className="text-[#F5F0E8]">{email}</span>, a password reset link is on its way.
              It may take a minute to arrive — check your spam folder too.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-[#F5F0E8]/60 mt-8 flex items-center justify-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <Link href="/sign-in" className="text-[#C9A84C] hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
