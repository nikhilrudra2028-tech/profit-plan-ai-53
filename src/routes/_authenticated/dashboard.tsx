import { createFileRoute } from '@tanstack/react-router';
import { SavedPlans } from '@/components/SavedPlans';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/dashboard')({ head: () => pageHead('Dashboard', 'Your private FarmProfit workspace with saved crop profit comparisons.'), component: SavedPlans });