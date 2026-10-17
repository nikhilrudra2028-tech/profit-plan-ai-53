import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { AppShell } from '@/components/AppShell';
import { FarmButton } from '@/components/FarmButton';
import { PlanResults } from '@/components/PlanResults';
import { useAccount } from '@/components/AccountProvider';
import { getPlan, deletePlan } from '@/lib/plans.functions';
import { farmSchema, type FarmResult } from '@/lib/farm-estimates';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/plans/$id')({ head: () => pageHead('Farm plan details', 'Review a private saved crop comparison and its estimated investment, revenue, profit and risk.'), component: PlanPage });
function PlanPage() {
  const { id } = Route.useParams(); const { user } = useAccount(); const fetchPlan = useServerFn(getPlan); const remove = useServerFn(deletePlan); const navigate = useNavigate(); const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const query = useQuery({ queryKey: ['farm-plan', user?.id, id], queryFn: () => fetchPlan({ data: { id } }), enabled: z.string().uuid().safeParse(id).success, retry: 1 });
  async function deleteSaved() {
    setBusy(true); setError('');
    try { await remove({ data: { id } }); queryClient.removeQueries({ queryKey: ['farm-plan', user?.id, id] }); await queryClient.invalidateQueries({ queryKey: ['farm-plans'] }); await navigate({ to: '/history', replace: true }); }
    catch { setError('Could not delete your plan. Please try again.'); setBusy(false); }
  }
  const row = query.data;
  return <AppShell><div className="mb-7 flex flex-wrap justify-between gap-3"><FarmButton variant="secondary" onClick={() => navigate({ to: '/history' })}><ArrowLeft size={16} />Saved plans</FarmButton>{row && <FarmButton variant="secondary" disabled={busy} onClick={() => setConfirm(true)}><Trash2 size={16} />Delete plan</FarmButton>}</div>{confirm && <div role="alertdialog" aria-label="Delete saved plan" className="mb-6 rounded-lg border border-border bg-warning-soft p-5"><p className="text-sm font-bold">Delete this saved plan? This cannot be undone.</p><div className="mt-4 flex gap-3"><FarmButton disabled={busy} onClick={deleteSaved}>{busy ? 'Deleting…' : 'Confirm delete'}</FarmButton><FarmButton variant="secondary" disabled={busy} onClick={() => setConfirm(false)}>Cancel</FarmButton></div></div>}{error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}{!z.string().uuid().safeParse(id).success ? <h1 className="font-display text-3xl">Plan unavailable</h1> : query.isPending ? <p role="status" className="py-12 text-muted-foreground">Loading your plan…</p> : query.isError ? <><p role="alert" className="text-destructive">Could not load this plan.</p><FarmButton className="mt-4" onClick={() => query.refetch()}>Try again</FarmButton></> : !row ? <><h1 className="font-display text-3xl">Plan unavailable</h1><p className="mt-3 text-sm text-muted-foreground">This plan does not exist or is not part of your account.</p></> : <><p className="mb-6 text-xs text-muted-foreground">Saved {new Date(row.created_at).toLocaleString('en-IN')}</p><PlanResults farm={farmSchema.parse({ location: row.location, land: row.land_acres, soil: row.soil_type, irrigation: row.irrigation, budget: row.budget, crop: row.previous_crop })} result={row.results as unknown as FarmResult} /></>}</AppShell>;
}