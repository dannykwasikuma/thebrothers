import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { signUpWithEmail, sendPhoneOtp, verifyPhoneOtp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone } from 'lucide-react';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import PhoneInput from '@/components/PhoneInput';

function useRedirectParam(): string {
  if (typeof window === 'undefined') return '/';
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  return redirect ? decodeURIComponent(redirect) : '/';
}

const SignUpPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const redirectTo = useRedirectParam();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await signUpWithEmail(email, password, fullName);
    setSubmitting(false);
    if (result.ok) {
      toast({ title: 'Account Created', description: 'Check your email to confirm your address, then sign in.' });
      setLocation(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
    } else {
      toast({ title: 'Sign Up Failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: 'Name Required', description: 'Please enter your name first.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const result = await sendPhoneOtp(phone);
    setSubmitting(false);
    if (result.ok) {
      setOtpSent(true);
      toast({ title: 'Code Sent', description: `We sent a code to ${phone}.` });
    } else {
      toast({ title: 'Could Not Send Code', description: result.error, variant: 'destructive' });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await verifyPhoneOtp(phone, otp);
    setSubmitting(false);
    if (result.ok) {
      setLocation(redirectTo);
    } else {
      toast({ title: 'Verification Failed', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D0A07] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 bg-cover bg-center" />
      <div className="relative z-10 w-full max-w-md bg-[#1A1410] border border-[#C9A84C]/25 rounded-md p-8 md:p-10">
        <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Create Your Account</h1>
        <p className="text-[#F5F0E8]/60 text-center text-sm mb-8">Experience premium hospitality</p>

        <div className="flex gap-2 mb-8 bg-[#0D0A07] p-1 rounded-sm">
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-sm transition-colors ${method === 'email' ? 'bg-[#C9A84C] text-[#0D0A07] font-medium' : 'text-[#F5F0E8]/60'}`}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-sm transition-colors ${method === 'phone' ? 'bg-[#C9A84C] text-[#0D0A07] font-medium' : 'text-[#F5F0E8]/60'}`}
          >
            <Phone className="w-4 h-4" /> Phone
          </button>
        </div>

        {method === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Full Name</label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Password</label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
              <p className="text-xs text-[#F5F0E8]/40">At least 6 characters</p>
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
              {submitting ? 'Creating Account…' : 'Create Account'}
            </Button>
          </form>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Full Name</label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Phone Number</label>
              <PhoneInput value={phone} onChange={setPhone} required />
              <p className="text-xs text-[#F5F0E8]/40">Select your country, then enter your number</p>
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
              {submitting ? 'Sending…' : 'Send Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Enter Code</label>
              <Input required placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)}
                className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11 text-center text-lg tracking-widest" maxLength={6} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
              {submitting ? 'Verifying…' : 'Verify & Create Account'}
            </Button>
            <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-sm text-[#F5F0E8]/50 hover:text-[#F5F0E8]">
              Use a different number
            </button>
          </form>
        )}

        <div className="mt-6">
          <SocialLoginButtons redirectTo={redirectTo} />
        </div>

        <p className="text-center text-sm text-[#F5F0E8]/60 mt-8">
          Already have an account?{' '}
          <Link href={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`} className="text-[#C9A84C] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
