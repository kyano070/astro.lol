import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { usernameSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = usernameSchema.safeParse(body?.username);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  await (await createClient()).rpc('increment_views', { p_username: parsed.data });
  return NextResponse.json({ ok: true });
}
