import type { Metadata } from 'next';
import { register } from '@/app/actions/auth';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Create your profile' };

export default function RegisterPage() {
  return <AuthForm mode="register" action={register} />;
}
