# Docker Compose Builder Web - Agent Configuration

## Root Configuration

Inherits all behavior from `/AGENTS.md` at the monorepo root. Local rules extend or override the root file for this repository.

## Project Context

This repository contains the web tool that generates Docker Compose configurations for HagiCode deployments.

## Working Directory

Run commands from `repos/docker-compose-builder-web/`.

## Key Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:ui
npm run lint
```

## Key Paths

- `src/components/`: UI and interaction components
- `src/lib/docker-compose/`: generator, validation, defaults, and core types
- `src/lib/docker-compose/__tests__/`: unit, BDD, and snapshot coverage
- `src/rss-feed.ts`: RSS feed content callback used by `hagilight()`; `/rss.xml` is always the English feed
- `src/lib/footer-site-links.ts`: footer link catalog resolved from `@hagicode/hagilight-core/links`
- `scripts/`: repo-level helpers (`check-static-output.mjs` verifies the built Astro output)

## Agent Guidelines

- Keep generation and validation logic in `src/lib/docker-compose/`, not embedded inside view components.
- Preserve the repo's i18n flow for all user-facing strings.
- Treat generated YAML behavior as contract-like: update tests or snapshots when behavior changes intentionally.
- Keep `@hagicode/hagilight` and `@hagicode/hagilight-core` on the same exact version; do not re-add inline analytics scripts or a hand-maintained `public/robots.txt` (hagilight generates robots and the sitemap index).
- Prefer composable UI changes on top of the existing React, Tailwind, and shadcn-style patterns.

## References

- `README.md`
- `src/lib/docker-compose/`
