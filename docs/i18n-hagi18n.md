# Builder hagi18n workflow

Builder translations are authored as YAML under `src/i18n/locales/` and generated into runtime JSON under `src/i18n/generated-locales/`.

## Source and runtime contract

- Source of truth: `src/i18n/locales/<locale>/<namespace>.yml`
- Runtime artifacts: `src/i18n/generated-locales/<locale>/<namespace>.json`
- Locale maintenance config: `hagi18n.yaml`
- Runtime bootstrap: `src/i18n/index.ts`
- Generation bridge: `scripts/generate-i18n-resources.mjs`

Builder keeps YAML in Git and treats `src/i18n/generated-locales/` as disposable runtime output. Dev, build, and test scripts run `prepare:i18n` first, so the JSON artifacts are regenerated automatically before the app, tests, or Vite runtime import them. Do not hand-edit generated JSON.

## Supported languages

Builder mirrors the Desktop language set:

- `zh-CN`
- `zh-Hant`
- `en-US`
- `ja-JP`
- `ko-KR`
- `de-DE`
- `fr-FR`
- `es-ES`
- `pt-BR`
- `ru-RU`

## Maintainer commands

Run these from `repos/docker-compose-builder-web`:

```bash
npm run i18n:audit
npm run i18n:report
npm run i18n:doctor
npm run i18n:sync
npm run i18n:sync:write
npm run i18n:prune
npm run i18n:prune:write
npm run i18n:generate
npm run i18n:check
```

## Dry-run vs write

- `npm run i18n:sync` and `npm run i18n:prune` are dry-run commands.
- `npm run i18n:sync:write` and `npm run i18n:prune:write` apply the reviewed mutations.
- `npm run i18n:generate` rewrites the runtime JSON from YAML.
- `npm run i18n:check` runs audit, doctor, generation, and a stale-artifact check.

Recommended maintainer sequence:

1. Edit `src/i18n/locales/en-US/*.yml` first.
2. Update the matching keys for `zh-CN`, then the remaining Desktop-supported locales.
3. Run `npm run i18n:audit` and `npm run i18n:doctor`.
4. Use `npm run i18n:sync` or `npm run i18n:prune` if the locale tree needs structural repair.
5. Regenerate runtime JSON with `npm run i18n:generate`.
6. Finish with `npm run i18n:check`.

## Namespace layout

Builder currently owns four runtime namespaces:

- `common`
- `docker-compose`
- `providers`
- `seo`

Keep each locale directory aligned to that exact file set.
