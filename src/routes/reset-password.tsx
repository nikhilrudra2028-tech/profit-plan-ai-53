import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FarmButton } from '@/components/FarmButton';
import { FarmLogo } from '@/components/FarmLogo';
import { pageHead } from '@/lib/page-head';
import { useAccount } from '@/components/AccountProvider';
export const Route = createFileRoute('/reset-password')({ head: () => pageHead('Reset password', 'Securely set a new password for your FarmProfit account.'), component: ResetPassword });
function ResetPassword() {
  const { user, loading, recovery } = useAccount();
  const ready = !loading && recovery && !!user;
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState(false); const navigate = useNavigate();
  const recoveryError = loading ? '' : !recovery ? 'Open the password reset link from your email to continue.' : !user ? 'This reset link is invalid or expired. Request a new one from sign in.' : '';
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!ready) return;
    if (password.length < 8 || password !== confirm) { setError('Use at least 8 characters and ensure both passwords match.'); return; }
    setBusy(true); setError('');
    try {
      const { error: failure } = await supabase.auth.updateUser({ password });
      if (failure) { setError(failure.message); return; }
      sessionStorage.removeItem('farmprofit-recovery'); setDone(true);
    } catch { setError('Your password could not be updated. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center px-4 py-10"><div className="w-full max-w-md rounded-lg border border-border bg-surface p-8"><Link to="/"><FarmLogo /></Link><h1 className="mt-7 font-display text-3xl">Set a new password</h1>{done ? <><p role="status" className="mt-5 text-success">Your password has been updated.</p><FarmButton className="mt-5 w-full" onClick={() => navigate({ to: '/dashboard' })}>Continue to dashboard</FarmButton></> : <form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-sm font-bold">New password<input className="field-control mt-2" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} disabled={!ready || busy} /></label><label className="block text-sm font-bold">Confirm new password<input className="field-control mt-2" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={!ready || busy} /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<FarmButton className="w-full" disabled={!ready || busy}>{busy ? 'Updating…' : 'Update password'}</FarmButton></form>}<Link to="/login" className="mt-5 block text-sm font-bold text-primary">Back to sign in</Link></div></main>;
}