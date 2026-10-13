import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const KINDS = {
  avatar: { max: 3 * 1024 * 1024, types: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] },
  background: { max: 8 * 1024 * 1024, types: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] },
  music: { max: 10 * 1024 * 1024, types: ['audio/mpeg', 'audio/ogg', 'audio/wav'] },
} as const;

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
};

/** Controleert de echte bestandsinhoud (magic bytes), niet alleen de opgegeven MIME-type. */
function matchesSignature(type: string, b: Uint8Array): boolean {
  const ascii = (start: number, len: number) => String.fromCharCode(...b.slice(start, start + len));
  switch (type) {
    case 'image/png':
      return b[0] === 0x89 && ascii(1, 3) === 'PNG';
    case 'image/jpeg':
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'image/gif':
      return ascii(0, 4) === 'GIF8';
    case 'image/webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
    case 'audio/mpeg':
      return ascii(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0);
    case 'audio/ogg':
      return ascii(0, 4) === 'OggS';
    case 'audio/wav':
      return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WAVE';
    default:
      return false;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }

  const kind = String(form.get('kind') ?? '') as keyof typeof KINDS;
  const file = form.get('file');
  const rule = KINDS[kind];
  if (!rule || !(file instanceof File)) return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });

  if (file.size === 0 || file.size > rule.max) {
    return NextResponse.json({ error: `File must be under ${Math.round(rule.max / 1024 / 1024)} MB.` }, { status: 400 });
  }
  if (!(rule.types as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(file.type, bytes)) {
    return NextResponse.json({ error: 'File content does not match its type.' }, { status: 400 });
  }

  const path = `${user.id}/${kind}-${Date.now()}.${EXT[file.type]}`;
  const { error } = await supabase.storage.from('media').upload(path, bytes, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
