import { supabase } from './supabase';

/**
 * Thin wrapper around Supabase Auth covering both login methods this site
 * supports: email+password and phone+OTP. Every function here returns a
 * plain { ok, error? } shape so pages don't need to know Supabase's
 * internal error format.
 */

export interface AuthResult {
  ok: boolean;
  error?: string;
}

// ── Email + password ──────────────────────────────────────────────────────
export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Phone + OTP ──────────────────────────────────────────────────────────
/** Step 1: send a one-time code via SMS to the given phone number (E.164 format, e.g. +233547164110). */
export async function sendPhoneOtp(phone: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Step 2: verify the code the user received by SMS. Creates the account automatically if it's their first time. */
export async function verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Social login (Google, Facebook) ──────────────────────────────────────
/** Unlike the functions above, this doesn't "complete" here — it redirects the
 *  whole page to Google/Facebook's consent screen, then back to `redirectTo`
 *  once the person approves. Only returns early (with ok:false) if Supabase
 *  rejects the request before the redirect even happens — e.g. the provider
 *  isn't enabled yet in your Supabase dashboard. Requires Google/Facebook to
 *  be configured under Authentication -> Providers first (see SETUP_GUIDE.md). */
export async function signInWithSocialProvider(
  provider: 'google' | 'facebook',
  redirectTo: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}${redirectTo}`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Forgot / reset password ────────────────────────────────────────────
/** Step 1: sends a password-reset link to the given email. The link
 *  takes the person to `${redirectTo}` (typically /reset-password) with a
 *  recovery token in the URL, which Supabase reads automatically and turns
 *  into a temporary signed-in session — that's what ResetPasswordPage checks
 *  for before letting them set a new password. Requires the redirect URL to
 *  be added under Supabase Dashboard -> Authentication -> URL Configuration
 *  -> Redirect URLs, or Supabase will reject it. */
export async function sendPasswordResetEmail(email: string, redirectTo: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${redirectTo}`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Step 2: sets a new password for whoever the current (recovery) session
 *  belongs to. Only works while a valid recovery session from the emailed
 *  link is active — see ResetPasswordPage for the check that gates this. */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Shared ───────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
