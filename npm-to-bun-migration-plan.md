---
name: npm-to-bun-migration-plan
description: Plan to migrate from npm to bun
---

# Plan

## Summary
Migrate the project from npm to Bun for dependency installation and script execution while preserving runtime behavior. The plan standardizes on a single lockfile (bun.lockb), pins a Bun version, and updates documentation/CI to use Bun consistently.

## Requirements
- Replace npm with Bun for installs and `package.json` script execution
- Keep the existing Node.js engine constraint and Next.js setup unchanged
- Use `bun.lockb` as the single source of truth; remove `package-lock.json`
- Document Bun usage for local development and CI
- Ensure `bun run` commands succeed for lint/build/dev

## Scope
- In: package manager config, lockfiles, documentation updates, CI/workflows (if present)
- Out: dependency upgrades, app code changes, DB or infra changes

## Files and entry points
- `package.json` (pin Bun version, keep scripts compatible)
- `package-lock.json` (remove)
- `bun.lockb` (add)
- `bunfig.toml` (optional; registry/auth or install settings)
- `README*.md`, `TEST_PLAN.md` (update command examples)
- `.github/workflows/*` (if present)
- `.npmrc` (if present; translate to `bunfig.toml`)

## Data model / API changes
- None.

## Action items
- [ ] Inventory current tooling: confirm only `package-lock.json` exists, check for `.npmrc`, and list scripts that will be run via Bun
- [ ] Decide and pin Bun version (e.g., `"packageManager": "bun@1.x"`); optionally add `.bun-version` for tool managers
- [ ] Run `bun install` to generate `bun.lockb`, then remove `package-lock.json` and ensure only one lockfile is tracked
- [ ] Verify scripts under Bun (`bun run dev`, `bun run lint`, `bun run build`) without changing script definitions
- [ ] If `.npmrc` exists, map settings to `bunfig.toml` (registry, scopes, auth tokens) and validate installs
- [ ] Update docs (`README*.md`, `TEST_PLAN.md`) to replace npm commands with Bun equivalents
- [ ] Update CI to install Bun and use `bun install` + `bun run <script>`; add Bun cache if applicable
- [ ] Add a guardrail (lint/CI) to prevent reintroduction of `package-lock.json`

## Testing and validation
- `bun install`
- `bun run lint`
- `bun run build`
- `bun run dev` + quick smoke flow (login -> cabins -> booking)
- Optional: `bunx vitest run`, `bunx playwright test`

## Risks and edge cases
- Different dependency resolution may change transitive versions
- Native/postinstall scripts can behave differently under Bun
- Tooling that depends on npm environment variables may break
- CI runners without Bun will fail unless explicitly installed

## Open questions
- None.
