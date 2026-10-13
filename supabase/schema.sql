-- =====================================================================
-- Astro.lol — Supabase schema
-- Plak dit in Supabase -> SQL Editor en voer het één keer uit.
-- =====================================================================

-- ---------- PROFILES -------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  bio text check (char_length(bio) <= 300),
  status text check (char_length(status) <= 80),
  avatar_url text,
  background_url text,
  music_url text,
  accent_color text not null default '#8b5cf6' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  bg_color text not null default '#07070d' check (bg_color ~ '^#[0-9a-fA-F]{6}$'),
  text_color text not null default '#f4f4f8' check (text_color ~ '^#[0-9a-fA-F]{6}$'),
  font text not null default 'sans' check (font in ('sans', 'rounded', 'serif', 'mono')),
  theme text not null default 'midnight',
  effect_animation boolean not null default true,
  effect_glow boolean not null default true,
  effect_particles boolean not null default false,
  effect_blur boolean not null default true,
  is_public boolean not null default true,
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_public_views_idx on public.profiles (views desc) where is_public;

alter table public.profiles enable row level security;

create policy "Public profiles are readable; owners read their own"
  on public.profiles for select
  using (is_public or auth.uid() = id);

create policy "Owners update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Gebruikers mogen alleen specifieke kolommen wijzigen (dus NIET views/id/created_at)
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (
  username, display_name, bio, status, avatar_url, background_url, music_url,
  accent_color, bg_color, text_color, font, theme,
  effect_animation, effect_glow, effect_particles, effect_blur, is_public
) on public.profiles to authenticated;

-- updated_at
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Profiel automatisch aanmaken bij registratie (gebruikersnaam komt uit signup-metadata)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    new.raw_user_meta_data ->> 'username'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is een gebruikersnaam nog vrij? (ook voor privéprofielen, zonder data te lekken)
create function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- Bezoekersteller (alleen publieke profielen)
create function public.increment_views(p_username text) returns void
language sql security definer set search_path = public as $$
  update public.profiles
     set views = views + 1
   where username = lower(p_username) and is_public;
$$;
grant execute on function public.increment_views(text) to anon, authenticated;

-- ---------- LINKS ----------------------------------------------------
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in
    ('discord','youtube','twitch','github','instagram','x','tiktok','spotify','website')),
  label text not null check (char_length(label) between 1 and 40),
  url text not null check (url ~* '^https?://' and char_length(url) <= 500),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index links_user_position_idx on public.links (user_id, position);

alter table public.links enable row level security;

create policy "Links readable on public profiles or by owner"
  on public.links for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = links.user_id and p.is_public)
  );

create policy "Owners insert links" on public.links for insert with check (user_id = auth.uid());
create policy "Owners update links" on public.links for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Owners delete links" on public.links for delete using (user_id = auth.uid());

-- Alle links van de gebruiker in één transactie vervangen (volgorde = array-volgorde)
create function public.save_links(p_links jsonb) returns void
language plpgsql security invoker as $$
begin
  if jsonb_array_length(p_links) > 12 then
    raise exception 'Too many links';
  end if;
  delete from public.links where user_id = auth.uid();
  insert into public.links (user_id, platform, label, url, position)
  select auth.uid(), x ->> 'platform', x ->> 'label', x ->> 'url', (ord - 1)::int
  from jsonb_array_elements(p_links) with ordinality as t (x, ord);
end $$;
grant execute on function public.save_links(jsonb) to authenticated;

-- ---------- REPORTS --------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reporter_id uuid references auth.users (id) on delete set null,
  reason text not null check (reason in ('spam','impersonation','inappropriate','harassment','other')),
  details text check (char_length(details) <= 500),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Iedereen mag rapporteren; niemand kan rapporten lezen via de API (alleen jij in het dashboard)
create policy "Anyone can file a report"
  on public.reports for insert
  to anon, authenticated
  with check (reporter_id is null or reporter_id = auth.uid());

-- ---------- STORAGE --------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/png','image/jpeg','image/webp','image/gif','audio/mpeg','audio/ogg','audio/wav']
)
on conflict (id) do nothing;

-- Gebruikers mogen alleen in hun eigen map (<user-id>/...) schrijven
create policy "Users upload into their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update their own files"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
