# Fix Snapshot Test Failures in CI

## Overview
Fix CI failures in snapshot verification tests by ensuring all snapshot files are properly tracked in version control and the CI pipeline correctly validates generated Docker Compose YAML outputs against committed snapshots.

## Background
The project uses verifyjs for snapshot testing of Docker Compose YAML generation. Recent commits added snapshot files to the repository, but CI failures indicate potential synchronization issues between local development and CI environments.

### Current State
- All unit tests (80 tests) pass locally
- All BDD scenario tests (22 tests) pass locally
- Snapshot verification tests pass locally but fail in CI
- Snapshot files were added in commit `f124a1f` as `new file mode 100644`

### Test Structure
```
src/lib/docker-compose/__tests__/
├── unit/                    # Validation and logic tests
├── bdd/                     # Scenario-based tests
└── __verify__/              # Snapshot verification tests
    ├── __snapshots__/       # Committed snapshot files
    │   ├── api-provider-snapshots.test.ts.snap
    │   ├── full-custom-snapshots.test.ts.snap
    │   └── quick-start-snapshots.test.ts.snap
    ├── api-provider-snapshots.test.ts
    ├── full-custom-snapshots.test.ts
    └── quick-start-snapshots.test.ts
```

## Problem Statement

### Root Cause Analysis
**Primary Issue**: Snapshot files were not tracked in version control before commit `f124a1f`. When CI runs in a clean environment:
1. `npm ci` creates a fresh dependency installation
2. `vitest` runs snapshot tests without existing snapshots
3. Tests generate NEW snapshots in CI instead of validating against committed ones
4. This creates divergence between local and CI environments

### Failing Tests
**Quick Start Snapshots** (`quick-start-snapshots.test.ts`):
- Default config (zh-CN)
- Default config (en-US)
- ZAI provider (zh-CN)
- Anthropic provider (zh-CN)
- Custom provider (zh-CN)

**Full Custom Snapshots** (`full-custom-snapshots.test.ts`):
- Windows + internal database
- Linux root + internal database
- Linux non-root + internal database
- External database
- Bind mount volumes

**API Provider Snapshots** (`api-provider-snapshots.test.ts`):
- Anthropic official API
- Zhipu AI (ZAI)
- Custom API endpoint

## Scope

### In Scope
1. Ensure all snapshot files are properly committed to version control
2. Verify `.gitignore` does not exclude snapshot files
3. Validate CI configuration for snapshot testing
4. Document snapshot update workflow
5. Add CI check to validate snapshot file presence

### Out of Scope
- Modifying YAML generation logic (tests pass locally)
- Changing verifyjs configuration
- Updating test assertions
- Modifying Docker Compose generator functionality

## Impact

### Benefits
- CI pipeline will consistently validate YAML output against known-good snapshots
- Prevents regressions in Docker Compose configuration generation
- Ensures reproducible builds across environments
- Improves confidence in generated configuration files

### Risks
- Low risk: Snapshot files are now committed and validated
- CI will catch any unintended YAML structure changes
- Developers must update snapshots intentionally when making changes

## Success Criteria

1. All 13 snapshot verification tests pass in CI
2. Snapshot files are tracked in git (verified with `git ls-files`)
3. `.gitignore` does not exclude `*.snap` files
4. CI runs `npm test` and all tests pass consistently
5. Documentation exists for snapshot update workflow

## Alternatives Considered

### Alternative 1: Auto-update Snapshots in CI
**Rejected**: Defeats the purpose of snapshot testing. Snapshots should be intentionally reviewed and updated by developers.

### Alternative 2: Exclude Snapshots from Version Control
**Rejected**: CI would generate different snapshots on each run, making validation impossible.

### Alternative 3: Use Different Snapshot Strategy
**Rejected**: Current verifyjs approach is appropriate. The issue is snapshot file tracking, not the testing approach.

## Implementation Approach

### Phase 1: Verify Current State
1. Confirm all snapshot files are tracked in git
2. Verify `.gitignore` configuration
3. Check if any snapshot files are missing

### Phase 2: CI Validation
1. Ensure CI environment properly installs dependencies
2. Verify test command runs all snapshot tests
3. Add explicit check for snapshot file presence in CI

### Phase 3: Documentation
1. Document snapshot update workflow
2. Add guidelines for when to update snapshots
3. Create troubleshooting guide for snapshot failures

## Dependencies

- None (standalone testing infrastructure fix)

## Timeline

- Estimated effort: 1-2 hours
- Can be implemented in a single PR
- No breaking changes to existing functionality

## Related Changes

- References: Commit `f124a1f` (added snapshot files)
- Related spec: `testing-framework` (to be created)
- Related change: `docker-compose-testability-refactor` (archived)
