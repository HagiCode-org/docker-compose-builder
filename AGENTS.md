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
npm run test:verify          # snapshot verification tests (__verify__)
npm run test:static-output   # build + check root and subpath static output (CI gate)
npm run type-check
npm run lint
npm run i18n:check           # hagi18n audit + doctor + generated-resource check
```

Requires Node.js `>=24`. `dev`, `build`, and `test` run `prepare:i18n` first. Testing details: `TESTING.md`; i18n workflow: `docs/i18n-hagi18n.md`.

## Key Paths

- `src/components/`: UI and interaction components
- `src/lib/docker-compose/`: generator, validation, defaults, and core types
- `src/lib/docker-compose/__tests__/`: unit, BDD, and snapshot coverage
- `src/i18n/locales/<locale>/<namespace>.yml`: i18n source of truth (hagi18n, `hagi18n.yaml`); `src/i18n/generated-locales/` is generated JSON, never hand-edit
- `src/lib/link-policy.ts`: first-party link policy for external-link `rel` attributes (used by `Header/NavigationLinks.tsx`)
- `src/__tests__/`: hydration integration tests
- `src/rss-feed.ts`: RSS feed content callback used by `hagilight()`; `/rss.xml` is always the English feed
- `src/components/SiteChrome.astro`: hagilight default Footer + PromotoBanner (footer is pre-rendered per locale; keep exactly one live `<footer>`)
- `scripts/`: repo-level helpers (`check-static-output.mjs` verifies the built Astro output)
- `.github/workflows/deploy-gh-pages.yml`: on push to `main`, builds and publishes `dist/` plus `.github/gh-pages/esa.jsonc` to `gh-pages` (`builder.hagicode.com`); this workflow is the only supported production publication path

## Agent Guidelines

- Keep generation and validation logic in `src/lib/docker-compose/`, not embedded inside view components.
- Preserve the repo's i18n flow for all user-facing strings.
- Treat generated YAML behavior as contract-like: update tests or snapshots when behavior changes intentionally.
- Keep `@hagicode/hagilight` and `@hagicode/hagilight-core` on the same exact version; do not re-add inline analytics scripts or a hand-maintained `public/robots.txt` (hagilight generates robots and the sitemap index).
- CI (`.github/workflows/ci.yml`, on PRs) runs `npm ci`, snapshot-file check, `npm run build`, `npm run test:static-output`, `npm test`, and a guard that bans Azure ACR tokens in `src`/READMEs; keep those passing.
- Prefer composable UI changes on top of the existing React, Tailwind, and shadcn-style patterns.

## References

- `README.md`
- `src/lib/docker-compose/`
