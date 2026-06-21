import React, { useState } from 'react';
import { Facebook } from 'lucide-react';
import { signInWithSocialProvider } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v2.97h3.93c2.3-2.12 3.62-5.24 3.62-8.79z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.93-2.97c-1.09.73-2.49 1.17-4 1.17-3.08 0-5.69-2.08-6.62-4.87H1.32v3.06C3.29 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.38 14.42c-.24-.73-.38-1.5-.38-2.42s.14-1.69.38-2.42V6.52H1.32A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.32 5.48l4.06-3.06z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.48-3.48C17.95 1.19 15.24 0 12 0 7.31 0 3.29 2.7 1.32 6.52l4.06 3.06c.93-2.79 3.54-4.83 6.62-4.83z" />
  </svg>
);

interface SocialLoginButtonsProps {
  redirectTo: string;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ redirectTo }) => {
  const { toast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);

  const handleClick = async (provider: 'google' | 'facebook') => {
    setLoadingProvider(provider);
    const result = await signInWithSocialProvider(provider, redirectTo);
    if (!result.ok) {
      setLoadingProvider(null);
      toast({
        title: 'Social Login Unavailable',
        description: result.error || `${provider === 'google' ? 'Google' : 'Facebook'} sign-in isn't set up yet.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#F5F0E8]/15" />
        <span className="text-[#F5F0E8]/40 text-xs uppercase tracking-wider">Or continue with</span>
        <div className="flex-1 h-px bg-[#F5F0E8]/15" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleClick('google')}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 h-11 bg-[#0D0A07] border border-[#3A3430] hover:border-[#C9A84C]/50 text-[#F5F0E8] text-sm font-medium rounded-none transition-colors disabled:opacity-50"
        >
          <GoogleIcon className="w-4 h-4" />
          {loadingProvider === 'google' ? 'Redirecting…' : 'Google'}
        </button>
        <button
          type="button"
          onClick={() => handleClick('facebook')}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 h-11 bg-[#0D0A07] border border-[#3A3430] hover:border-[#C9A84C]/50 text-[#F5F0E8] text-sm font-medium rounded-none transition-colors disabled:opacity-50"
        >
          <Facebook className="w-4 h-4 text-[#1877F2]" />
          {loadingProvider === 'facebook' ? 'Redirecting…' : 'Facebook'}
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
