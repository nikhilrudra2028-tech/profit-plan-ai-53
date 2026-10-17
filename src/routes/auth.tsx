import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/components/LoginPage';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/auth')({ head: () => pageHead('Account access', 'Access your FarmProfit account and continue to your private farm planning area.'), component: LoginPage });