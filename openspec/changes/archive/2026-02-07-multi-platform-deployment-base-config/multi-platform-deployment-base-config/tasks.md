# Tasks: Multi-Platform Deployment Base Path Configuration

## Overview

This document outlines the implementation tasks for supporting both GitHub Pages and Azure Static Web Apps deployments through environment-based base path configuration.

---

## Phase 1: Configuration Update

### Task 1.1: Update vite.config.ts

**Priority:** High
**Estimated Complexity:** Low
**Dependencies:** None

Modify `vite.config.ts` to support the `DEPLOY_TARGET` environment variable.

**Changes:**

```typescript
// File: vite.config.ts
// Replace the current base configuration with:
base: process.env.DEPLOY_TARGET === 'azure'
  ? '/'
  : process.env.NODE_ENV === 'production'
    ? '/docker-compose-builder/'
    : '/',
```

**Acceptance Criteria:**
- [ ] Base path is `/` when `DEPLOY_TARGET=azure`
- [ ] Base path is `/docker-compose-builder/` when `NODE_ENV=production` (no DEPLOY_TARGET)
- [ ] Base path is `/` for development (no NODE_ENV or DEPLOY_TARGET)

---

## Phase 2: CI/CD Workflow Update

### Task 2.1: Update Azure Static Web Apps Workflow

**Priority:** High
**Estimated Complexity:** Low
**Dependencies:** Task 1.1

Update the Azure workflow to set the `DEPLOY_TARGET` environment variable.

**File:** `.github/workflows/azure-static-web-apps-ambitious-moss-03f17d600.yml`

**Changes:**

```yaml
# In the Build job, update the Build step:
- name: Build
  run: npm run build
  env:
    DEPLOY_TARGET: azure
```

**Acceptance Criteria:**
- [ ] Build step includes `DEPLOY_TARGET: azure` environment variable
- [ ] No other workflow changes are made

---

## Phase 3: Verification

### Task 3.1: Local Build Verification

**Priority:** High
**Estimated Complexity:** Low
**Dependencies:** Task 1.1

Verify the build outputs correct base paths for different scenarios.

**Commands:**

```bash
# Test Azure build (base should be /)
DEPLOY_TARGET=azure npm run build
grep -o '<base href="[^"]*">' dist/index.html

# Test GitHub Pages build (base should be /docker-compose-builder/)
unset DEPLOY_TARGET
NODE_ENV=production npm run build
grep -o '<base href="[^"]*">' dist/index.html

# Test development build (base should be /)
npm run build
grep -o '<base href="[^"]*">' dist/index.html
```

**Acceptance Criteria:**
- [ ] `DEPLOY_TARGET=azure` produces `<base href="/">`
- [ ] Production build produces `<base href="/docker-compose-builder/">`
- [ ] Development build produces `<base href="/">`

---

### Task 3.2: Azure Deployment Verification

**Priority:** High
**Estimated Complexity:** Medium
**Dependencies:** Task 2.1, Task 3.1

Deploy to Azure Static Web Apps and verify asset loading.

**Steps:**
1. Push changes to trigger Azure workflow
2. Monitor workflow completion
3. Open deployed Azure app URL
4. Open browser DevTools Network tab
5. Check for 404 errors on JS/CSS assets
6. Test client-side routing by navigating directly to internal routes

**Acceptance Criteria:**
- [ ] No 404 errors for JavaScript bundles
- [ ] No 404 errors for CSS files
- [ ] Static assets (images, fonts) load correctly
- [ ] Direct navigation to routes works (e.g., `/about`, `/settings`)
- [ ] Page refresh on any route works correctly

---

### Task 3.3: GitHub Pages Regression Test

**Priority:** Medium
**Estimated Complexity:** Medium
**Dependencies:** Task 1.1

Verify GitHub Pages deployment still works correctly.

**Steps:**
1. Trigger GitHub Pages deployment (push to main)
2. Open `https://newbe36524.github.io/docker-compose-builder/`
3. Check network tab for asset loading
4. Test client-side routing

**Acceptance Criteria:**
- [ ] All assets load from `/docker-compose-builder/` path
- [ ] No 404 errors
- [ ] Client-side routing works correctly

---

## Task Dependencies

```
┌─────────────┐     ┌──────────────────────┐
│  Task 1.1   │────▶│   Task 2.1           │
│ (vite.config)│     │ (Azure Workflow)     │
└─────────────┘     └──────────────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌──────────────────────┐
│  Task 3.1   │     │   Task 3.2           │
│ (Local Test)│     │ (Azure Deploy)       │
└─────────────┘     └──────────────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌─────────────┐ ┌─────────────┐
              │  Task 3.2   │ │  Task 3.3   │
              │   (Azure)   │ │   (GHPages) │
              └─────────────┘ └─────────────┘
```

---

## Rollback Plan

If issues arise:

1. **Revert vite.config.ts**: Remove `DEPLOY_TARGET` check, restore original config
2. **Revert workflow changes**: Remove `DEPLOY_TARGET` environment variable
3. **Redeploy**: Push to trigger fresh deployments

No data migration is required; rollback is a simple code revert.

---

## Notes

- The `staticwebapp.config.json` file is already correctly configured with `navigationFallback`
- Development workflow is unaffected (uses `/` by default)
- GitHub Pages workflow requires no changes
