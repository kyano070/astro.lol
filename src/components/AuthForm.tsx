'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/app/actions/auth';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full" disabled={pending}>
      {pending ? 'One moment…' : label}
    </button>
  );
}

type Props = {
  mode: 'login' | 'register';
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  next?: string;
};

export default function AuthForm({ mode, action, next }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const isRegister = mode === 'register';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:py-24">
      <div className="panel animate-fade-up !p-8">
        <h1 className="text-2xl font-bold text-white">{isRegister ? 'Create your profile' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isRegister ? 'Claim your username and make it yours.' : 'Log in to edit your profile.'}
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          {isRegister && (
            <div>
              <label className="label" htmlFor="username">Username</label>
              <div className="flex items-center rounded-xl border border-white/10 bg-ink-800/80 focus-within:border-astro-soft/60 focus-within:ring-2 focus-within:ring-astro/20">
                <span className="pl-3.5 text-sm text-zinc-500">astro.lol/</span>
                <input
                  id="username"
                  name="username"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_]{3,20}"
                  autoComplete="username"
                  className="w-full bg-transparent px-1.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  placeholder="yourname"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={isRegister ? 8 : 1}
              maxLength={72}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="input"
              placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
            />
          </div>

          {state?.error && (
            <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {state.error}
            </p>
          )}
          {state?.message && (
            <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {state.message}
            </p>
          )}

          <Submit label={isRegister ? 'Create account' : 'Log in'} />
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-astro-soft hover:underline">Log in</Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link href="/register" className="text-astro-soft hover:underline">Create your profile</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
