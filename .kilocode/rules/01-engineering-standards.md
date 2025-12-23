# Engineering Standards

Owner: Maintainers (repo owner)
Reviewers: Core contributors
Last updated: 2025-12-22

## Completion timeline
- 2025-12-28: Draft baseline (lint/testing/error/logging/design)
- 2026-01-04: Team review and revisions
- 2026-01-10: Final sign-off and publish

## Verification
- [request_verification] from at least one reviewer
- Maintainer sign-off before merge

## Lint / Format
- Lint: `npm run lint` (Next.js ESLint via `.eslintrc.json`) must pass.
- Format: keep existing file style (tabs/spaces, Tailwind utility order). Introduce Prettier/Biome only by team agreement.

## Testing
- Minimum: `npm run test:unit` and `npm run test:component` for app/_lib or app/_components changes.
- E2E: `npm run test:e2e` for changes that affect booking/auth flows or routing.
- Record results or the reason for not running.

## Exceptions / Error Handling
- Throw errors with clear, stable messages; add context in `catch` and rethrow.
- Do not swallow errors silently; return appropriate HTTP status in API routes.
- Never include secrets/PII in user-facing messages.

## Logging
- Use `console.info/warn/error` with short, structured context.
- Avoid logging tokens, emails, or secrets; redact if needed.
- Keep production logs concise; prefer errors and high-signal warnings.

## Design
- Follow App Router layering: server data access in `app/_lib`, UI in `app/_components`.
- Server-only modules must not be imported by client components.
- Use Server Actions for mutations; keep components focused and reusable.
- Avoid cross-feature coupling; keep feature boundaries under `app/*`.

## Help wanted
If you'd like help finalizing or evolving these standards, ask for:
- Lint/Format: ESLint + Prettier or Biome config examples
- Testing: Vitest + Playwright command conventions
- Error handling: Next.js App Router patterns (error.js, not-found.js)
