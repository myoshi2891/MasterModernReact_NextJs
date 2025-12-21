---
name: typescript-migration-plan
description: Next.js App Router TS migration plan (phased)
---

# Plan

Migrate the existing Next.js 14 App Router codebase from JavaScript to TypeScript without changing runtime behavior. Enable strict type checking from the start, introduce shared domain types and generated Supabase types, then convert files from the data layer outward to UI. Finish by disabling allowJs and validating build/lint/typecheck.

## Requirements
- Preserve current behavior and routing; type additions only
- Enable strict type checking from day one
- Generate Supabase types via `supabase gen types`
- Keep allowJs enabled during the migration, then disable it after completion
- Ensure `next build`, `next lint`, and `tsc --noEmit` succeed

## Scope
- In: `app/**`, `app/_lib/**`, `app/_components/**`, `app/api/**/route.js`, `middleware.js`, `package.json`, `jsconfig.json`
- Out: DB/schema changes, auth provider changes, UI/UX redesign, new features

## Files and entry points
- `package.json` (add TS dev deps, add `typecheck` script)
- `jsconfig.json` -> `tsconfig.json` (paths, strict options)
- `next-env.d.ts`
- `types/next-auth.d.ts`
- `types/supabase.ts` (generated)
- `types/domain.ts` (Cabin, Booking, Guest, Settings, etc.)
- `middleware.ts`
- `app/_lib/auth.ts`, `app/_lib/actions.ts`, `app/_lib/data-service.ts`, `app/_lib/supabaseBrowser.ts`, `app/_lib/supabaseServer.ts`
- `app/api/**/route.ts`
- `app/_components/**/*.tsx`
- `app/**/page.tsx`, `app/**/layout.tsx`, `app/**/loading.tsx`, `app/**/error.tsx`, `app/**/not-found.tsx`

## Data model / API changes
- Generate Supabase Database types and use `createClient<Database>()`
- Add domain-level types for app-specific models and view models
- Add NextAuth module augmentation to extend `session.user.guestId` and `token.guestId`
- No runtime/API behavior changes; types only

## Action items
[ ] Add TypeScript tooling and config: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`; create `tsconfig.json` with `strict: true`, `allowJs: true`, `checkJs: false`, `noEmit: true`, `jsx: "preserve"`, `baseUrl`/`paths` from `jsconfig.json`, and add `typecheck` script
[ ] Create `next-env.d.ts` and `types/` folder for shared types and module augmentations
[ ] Generate Supabase types (`supabase gen types typescript`) into `types/supabase.ts` and wire to Supabase clients
[ ] Migrate data/auth layer files to `.ts` and add explicit input/output types, including `FormData` parsing and session token types
[ ] Migrate API route handlers to `.ts`, type `params`, request bodies, and JSON response shapes
[ ] Convert shared context and client components to `.tsx` with typed props/state/context values
[ ] Convert pages/layouts/loading/error/not-found files to `.tsx` and type route/search params
[ ] Resolve strict errors with explicit null handling, narrowings, and small type guards
[ ] Disable `allowJs`, ensure no JS remains under `app/`/`app/_lib`/`app/_components`, and keep config JS files outside TS `include`
[ ] Run lint/build/typecheck and fix any remaining type or build issues

## Testing and validation
- `npm run lint`
- `npm run build`
- `npm run typecheck`
- Optional: `npx vitest run`, `npx playwright test`

## Risks and edge cases
- Strict mode from the start will surface many null/undefined edge cases
- NextAuth type augmentation mistakes can break session typing
- Generated Supabase types may need regeneration if schema changes
- Date handling for booking ranges can cause subtle type mismatches
- `allowJs` off will remove JS from type checking if any remain

## Open questions
- None.
