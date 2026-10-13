# Astro.lol

Een moderne, donkere profielpagina-website (bio-link) gebouwd met **Next.js 15 (App Router) + TypeScript**, **Tailwind CSS** en **Supabase** (auth, Postgres, storage).

## Starten

### 1. Supabase instellen
1. Maak een project op [supabase.com](https://supabase.com).
2. Open **SQL Editor**, plak de inhoud van `supabase/schema.sql` en voer het uit. Dit maakt de tabellen, row-level security, triggers en de storage-bucket `media` aan.
3. Ga naar **Authentication → URL Configuration** en zet:
   - *Site URL*: `http://localhost:3000` (later je echte domein, bv. `https://astro.lol`)
   - *Redirect URLs*: `http://localhost:3000/auth/callback` en `https://astro.lol/auth/callback`
4. (Optioneel) Onder **Authentication → Providers → Email** kun je "Confirm email" uitzetten voor snel testen.

### 2. Omgevingsvariabelen
```bash
cp .env.example .env.local
```
Vul `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` in (Project Settings → API).

### 3. Draaien
```bash
npm install
npm run dev
```
Open http://localhost:3000.

### 4. Live zetten op Cloudflare (Workers)
Het project gebruikt de OpenNext-adapter (`@opennextjs/cloudflare`) en `wrangler.jsonc`. Vereist Node 20+.
```bash
npx wrangler login                 # eenmalig
cp .dev.vars.example .dev.vars     # alleen voor lokaal testen met `npm run preview`

# Variabelen op Cloudflare zetten (build-tijd + runtime):
#  - Dashboard: Workers & Pages -> astro-lol -> Settings -> Variables and secrets
#    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL
#  - Zet dezelfde drie ook in een lokale `.env.local` vóór je `npm run deploy` draait,
#    want NEXT_PUBLIC_* wordt bij het builden in de code gezet.

npm run deploy                     # bouwt en deployt via `wrangler deploy`
```
Koppel daarna het domein `astro.lol` bij Workers & Pages -> astro-lol -> Settings -> Domains & Routes, en zet in Supabase de Site URL en redirect `https://astro.lol/auth/callback`.

Bouw je via Cloudflare "Workers Builds" (Git-koppeling)? Gebruik als build command `npx opennextjs-cloudflare build` en als deploy command `npx wrangler deploy`.

(Alternatief: Vercel werkt ook zonder aanpassingen.)

## Wat zit erin
- **Homepage**: hero, "Create your profile" / "Explore profiles", voorbeeldprofielen, functies, footer (About, Privacy, Terms, Contact)
- **Profielpagina's** op `/gebruikersnaam`: avatar, bio, status, sociale links, achtergrond, muziekspeler ("click to enter"), bezoekersteller, kopiëren/delen, rapporteren
- **Accounts**: registreren, inloggen, uitloggen, e-mailbevestiging, wachtwoorden gehasht door Supabase Auth
- **Dashboard** `/dashboard`: profiel-editor met **live preview**, links toevoegen/bewerken/verwijderen/herordenen (knoppen of slepen), thema's, kleuren, lettertypen, effecten, uploads, openbaar/privé
- **Explore** `/explore`: zoeken op gebruikersnaam, profielkaarten, "Load more"

## Beveiliging
- Alle invoer wordt **server-side gevalideerd** met Zod (`src/lib/validation.ts`) in server actions en API-routes.
- **Row Level Security** op alle tabellen: privéprofielen zijn alleen voor de eigenaar zichtbaar; gebruikers kunnen alleen hun eigen data wijzigen; `views` is niet door gebruikers aan te passen (column-level grants).
- Uploads: type, grootte én echte bestandsinhoud (magic bytes) worden gecontroleerd; bestanden gaan alleen naar de eigen map `media/<user-id>/`; opgeslagen afbeeldings-URL's worden op die map gecontroleerd.
- Link-URL's moeten `http(s)` zijn; links krijgen `rel="noopener noreferrer nofollow ugc"`.
- Middleware beschermt `/dashboard`; beveiligingsheaders staan in `next.config.mjs`.

## Nog te doen voor productie
- Rate limiting (bv. Upstash of Vercel Firewall) op registreren, rapporteren en bezoekersteller.
- Een moderatie-overzicht voor de `reports`-tabel (nu te bekijken in het Supabase dashboard).
- Privacy- en Terms-teksten laten nakijken door een jurist.
- Oude uploads opruimen wanneer iemand een avatar/achtergrond vervangt.
