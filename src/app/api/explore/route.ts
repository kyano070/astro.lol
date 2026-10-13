import { NextResponse } from 'next/server';
import { searchProfiles } from '@/lib/profiles';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').slice(0, 40);
  const offset = Math.min(Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0), 10_000);

  const result = await searchProfiles(await createClient(), q, offset);
  return NextResponse.json(result);
}
