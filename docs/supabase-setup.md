# Supabase Setup Guide (ViralPro)

## 1. Create Supabase project
1. Go to https://supabase.com and create a new project.
2. Open Project Settings -> API.
3. Copy:
- Project URL
- Publishable key (or anon key if your project still uses legacy naming)

## 2. Set environment variables
Use `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Then validate:

```bash
npm run check:supabase-env
```

## 3. Configure auth providers
Open Supabase Dashboard -> Authentication -> Providers.

### Email auth
- Enable Email provider.
- Choose confirm-email setting based on your flow.

### Google OAuth
- Enable Google provider.
- Add Google client id + secret.
- Add redirect URL in Google console and Supabase:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback` (production)

## 4. Create initial database schema
Run SQL from:
- `supabase/schema.sql`

This creates `profiles` and onboarding trigger from `auth.users`.

## 5. Verify auth flow
1. Start app:

```bash
npm run dev
```

2. Sign up at `/sign-up`.
3. Sign in at `/sign-in`.
4. Verify session endpoint:

```bash
curl http://localhost:3000/api/auth/session
```

## 6. Notes on current repo wiring
- Supabase browser client: `src/lib/supabase/client.ts`
- Supabase server client: `src/lib/supabase/server.ts`
- Session refresh middleware: `middleware.ts`, `src/lib/supabase/middleware.ts`
- OAuth callback handler: `src/app/auth/callback/route.ts`

## 7. Security notes
- Never expose service role key to browser.
- Keep service role key only for secure server jobs if you add admin workflows later.
- Keep RLS enabled on all user data tables.
