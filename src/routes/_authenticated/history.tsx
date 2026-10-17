import { createFileRoute } from '@tanstack/react-router';
import { SavedPlans } from '@/components/SavedPlans';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/history')({ head: () => pageHead('Saved plans', 'Revisit your saved FarmProfit plans and their original cost and yield assumptions.'), component: () => <SavedPlans history /> });