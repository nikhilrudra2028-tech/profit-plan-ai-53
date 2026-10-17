import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const AccountContext = createContext<{ user: User | null; loading: boolean; recovery: boolean }>({ user: null, loading: true, recovery: false });
export const useAccount = () => useContext(AccountContext);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    // Capture recovery before initializing auth, which can consume the URL hash.
    const recoveryLink = window.location.pathname === '/reset-password' && new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    if (recoveryLink) sessionStorage.setItem('farmprofit-recovery', 'pending');
    setRecovery(sessionStorage.getItem('farmprofit-recovery') === 'pending');
    const refresh = async () => {
      const { data } = await supabase.auth.getUser();
      if (active) { setUser(data.user); setLoading(false); }
    };
    void refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED' && event !== 'PASSWORD_RECOVERY') return;
      if (event === 'PASSWORD_RECOVERY') { sessionStorage.setItem('farmprofit-recovery', 'pending'); setRecovery(true); }
      if (event === 'SIGNED_OUT') { sessionStorage.removeItem('farmprofit-recovery'); setRecovery(false); setUser(null); setLoading(false); queryClient.clear(); void router.invalidate(); return; }
      // Defer auth calls until the auth listener releases its internal lock.
      setTimeout(() => { if (active) { void refresh(); void router.invalidate(); void queryClient.invalidateQueries(); } }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [queryClient, router]);
  return <AccountContext.Provider value={{ user, loading, recovery }}>{children}</AccountContext.Provider>;
}