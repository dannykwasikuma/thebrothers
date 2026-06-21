import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface AuthGateProps {
  /** Page content to render once the user IS signed in. */
  children: React.ReactNode;
  /** Where to send them after they sign in/up (defaults to current path). */
  redirectTo?: string;
  /** Short description of what they were trying to do, shown in the modal. */
  actionLabel?: string;
}

/**
 * Wrap any page that should be fully visible/browsable to guests but requires
 * an account to actually complete (Booking, Checkout). Instead of yanking the
 * guest straight to a full-page sign-in screen, this shows a focused modal
 * explaining why, with direct links into Sign In / Sign Up.
 */
const AuthGate: React.FC<AuthGateProps> = ({ children, redirectTo, actionLabel = 'complete this action' }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const basePath = (import.meta as any).env?.BASE_URL?.replace(/\/$/, '') || '';
  const returnPath = redirectTo || (typeof window !== 'undefined' ? window.location.pathname : '/');

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />;
  }

  if (isSignedIn) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Dim, non-interactive preview of the page behind the modal so it still feels browsable */}
      <div className="pointer-events-none select-none opacity-30 blur-[1px]">
        {children}
      </div>

      <Dialog open={true}>
        <DialogContent className="sm:max-w-md bg-[#0D0A07] border border-[#C9A84C]/30 rounded-none" hideClose>
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <DialogTitle className="text-2xl font-display text-[#C9A84C]">Sign In Required</DialogTitle>
            <DialogDescription className="text-[#F5F0E8]/70 font-serif text-base pt-2">
              Please sign in or create a free account to {actionLabel}. Browsing the rest of the site stays open to everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Link href={`${basePath}/sign-in?redirect=${encodeURIComponent(returnPath)}`}>
              <Button className="w-full bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none h-12">
                Sign In
              </Button>
            </Link>
            <Link href={`${basePath}/sign-up?redirect=${encodeURIComponent(returnPath)}`}>
              <Button variant="outline" className="w-full border-[#C9A84C]/40 text-[#F5F0E8] hover:bg-[#C9A84C]/10 rounded-none h-12">
                Create an Account
              </Button>
            </Link>
            <Link href={`${basePath}/`}>
              <Button variant="ghost" className="w-full text-[#F5F0E8]/50 hover:text-[#F5F0E8] hover:bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthGate;
