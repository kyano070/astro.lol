import type { SupabaseClient } from '@supabase/supabase-js';
import { PAGE_SIZE } from './constants';
import type { CardProfile } from './types';

const CARD_FIELDS = 'username, display_name, bio, avatar_url, background_url, accent_color, bg_color, views';

/** Zoekt openbare profielen op gebruikersnaam, meest bekeken eerst. */
export async function searchProfiles(
  supabase: SupabaseClient,
  q: string,
  offset: number,
): Promise<{ profiles: CardProfile[]; hasMore: boolean }> {
  const clean = q.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);

  let query = supabase.from('profiles').select(CARD_FIELDS).eq('is_public', true);
  if (clean) {
    // "_" is een wildcard in LIKE, dus escapen
    query = query.ilike('username', `%${clean.replace(/_/g, '\\_')}%`);
  }

  const { data, error } = await query
    .order('views', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id')
    .range(offset, offset + PAGE_SIZE); // PAGE_SIZE + 1 rijen om hasMore te bepalen

  if (error) return { profiles: [], hasMore: false };
  const rows = (data ?? []) as unknown as CardProfile[];
  return { profiles: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE };
}
