import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileView from '@/components/ProfileView';
import { createClient } from '@/lib/supabase/server';
import type { LinkItem, Profile } from '@/lib/types';

type Params = { params: Promise<{ username: string }> };

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const username = (await params).username.toLowerCase();
  if (!USERNAME_RE.test(username)) return { title: 'Profile not found' };

  const { data } = await (await createClient())
    .from('profiles')
    .select('display_name, bio, avatar_url, is_public')
    .eq('username', username)
    .maybeSingle();

  if (!data || !data.is_public) return { title: 'Profile not found', robots: { index: false } };

  const name = data.display_name || username;
  return {
    title: `${name} (@${username})`,
    description: data.bio ?? `${name} on Astro.lol`,
    openGraph: { title: `${name} on Astro.lol`, description: data.bio ?? undefined, images: data.avatar_url ? [data.avatar_url] : undefined },
  };
}

export default async function ProfilePage({ params }: Params) {
  const username = (await params).username.toLowerCase();
  if (!USERNAME_RE.test(username)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
  const profile = data as Profile | null;
  if (!profile) notFound(); // RLS verbergt privéprofielen voor anderen

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  const { data: links } = await supabase
    .from('links')
    .select('id, platform, label, url, position')
    .eq('user_id', profile.id)
    .order('position');

  return (
    <ProfileView
      profile={profile}
      links={(links ?? []) as LinkItem[]}
      isOwner={isOwner}
      notice={!profile.is_public ? 'Only you can see this profile (private).' : undefined}
    />
  );
}
