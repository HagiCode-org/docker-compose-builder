# Proposal: Multi-Platform Deployment Base Path Configuration

## Meta

| Field | Value |
|-------|-------|
| **Change ID** | `multi-platform-deployment-base-config` |
| **Status** | `ExecutionCompleted` |
| **Created** | 2026-02-07 |
| **Author** | AI Assistant |

## Overview

Optimize the deployment configuration to support both GitHub Pages and Azure Static Web Apps platforms by introducing environment-based base path control.

## Problem Statement

The current `vite.config.ts` configuration uses a hardcoded production base path of `/docker-compose-builder/` for GitHub Pages deployment. This causes issues when deploying to Azure Static Web Apps:

1. **Resource 404 errors**: JavaScript/CSS bundles fail to load
2. **Static asset loading failures**: Images, fonts, and other static resources return 404
3. **Client-side routing failures**: Deep links and direct navigation break

### Root Cause

Azure Static Web Apps deploys to a root domain (e.g., `https://ambitious-moss-03f17d600.azurestaticapps.net/`) and expects assets at the root path, not a subdirectory path like `/docker-compose-builder/`.

## Proposed Solution

### Approach: Environment Variable Control

Introduce a `DEPLOY_TARGET` environment variable to conditionally set the Vite `base` configuration:

```typescript
// vite.config.ts
base: process.env.DEPLOY_TARGET === 'azure'
  ? '/'
  : process.env.NODE_ENV === 'production'
    ? '/docker-compose-builder/'
    : '/'
```

### Rationale

1. **Minimal change**: Single file modification with clear intent
2. **Backward compatible**: GitHub Pages deployment remains unchanged
3. **Explicit control**: Deployment target is declared in CI/CD workflow
4. **Zero runtime overhead**: Configuration is resolved at build time

## Scope

### In Scope

| Component | Change |
|-----------|--------|
| `vite.config.ts` | Add `DEPLOY_TARGET` environment variable check |
| `.github/workflows/azure-static-web-apps-*.yml` | Add `DEPLOY_TARGET: azure` to build step |
| `package.json` | (Optional) Add build scripts for different targets |

### Out of Scope

| Component | Reason |
|-----------|--------|
| GitHub Pages workflow | Existing deployment works correctly |
| Development environment | Uses root path by default (`NODE_ENV=development`) |
| Public folder assets | Handled by Vite's base path automatically |

## Impact Analysis

### Breaking Changes

**None**. Existing GitHub Pages deployment behavior is preserved.

### Dependencies

| Item | Version | Notes |
|------|---------|-------|
| Vite | Existing | No version change required |
| Node.js | 20+ | Already satisfied |

### Migration Path

No user migration required. Only CI/CD workflow needs updating.

## Alternatives Considered

### Alternative A: Separate Azure Config File

Create `vite.config.azure.ts` and pass `-c` flag to build command.

**Rejected because**:
- Adds maintenance burden of duplicate configuration
- Easier for configs to drift apart
- No clear benefit over environment variable approach

### Alternative B: Detect via Azure Environment

Use `process.env.AZURE_STATIC_WEB_APPS_API_TOKEN` presence.

**Rejected because**:
- Implicit behavior is less clear than explicit `DEPLOY_TARGET`
- Token variable may not be available in all Azure contexts
- Harder to test locally

## Success Criteria

- [ ] Azure Static Web Apps deployment loads all assets correctly
- [ ] GitHub Pages deployment continues working without changes
- [ ] All client-side routes work on both platforms
- [ ] Local development unaffected (base path remains `/`)
- [ ] No console errors related to resource loading in production

## References

- Current Azure workflow: `.github/workflows/azure-static-web-apps-ambitious-moss-03f17d600.yml`
- Vite base path documentation: https://vitejs.dev/config/shared-options.html#base
- Azure Static Web Apps config: `public/staticwebapp.config.json`
