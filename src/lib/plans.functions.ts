import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { estimateFarm, farmSchema } from './farm-estimates';
import type { Json } from '@/integrations/supabase/types';

export const listPlans = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('farm_plans').select('*').eq('user_id', context.userId).order('created_at', { ascending: false });
  if (error) throw new Error('Could not load saved plans. Please try again.');
  return data;
});
export const savePlan = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(farmSchema).handler(async ({ data, context }) => {
  const result = estimateFarm(data);
  const { data: row, error } = await context.supabase.from('farm_plans').insert({ user_id: context.userId, location: data.location, land_acres: data.land, soil_type: data.soil, irrigation: data.irrigation, budget: data.budget, previous_crop: data.crop, results: result as unknown as Json, calculation_version: result.version }).select('id').single();
  if (error) throw new Error('Your plan could not be saved. Please try again.');
  return row;
});
export const getPlan = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from('farm_plans').select('*').eq('id', data.id).eq('user_id', context.userId).maybeSingle();
  if (error) throw new Error('Could not load this plan. Please try again.');
  return row;
});
export const deletePlan = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('farm_plans').delete().eq('id', data.id).eq('user_id', context.userId);
  if (error) throw new Error('Could not delete this plan. Please try again.');
  return { success: true };
});