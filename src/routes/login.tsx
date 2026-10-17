import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/components/LoginPage';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/login')({ head: () => pageHead('Sign in', 'Sign in to FarmProfit to compare crop profits and save your personal farm plans.'), component: LoginPage });