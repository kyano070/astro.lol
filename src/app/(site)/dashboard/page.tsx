import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Editor from '@/components/Editor';
import { createClient } from '@/lib/supabase/server';
import type { LinkItem, Profile } from '@/lib/types';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false } };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-white">We couldn’t find your profile</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Your account exists but has no profile yet. Make sure <code>supabase/schema.sql</code> has been run, then sign up again.
        </p>
      </main>
    );
  }

  const { data: links } = await supabase
    .from('links')
    .select('id, platform, label, url, position')
    .eq('user_id', user.id)
    .order('position');

  return <Editor profile={profile as Profile} links={(links ?? []) as LinkItem[]} />;
}
