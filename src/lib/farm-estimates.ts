import { z } from 'zod';

export const soils = ['Red soil', 'Black soil', 'Alluvial soil', 'Laterite soil', 'Not sure'] as const;
export const irrigations = ['Reliable irrigation', 'Limited irrigation', 'Rain-fed only'] as const;
export const farmSchema = z.object({
  location: z.string().trim().min(2, 'Enter your farm location').max(120),
  land: z.coerce.number().finite().positive('Enter a land size greater than zero').max(10000),
  soil: z.enum(soils),
  irrigation: z.enum(irrigations),
  budget: z.coerce.number().finite().min(10000, 'Enter a budget of at least ₹10,000').max(1000000000),
  crop: z.string().trim().min(1, 'Enter a previous crop or None').max(100),
});
export type FarmInput = z.infer<typeof farmSchema>;
export type CropEstimate = { crop: string; investment: number; revenue: number; profit: number; roi: number; risk: 'Low' | 'Medium' | 'High'; affordable: boolean; yieldKg: number; pricePerKg: number; yieldFactor: number; reason: string };
export type FarmResult = { version: string; crops: CropEstimate[]; recommended: string | null; assumptions: string[] };

const models = [
  { crop: 'Tomato', cost: 42000, kg: 10000, price: 18.5, soils: ['Red soil', 'Alluvial soil'], water: true },
  { crop: 'Chilli', cost: 35000, kg: 2500, price: 62, soils: ['Black soil', 'Red soil'], water: true },
  { crop: 'Groundnut', cost: 24000, kg: 1300, price: 60, soils: ['Red soil', 'Laterite soil'], water: false },
  { crop: 'Ragi', cost: 18000, kg: 1700, price: 32, soils: ['Red soil', 'Laterite soil'], water: false },
];

export function estimateFarm(raw: FarmInput): FarmResult {
  const input = farmSchema.parse(raw);
  const crops: CropEstimate[] = models.map(model => {
    const soilFactor = input.soil === 'Not sure' ? 0.9 : model.soils.includes(input.soil) ? 1 : 0.85;
    const waterFactor = input.irrigation === 'Reliable irrigation' ? 1 : input.irrigation === 'Limited irrigation' ? (model.water ? 0.75 : 0.95) : (model.water ? 0.45 : 0.85);
    const rotationFactor = input.crop.toLowerCase().includes(model.crop.toLowerCase()) ? 0.9 : 1;
    const yieldFactor = soilFactor * waterFactor * rotationFactor;
    const investment = Math.round(model.cost * input.land);
    const yieldKg = Math.round(model.kg * input.land * yieldFactor);
    const revenue = Math.round(yieldKg * model.price);
    const profit = revenue - investment;
    const risk = model.water ? (input.irrigation === 'Reliable irrigation' && rotationFactor === 1 ? 'Medium' : 'High') : (yieldFactor >= 0.8 ? 'Low' : 'Medium');
    return { crop: model.crop, investment, revenue, profit, roi: Math.round(profit / investment * 1000) / 10, risk, affordable: investment <= input.budget, yieldKg, pricePerKg: model.price, yieldFactor, reason: `${model.soils.includes(input.soil) ? 'Preferred' : input.soil === 'Not sure' ? 'Unverified' : 'Non-preferred'} soil; ${input.irrigation.toLowerCase()}${rotationFactor < 1 ? '; repeat-crop yield reduction applied' : ''}.` };
  }).sort((a, b) => Number(b.affordable) - Number(a.affordable) || b.profit - a.profit);
  const best = crops.find(crop => crop.affordable && crop.profit > 0);
  return { version: 'heuristic-v1', crops, recommended: best?.crop ?? null, assumptions: [
    'Illustrative one-season, per-acre baselines, not live market data or an agronomic prescription.',
    'Base costs/acre: Tomato ₹42,000; Chilli ₹35,000; Groundnut ₹24,000; Ragi ₹18,000. Includes assumed inputs, labour and transport; excludes land rent and finance costs.',
    'Base yield/acre: Tomato 10,000 kg; Chilli 2,500 kg; Groundnut 1,300 kg; Ragi 1,700 kg. Assumed prices/kg: ₹18.50, ₹62, ₹60, ₹32 respectively.',
    'Yield multipliers: preferred soil 1.0, other soil 0.85, unknown 0.90; limited water 0.75 for vegetables / 0.95 for other crops; rain-fed 0.45 / 0.85. Repeat crop 0.90.',
    `Location (${input.location}) is recorded only; no local weather, soil tests, or market feeds are connected.`,
    'Costs scale with the full stated acreage. Only crops within your budget and with positive estimated profit are recommended. Profit = revenue − investment; ROI = profit ÷ investment × 100.',
  ] };
}

export const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
export const disclaimer = 'Illustrative estimates, not financial advice. Actual results vary by yield, market prices, weather, crop health and input costs.';