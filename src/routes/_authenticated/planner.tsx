import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Sparkles, Save, ArrowLeft } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { FarmButton } from '@/components/FarmButton';
import { PlanResults } from '@/components/PlanResults';
import { estimateFarm, farmSchema, soils, irrigations, disclaimer, type FarmInput, type FarmResult } from '@/lib/farm-estimates';
import { savePlan } from '@/lib/plans.functions';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/planner')({ head: () => pageHead('Farm planner', 'Compare illustrative crop investments, returns and risk for your own farm.'), component: PlannerPage });
function PlannerPage() {
  const [form, setForm] = useState({ location: '', land: '', soil: '', irrigation: '', budget: '', crop: '' });
  const [errors, setErrors] = useState<Record<string, string>>({}); const [error, setError] = useState('');
  const [generated, setGenerated] = useState<{ farm: FarmInput; result: FarmResult } | null>(null); const [busy, setBusy] = useState(false); const [saving, setSaving] = useState(false);
  const save = useServerFn(savePlan); const navigate = useNavigate(); const queryClient = useQueryClient();
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); const parsed = farmSchema.safeParse(form);
    if (!parsed.success) { const next: Record<string, string> = {}; parsed.error.issues.forEach(issue => { const key = issue.path[0]; if (typeof key === 'string') next[key] = issue.message; }); setErrors(next); return; }
    setErrors({}); setBusy(true);
    try { await new Promise(resolve => setTimeout(resolve, 350)); setGenerated({ farm: parsed.data, result: estimateFarm(parsed.data) }); }
    catch { setError('Could not calculate your plan. Check your details and try again.'); }
    finally { setBusy(false); }
  }
  async function persist() {
    if (!generated || saving) return; setSaving(true); setError('');
    try { const row = await save({ data: generated.farm }); await queryClient.invalidateQueries({ queryKey: ['farm-plans'] }); await navigate({ to: '/plans/$id', params: { id: row.id } }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save your plan. Please try again.'); }
    finally { setSaving(false); }
  }
  const field = (name: 'location' | 'land' | 'budget' | 'crop', label: string, placeholder: string, type = 'text') => <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><input className="field-control" type={type} step={type === 'number' ? 'any' : undefined} placeholder={placeholder} value={form[name]} disabled={busy} aria-invalid={!!errors[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} />{errors[name] && <span className="mt-1 block text-xs text-destructive">{errors[name]}</span>}</label>;
  const select = (name: 'soil' | 'irrigation', label: string, options: readonly string[]) => <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><select className="field-control" value={form[name]} disabled={busy} aria-invalid={!!errors[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}><option value="">Select an option</option>{options.map(o => <option key={o}>{o}</option>)}</select>{errors[name] && <span className="mt-1 block text-xs text-destructive">Select an option</span>}</label>;
  return <AppShell>{generated ? <><div className="mb-7 flex flex-wrap justify-between gap-3"><FarmButton variant="secondary" disabled={saving} onClick={() => { setGenerated(null); setError(''); }}><ArrowLeft size={16} />Edit farm details</FarmButton><FarmButton disabled={saving} onClick={persist}><Save size={16} />{saving ? 'Saving…' : 'Save plan'}</FarmButton></div>{error && <p role="alert" className="mb-5 text-sm text-destructive">{error}</p>}<PlanResults farm={generated.farm} result={generated.result} /></> : <><p className="text-xs font-bold uppercase text-primary">Your next season</p><h1 className="mt-3 font-display text-4xl">Let’s plan your farm.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Compare crop costs and potential returns using transparent, illustrative assumptions.</p><form onSubmit={submit} noValidate className="mt-9 max-w-4xl border-t border-border pt-8"><div className="grid gap-6 md:grid-cols-2">{field('location', 'Farm location', 'e.g. Kolar, Karnataka')}{field('land', 'Land size (acres)', 'e.g. 2', 'number')}{select('soil', 'Soil type', soils)}{select('irrigation', 'Irrigation availability', irrigations)}{field('budget', 'Available budget (₹)', 'e.g. 50000', 'number')}{field('crop', 'Current / previous crop', 'e.g. Ragi or None')}</div>{error && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}<div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-border pt-6 sm:flex-row"><p className="max-w-lg text-xs leading-6 text-muted-foreground">{disclaimer}</p><FarmButton type="submit" disabled={busy} className="w-full shrink-0 sm:w-auto"><Sparkles size={17} />{busy ? 'Calculating your plan…' : 'Generate my farm plan'}</FarmButton></div>{busy && <p role="status" className="mt-4 text-sm text-primary">Comparing crop costs, estimated yield and budget fit…</p>}</form></>}</AppShell>;
}