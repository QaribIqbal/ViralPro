# Backend Architecture Decision (ViralPro + Supabase)

## Short answer
For your current stage, keep everything in this **single Next.js repo** and do not create a separate backend repo yet.

## Why this is industry-practical for MVP
- Faster shipping and fewer moving parts.
- Auth/session logic is already inside Next.js route handlers and middleware.
- Supabase provides managed DB + auth, reducing need for a custom backend layer.
- Easier deployment + CI for one repository.

## What to keep in this repo
- UI and app routes.
- Next.js API routes for server-only logic (n8n triggers, secure transformations, privileged DB access if needed).
- Supabase client utilities and SQL migrations.

## When to split into separate backend repo
Create a separate backend service only when at least one becomes true:
- Heavy background jobs and queues.
- Complex domain logic needing strict service boundaries.
- Multi-platform clients (web, mobile, partner APIs) sharing a large API surface.
- Distinct scaling/security/compliance requirements.

## Recommended next-stage structure in this repo
- `src/lib/supabase/*` for auth/session clients
- `src/app/api/*` for server workflows
- `src/server/*` for repositories/services/domain logic
- `supabase/*.sql` for schema + policy scripts

This gives you clean architecture now without premature microservice overhead.
