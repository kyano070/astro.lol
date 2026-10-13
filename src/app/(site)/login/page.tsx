import type { Metadata } from 'next';
import { login } from '@/app/actions/auth';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthForm mode="login" action={login} next={next} />;
}
