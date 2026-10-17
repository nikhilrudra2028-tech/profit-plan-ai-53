import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { LogOut, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from './AccountProvider';
import { FarmButton } from './FarmButton';
import { FarmLogo } from './FarmLogo';

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAccount(); const navigate = useNavigate(); const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function signOut() {
    setBusy(true); setError(''); await queryClient.cancelQueries(); queryClient.clear();
    const { error: failure } = await supabase.auth.signOut();
    if (failure) { setError('Sign-out failed. Please try again.'); setBusy(false); return; }
    await navigate({ to: '/login', replace: true });
  }
  const name = user?.user_metadata['full_name'] ?? user?.user_metadata['name'];
  return <div className="min-h-screen bg-background"><header className="border-b border-border bg-surface"><div className="section-shell flex flex-wrap items-center justify-between gap-4 py-5"><Link to="/" aria-label="FarmProfit home"><FarmLogo /></Link><div className="flex items-center gap-3"><span className="hidden max-w-64 truncate text-sm text-muted-foreground sm:block">{typeof name === 'string' ? name : user?.email}</span><FarmButton variant="secondary" disabled={busy} onClick={signOut}><LogOut size={16} /><span>{busy ? 'Signing out…' : 'Sign out'}</span></FarmButton></div></div><nav className="section-shell flex flex-wrap gap-2 pb-4"><Link to="/dashboard" className="rounded-md px-4 py-2 text-sm font-bold text-muted-foreground" activeProps={{ className: 'bg-success-soft text-primary' }}>Dashboard</Link><Link to="/history" className="rounded-md px-4 py-2 text-sm font-bold text-muted-foreground" activeProps={{ className: 'bg-success-soft text-primary' }}>Saved plans</Link><Link to="/planner" className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Plus size={16} />New farm plan</Link></nav></header>{error && <p role="alert" className="section-shell pt-4 text-sm text-destructive">{error}</p>}<main className="section-shell py-10 md:py-14">{children}</main><footer className="section-shell border-t border-border py-6 text-xs leading-5 text-muted-foreground">FarmProfit · Plan before you plant. Estimates are illustrative, not live market data.</footer></div>;
}