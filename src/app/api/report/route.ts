import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid report.' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', parsed.data.username)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  if (user?.id === profile.id) return NextResponse.json({ error: "You can't report yourself." }, { status: 400 });

  const { error } = await supabase.from('reports').insert({
    profile_id: profile.id,
    reporter_id: user?.id ?? null,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });
  if (error) return NextResponse.json({ error: 'Could not send your report.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
