import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import heroImage from '@/assets/farmprofit-hero.jpg';
import { FarmButton } from './FarmButton';
import { FarmLogo } from './FarmLogo';
import { useAccount } from './AccountProvider';

export function LoginPage() {
  const navigate = useNavigate(); const { user, loading } = useAccount();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => { if (user) void navigate({ to: '/dashboard', replace: true }); }, [user, navigate]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setNotice('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (mode !== 'forgot' && password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (failure) throw failure;
        setNotice('If this email has an account, a password reset link is on its way.');
      } else if (mode === 'signup') {
        const { data, error: failure } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/login` } });
        if (failure) throw failure;
        if (!data.session) setNotice('Check your email to confirm your account, then return to sign in.');
        else await navigate({ to: '/dashboard', replace: true });
      } else {
        const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (failure) throw failure;
        await navigate({ to: '/dashboard', replace: true });
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Sign-in failed. Please try again.'); }
    finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/login` });
      if (result.error) throw result.error;
      if (result.redirected) return;
      const { data, error: failure } = await supabase.auth.getUser();
      if (failure || !data.user) throw new Error('Google sign-in did not complete. Please try again.');
      await navigate({ to: '/dashboard', replace: true });
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Google sign-in is unavailable. Try email sign-in.'); }
    finally { setBusy(false); }
  }
  const switchMode = (next: typeof mode) => { setMode(next); setError(''); setNotice(''); };
  return <main className="relative grid min-h-screen place-items-center bg-background px-4 py-12"><img src={heroImage} alt="Indian farmer in a tomato field" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-primary/80" /><div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-card sm:p-9"><Link to="/" className="inline-flex text-primary"><FarmLogo /></Link><p className="mt-8 text-xs font-extrabold uppercase text-primary">Plan before you plant</p><h1 className="mt-2 font-display text-3xl">{mode === 'signup' ? 'Start your farm journey' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === 'forgot' ? 'We’ll email you a secure reset link.' : 'Your farm. Your numbers. A clearer planting decision.'}</p>
    {loading ? <p role="status" className="mt-6 text-sm text-muted-foreground">Checking your account…</p> : <><FarmButton variant="secondary" className="mt-7 w-full" disabled={busy} onClick={google}><span className="text-lg font-extrabold text-primary" aria-hidden>G</span>Continue with Google</FarmButton><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or use email<span className="h-px flex-1 bg-border" /></div>
    {mode !== 'forgot' && <div className="mb-5 grid grid-cols-2 gap-2"><FarmButton variant={mode === 'login' ? 'primary' : 'secondary'} disabled={busy} onClick={() => switchMode('login')}>Sign in</FarmButton><FarmButton variant={mode === 'signup' ? 'primary' : 'secondary'} disabled={busy} onClick={() => switchMode('signup')}>Sign up</FarmButton></div>}
    <form onSubmit={submit} noValidate className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><input className="field-control" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></label>{mode !== 'forgot' && <label className="block"><span className="mb-2 block text-sm font-bold">Password</span><input className="field-control" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><span className="mt-1 block text-xs text-muted-foreground">At least 8 characters</span></label>}{error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}{notice && <p role="status" className="flex gap-2 text-sm leading-6 text-success"><Mail className="mt-1 shrink-0" size={16} />{notice}</p>}<FarmButton type="submit" className="w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in to FarmProfit'}<ArrowRight size={16} /></FarmButton></form><FarmButton variant="light" className="mt-3 w-full shadow-none" disabled={busy} onClick={() => switchMode(mode === 'forgot' ? 'login' : 'forgot')}>{mode === 'forgot' ? 'Back to sign in' : 'Forgot password?'}</FarmButton></>}
    <p className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground"><ShieldCheck size={16} />Your saved plans are private to your account.</p></div></main>;
}