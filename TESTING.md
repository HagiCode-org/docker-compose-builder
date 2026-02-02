# Testing Guide

This guide covers testing practices for the Docker Compose Builder project, including snapshot testing workflow and troubleshooting.

## Test Structure

The project uses a comprehensive test suite split across three categories:

### Unit Tests
Location: `src/lib/docker-compose/__tests__/unit/`
- Validation tests (33 tests)
- Generator tests (29 tests)
- Test individual functions and logic in isolation

### BDD (Behavior-Driven Development) Tests
Location: `src/lib/docker-compose/__tests__/bdd/`
- Edge case scenarios (18 tests)
- Quick start scenarios (9 tests)
- Full custom scenarios (13 tests)
- Test end-to-end workflows and user behaviors

### Snapshot Verification Tests
Location: `src/lib/docker-compose/__tests__/__verify__/`
- API provider snapshots (9 tests)
- Quick start snapshots (8 tests)
- Full custom snapshots (6 tests)
- Validate generated YAML output against committed snapshots

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Unit tests only
npm test -- src/lib/docker-compose/__tests__/unit/

# BDD tests only
npm test -- src/lib/docker-compose/__tests__/bdd/

# Snapshot verification tests only
npm run test:verify
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Snapshot Testing

### Overview

Snapshot testing ensures that generated Docker Compose YAML files maintain their expected structure over time. The project uses **verifyjs** for snapshot management with automatic scrubbing of dynamic content like timestamps.

### Snapshot Files Location

```
src/lib/docker-compose/__tests__/__verify__/__snapshots__/
├── api-provider-snapshots.test.ts.snap
├── full-custom-snapshots.test.ts.snap
└── quick-start-snapshots.test.ts.snap
```

### When to Update Snapshots

**Update snapshots ONLY when:**
1. You intentionally change the YAML structure or format
2. You add new configuration options that affect output
3. You fix a bug that changed the generated YAML
4. You are implementing a new feature that modifies output

**DO NOT update snapshots when:**
1. Tests fail due to code bugs (fix the code instead)
2. Only timestamps or dynamic content changed (check scrubbers)
3. Tests fail in CI but pass locally (investigate environment differences first)

### Updating Snapshots

1. Make your code changes
2. Run snapshot tests to see differences:
   ```bash
   npm run test:verify
   ```

3. If the YAML structure intentionally changed, update snapshots:
   ```bash
   npm run test:verify -- -u
   ```

4. **Review ALL snapshot changes carefully** - Open each `.snap` file and verify:
   - Changes are expected and intentional
   - No dynamic content (timestamps, random values) leaked through
   - YAML structure is valid
   - All test cases have matching snapshots

5. Commit the updated snapshot files with your code changes:
   ```bash
   git add src/lib/docker-compose/__tests__/__verify__/__snapshots__/
   git commit -m "feat: your feature description

   - Update snapshots for [describe changes]
   - All snapshot tests pass"
   ```

### Snapshots in Version Control

**Important:** Snapshot files are tracked in version control and must be committed:
- `*.snap` files are NOT ignored by `.gitignore`
- CI validates that snapshot files exist before running tests
- All team members must use the same snapshot baseline

### Verifyjs Configuration

The `verify.config.json` file configures snapshot behavior:

```json
{
  "traitParameters": [
    { "name": "config", "extension": "txt" }
  ],
  "scrubbers": [
    {
      "name": "timestamps",
      "regex": "# Generated at: .*",
      "replacement": "# Generated at: [FIXED_TIMESTAMP]"
    }
  ],
  "directory": "__verify__"
}
```

**Scrubbers** remove dynamic content from snapshots:
- Timestamps are replaced with fixed values
- Add more scrubbers if you have other dynamic content (paths, random IDs, etc.)

## Troubleshooting

### Snapshot Tests Fail After Unrelated Changes

**Problem:** Tests fail but you didn't change YAML generation logic.

**Solutions:**
1. Check for dynamic content issues - verify scrubbers in `verify.config.json`
2. Check for environment-specific values (OS paths, Node version differences)
3. Review the actual diff to understand what changed

### Timestamps Appearing in Snapshots

**Problem:** Timestamps or other dynamic content are not being scrubbed.

**Solutions:**
1. Verify `verify.config.json` has correct regex patterns
2. Test the regex: `echo "# Generated at: 2024/01/01" | grep "# Generated at: .*"`
3. Add new scrubbers for other dynamic content

### Different Paths in CI vs Local

**Problem:** Local tests pass but CI fails due to path differences.

**Solutions:**
1. Ensure paths are standardized in test inputs
2. Add path scrubbers to `verify.config.json`:
   ```json
   {
     "name": "paths",
     "regex": "/home/[^/]+/",
     "replacement": "/home/user/"
   }
   ```

### Snapshot Files Not Found in CI

**Problem:** CI fails with "snapshot files not found".

**Solutions:**
1. Verify snapshot files are committed: `git ls-files src/lib/docker-compose/__tests__/__verify__/__snapshots__/`
2. Check `.gitignore` doesn't exclude `*.snap` or `__snapshots__` directories
3. Ensure snapshots are included in your commit/PR

### All Snapshot Tests Failing in CI

**Problem:** All snapshot tests fail in CI but pass locally.

**Solutions:**
1. Check CI Node.js version matches local version
2. Verify dependencies are installed correctly: `npm ci`
3. Review CI logs for specific differences
4. Ensure snapshot files are present in the branch

## CI/CD Integration

### CI Workflow

The CI pipeline (`.github/workflows/ci.yml`) includes:

1. **Verify Snapshot Files** - Explicit check that snapshot files exist
2. **Build** - TypeScript compilation
3. **Test** - Full test suite including snapshot verification
4. **PR Comment** - Automated test results on pull requests

### Snapshot Validation in CI

```yaml
- name: Verify Snapshot Files
  run: |
    SNAPSHOT_DIR="src/lib/docker-compose/__tests__/__verify__/__snapshots__"
    if [ ! -d "$SNAPSHOT_DIR" ]; then
      echo "Error: Snapshot directory not found"
      exit 1
    fi
    SNAPSHOT_COUNT=$(find "$SNAPSHOT_DIR" -name "*.snap" | wc -l)
    echo "Found $SNAPSHOT_COUNT snapshot file(s)"
    ls -la "$SNAPSHOT_DIR"/*.snap
```

### Test Results Reporting

CI automatically comments on PRs with test results:
- Success: All tests passed
- Failure: Check logs for details

## Best Practices

1. **Review Snapshot Changes**: Always review snapshot diffs before committing
2. **Document Changes**: Include snapshot updates in commit messages
3. **Run Full Suite**: Run `npm test` before pushing to ensure all tests pass
4. **Check CI Results**: Monitor CI runs to catch environment-specific issues
5. **Keep Scrubbers Updated**: Add scrubbers for any new dynamic content
6. **Small Focused Changes**: Keep commits focused to make snapshot reviews easier
7. **Team Communication**: Notify team when snapshot structure changes intentionally

## Test Coverage

Current test counts:
- Unit Tests: ~62 tests
- BDD Tests: ~40 tests
- Snapshot Tests: ~23 tests
- **Total: ~125 tests**

Run coverage reports:
```bash
npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [verifyjs Documentation](https://github.com/your-org/verifyjs)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
