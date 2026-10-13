'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '@/lib/validation';

export type FormState = { error?: string; message?: string } | undefined;

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };

  const { username, email, password } = parsed.data;
  const supabase = await createClient();

  const { data: available } = await supabase.rpc('username_available', { p_username: username });
  if (available === false) return { error: 'That username is already taken.' };

  const origin = (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username }, emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    if (/already registered/i.test(error.message)) return { error: 'An account with this email already exists.' };
    if (/database error/i.test(error.message)) return { error: 'That username is already taken.' };
    return { error: error.message };
  }

  // Zonder e-mailbevestiging is er direct een sessie
  if (data.session) redirect('/dashboard');
  return { message: 'Almost there! Check your inbox and confirm your email to finish signing up.' };
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Bewust algemeen: lekt niet of een e-mailadres bestaat
    return { error: 'Incorrect email or password.' };
  }
  redirect(safeNext(formData.get('next')));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
