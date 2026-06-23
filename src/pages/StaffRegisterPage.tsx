import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { signUpWithEmail, sendPhoneOtp, verifyPhoneOtp } from '@/lib/auth';
import { useRedeemInviteCode } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import PhoneInput from '@/components/PhoneInput';
import {
  ShieldCheck, KeyRound, User, Mail, Phone,
  ChevronRight, Loader2, CheckCircle2
} from 'lucide-react';

/**
 * Public staff registration page — no login required.
 * Three steps:
 *   1. Enter the invite code the admin gave them (validates it's real before
 *      making them fill out all their details)
 *   2. Create account (email+password or phone+OTP)
 *   3. Code is redeemed automatically → staff role + staff ID assigned
 *
 * Lives at /staff/register (public, no RequireAuth wrapper).
 */

const STEPS = ['Code', 'Account', 'Done'] as const;

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

const StaffRegisterPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const redeemCode = useRedeemInviteCode();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — code
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Step 2 — account
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Result
  const [staffId, setStaffId] = useState<string | null>(null);

  // ── Step 1: validate code exists (lightweight check — actual redemption
  //   happens after the account is created so we don't waste a one-use code
  //   if the person gives up halfway through registration)
  const handleCodeNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    if (code.trim().length < 4) {
      setCodeError('Please enter the full invite code.');
      return;
    }
    setStep(1);
  };

  // ── Step 2a: email sign-up + code redemption
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const signupResult = await signUpWithEmail(email, password, fullName);
    if (!signupResult.ok) {
      toast({ title: 'Account Error', description: signupResult.error, variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    await doRedeem();
    setSubmitting(false);
  };

  // ── Step 2b-i: send phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: 'Name Required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const result = await sendPhoneOtp(phone);
    setSubmitting(false);
    if (result.ok) { setOtpSent(true); }
    else { toast({ title: 'Could Not Send Code', description: result.error, variant: 'destructive' }); }
  };

  // ── Step 2b-ii: verify OTP + code redemption
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await verifyPhoneOtp(phone, otp);
    if (!result.ok) {
      toast({ title: 'Verification Failed', description: result.error, variant: 'destructive' });
      setSubmitting(false);
      return;
    }
    await doRedeem();
    setSubmitting(false);
  };

  // ── Shared: redeem the code now that the account exists
  const doRedeem = async () => {
    const result = await redeemCode.mutateAsync(code.trim().toUpperCase());
    if (result.ok) {
      await refreshProfile();
      setStaffId(result.staffId ?? null);
      setStep(2);
    } else {
      // Account was created successfully — only the code failed.
      toast({
        title: 'Code Not Accepted',
        description:
          (result.error ?? 'The invite code was not recognised or has already been used.') +
          ' Your account was still created — contact the admin to complete your staff setup.',
        variant: 'destructive',
      });
      setStep(2); // still move them forward — account exists
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0D0A07] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] opacity-10 bg-cover bg-center" />

      <div className="relative z-10 w-full max-w-md">

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > i ? 'bg-[#C9A84C] text-[#0D0A07]' :
                  step === i ? 'border-2 border-[#C9A84C] text-[#C9A84C]' :
                  'border border-[#3A3430] text-[#F5F0E8]/30'
                }`}>
                  {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${step === i ? 'text-[#C9A84C]' : 'text-[#F5F0E8]/30'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 max-w-[40px] transition-all duration-500 ${step > i ? 'bg-[#C9A84C]' : 'bg-[#3A3430]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 0: INVITE CODE ── */}
          {step === 0 && (
            <motion.div key="step0" variants={card} initial="hidden" animate="visible" exit="exit"
              className="bg-[#1A1410] border border-[#C9A84C]/25 p-8 md:p-10">
              <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-6 mx-auto">
                <KeyRound className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Staff Registration</h1>
              <p className="text-[#F5F0E8]/60 text-center text-sm mb-8 leading-relaxed">
                Enter the invite code your admin gave you. You'll create your account on the next step.
              </p>
              <form onSubmit={handleCodeNext} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Invite Code</label>
                  <Input
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                    placeholder="e.g. BRTHR-XXXX"
                    maxLength={20}
                    autoComplete="off"
                    autoFocus
                    className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-12 text-center text-lg tracking-widest font-mono placeholder:text-base placeholder:tracking-normal placeholder:font-sans"
                    required
                  />
                  {codeError && <p className="text-xs text-destructive">{codeError}</p>}
                </div>
                <Button type="submit" className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11 gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-center text-sm text-[#F5F0E8]/40 mt-6">
                Already have an account?{' '}
                <Link href="/staff/sign-in" className="text-[#C9A84C] hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* ── STEP 1: CREATE ACCOUNT ── */}
          {step === 1 && (
            <motion.div key="step1" variants={card} initial="hidden" animate="visible" exit="exit"
              className="bg-[#1A1410] border border-[#C9A84C]/25 p-8 md:p-10">
              <h1 className="text-2xl font-display text-[#C9A84C] text-center mb-2">Create Your Account</h1>
              <p className="text-[#F5F0E8]/60 text-center text-sm mb-6 leading-relaxed">
                Code accepted. Now set up your staff account.
              </p>

              {/* Email / Phone toggle */}
              <div className="flex gap-2 mb-6 bg-[#0D0A07] p-1 rounded-sm">
                {(['email', 'phone'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-sm transition-colors ${
                      method === m ? 'bg-[#C9A84C] text-[#0D0A07] font-medium' : 'text-[#F5F0E8]/60'
                    }`}>
                    {m === 'email' ? <><Mail className="w-4 h-4" /> Email</> : <><Phone className="w-4 h-4" /> Phone</>}
                  </button>
                ))}
              </div>

              {/* Email form */}
              {method === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  <Button type="submit" disabled={submitting}
                    className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account…</> : 'Create Staff Account'}
                  </Button>
                </form>
              )}

              {/* Phone form — step 2b-i: send OTP */}
              {method === 'phone' && !otpSent && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Full Name</label>
                    <Input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#C9A84C] uppercase tracking-wider">Phone Number</label>
                    <PhoneInput value={phone} onChange={setPhone} required />
                  </div>
                  <Button type="submit" disabled={submitting}
                    className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : 'Send Verification Code'}
                  </Button>
                </form>
              )}

              {/* Phone form — step 2b-ii: verify OTP */}
              {method === 'phone' && otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-sm text-[#F5F0E8]/60 text-center">
                    Enter the code sent to <span className="text-[#F5F0E8]">{phone}</span>
                  </p>
                  <Input required placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="bg-[#0D0A07] border-[#3A3430] text-[#F5F0E8] rounded-none h-12 text-center text-2xl tracking-widest" />
                  <Button type="submit" disabled={submitting}
                    className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</> : 'Verify & Create Account'}
                  </Button>
                  <button type="button" onClick={() => setOtpSent(false)}
                    className="w-full text-center text-sm text-[#F5F0E8]/40 hover:text-[#F5F0E8]">
                    Use a different number
                  </button>
                </form>
              )}

              <button onClick={() => setStep(0)}
                className="mt-6 w-full text-center text-xs text-[#F5F0E8]/30 hover:text-[#F5F0E8]/60">
                ← Back to code entry
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: SUCCESS ── */}
          {step === 2 && (
            <motion.div key="step2" variants={card} initial="hidden" animate="visible"
              className="bg-[#1A1410] border border-[#C9A84C]/25 p-8 md:p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-[#C9A84C]" />
              </div>
              <h1 className="text-2xl font-display text-[#C9A84C]">Welcome to the Team!</h1>
              <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">
                Your staff account is ready.
                {staffId && (
                  <> Your Staff ID is{' '}
                    <span className="text-[#C9A84C] font-mono font-bold">{staffId}</span>.
                    Keep this safe — you may need it to sign in at events.
                  </>
                )}
              </p>
              <Button onClick={() => setLocation('/staff/sign-in')}
                className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-semibold rounded-none h-11">
                Sign In to Your Account
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default StaffRegisterPage;
