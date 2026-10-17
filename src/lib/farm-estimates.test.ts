import { describe, expect, it } from 'vitest';
import { estimateFarm, farmSchema, type FarmInput } from './farm-estimates';

const farm: FarmInput = { location: 'Kolar, Karnataka', land: 1, soil: 'Red soil', irrigation: 'Reliable irrigation', budget: 50000, crop: 'None' };
describe('farm profitability rules', () => {
  it('calculates profit and ROI from investment and revenue', () => {
    const tomato = estimateFarm(farm).crops.find(c => c.crop === 'Tomato');
    expect(tomato?.investment).toBe(42000); expect(tomato?.revenue).toBe(185000);
    expect(tomato?.profit).toBe(143000); expect(tomato?.roi).toBe(340.5);
  });
  it('scales costs with land size in acres', () => { expect(estimateFarm({ ...farm, land: 2 }).crops.find(c => c.crop === 'Tomato')?.investment).toBe(84000); });
  it('never recommends a crop above available budget', () => { expect(estimateFarm({ ...farm, budget: 24000 }).recommended).toBe('Groundnut'); });
  it('shows no affordable recommendation when the budget cannot cover any crop', () => { expect(estimateFarm({ ...farm, budget: 10000 }).recommended).toBeNull(); });
  it('requires the existing minimum budget of 10000', () => { expect(farmSchema.safeParse({ ...farm, budget: 9999 }).success).toBe(false); expect(farmSchema.safeParse({ ...farm, budget: 10000 }).success).toBe(true); });
  it('rejects zero or negative acreage', () => { expect(farmSchema.safeParse({ ...farm, land: 0 }).success).toBe(false); expect(farmSchema.safeParse({ ...farm, land: -1 }).success).toBe(false); });
  it('uses irrigation to reduce illustrative yield', () => { expect(estimateFarm({ ...farm, irrigation: 'Rain-fed only' }).crops.find(c => c.crop === 'Tomato')?.yieldKg).toBe(4500); });
  it('uses soil type in illustrative yield', () => { expect(estimateFarm({ ...farm, soil: 'Black soil' }).crops.find(c => c.crop === 'Tomato')?.yieldKg).toBe(8500); });
  it('uses previous crop in illustrative yield', () => { expect(estimateFarm({ ...farm, crop: 'Tomato' }).crops.find(c => c.crop === 'Tomato')?.yieldKg).toBe(9000); });
  it('does not fabricate location-based pricing', () => { expect(estimateFarm({ ...farm, location: 'Mysuru' }).crops).toEqual(estimateFarm(farm).crops); });
});