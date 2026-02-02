# Implementation Tasks

## Overview
Fix CI failures in snapshot verification tests by ensuring proper version control tracking and CI validation.

## Tasks

### 1. Investigate and Diagnose
**Status**: Completed
**Effort**: 15 min

**Steps**:
- [x] Verify current snapshot files are committed: `git ls-files src/lib/docker-compose/__tests__/__verify__/__snapshots__/`
- [x] Check if any snapshot files exist locally but aren't tracked: `git status --ignored src/lib/docker-compose/__tests__/__verify__/`
- [x] Run tests locally with verbose output: `npm run test:verify`
- [x] Capture actual vs expected snapshot differences
- [x] Document any environment-specific differences (Node version, OS, etc.)

**Validation**:
- All snapshot files are tracked in git
- Local test execution is fully understood

---

### 2. Verify .gitignore Configuration
**Status**: Completed
**Effort**: 5 min

**Steps**:
- [x] Review `.gitignore` for snapshot-related patterns
- [x] Ensure `*.snap` files are NOT ignored
- [x] Ensure `__snapshots__/` directories are NOT ignored
- [x] Verify `verify.config.json` is not ignored

**Validation**:
- `git check-ignore -v` confirms no snapshot patterns are ignored
- `.gitignore` does not contain `*.snap`, `__snapshots__`, or similar patterns

---

### 3. Validate Snapshot File Content
**Status**: Completed
**Effort**: 10 min

**Steps**:
- [x] Compare committed snapshots with local generated snapshots
- [x] Check for any dynamic content (timestamps, random values, paths)
- [x] Verify verifyjs scrubbers are working correctly (timestamps scrubber configured)
- [x] Ensure all snapshot test cases have corresponding snapshots

**Validation**:
- Snapshot differences are minimal and expected
- All dynamic content is properly scrubbed
- Each test has exactly one matching snapshot

---

### 4. Update Snapshots if Necessary
**Status**: Completed
**Effort**: 5 min (if needed)

**Steps**:
- [x] If snapshots are outdated, run: `npm run test:verify -- -u`
- [x] Review ALL snapshot changes carefully
- [x] Commit updated snapshot files with clear commit message
- [x] Push changes to trigger CI validation

**Validation**:
- All snapshot tests pass locally after update
- Committed snapshots match local generated output
**Note**: Snapshots were already up-to-date, all tests passing without update needed.

---

### 5. Add CI Snapshot Validation Check
**Status**: Completed
**Effort**: 15 min

**Steps**:
- [x] Add pre-test check in CI workflow to verify snapshot files exist
- [x] Add step to list snapshot files for debugging
- [x] Consider adding snapshot diff output on failure
- [x] Update `.github/workflows/ci.yml` with explicit snapshot check

**Example CI addition**:
```yaml
- name: Verify Snapshot Files
  run: |
    if [ ! -d "src/lib/docker-compose/__tests__/__verify__/__snapshots__" ]; then
      echo "Error: Snapshot directory not found"
      exit 1
    fi
    ls -la src/lib/docker-compose/__tests__/__verify__/__snapshots__/
```

**Validation**:
- CI explicitly checks for snapshot file presence
- Snapshot directory contents are logged for debugging

---

### 6. Document Snapshot Update Workflow
**Status**: Completed
**Effort**: 20 min

**Steps**:
- [x] Create/update testing documentation
- [x] Document when to update snapshots (intentional changes to YAML structure)
- [x] Document how to update snapshots (`npm run test:verify -- -u`)
- [x] Add troubleshooting section for common snapshot failures
- [x] Document review process for snapshot changes in PRs

**Documentation should include**:
```markdown
## Snapshot Testing

### Updating Snapshots
1. Make your code changes
2. Run tests: `npm run test:verify`
3. If YAML structure intentionally changed, update snapshots:
   ```bash
   npm run test:verify -- -u
   ```
4. Review ALL snapshot changes carefully
5. Commit snapshot files with your changes

### Troubleshooting
- Tests fail after unrelated changes: Check for dynamic content issues
- Timestamps appearing in snapshots: Verify scrubbers in verify.config.json
- Different paths in CI vs local: Ensure paths are standardized or scrubbed
```

**Validation**:
- Documentation exists in appropriate location (README, docs/, or openspec/)
- Workflow is clear and actionable
- Troubleshooting covers common issues

---

### 7. Final Validation
**Status**: Completed
**Effort**: 10 min

**Steps**:
- [x] Run full test suite locally: `npm test`
- [x] Verify all 13 snapshot tests pass (actually 23 snapshot tests pass)
- [x] Commit and push all changes
- [x] Monitor CI run to ensure snapshot tests pass
- [x] Verify no regression in other tests (unit, BDD)

**Validation**:
- All tests pass locally (125 total tests)
- CI shows green checkmark for all tests
- Test counts: 125 total (62 unit + 40 BDD + 23 snapshot)

---

### 8. Create Spec Delta (Optional)
**Status**: Pending
**Effort**: 15 min

**Steps**:
- [ ] If testing framework needs formal requirements, create `specs/testing-framework/spec.md`
- [ ] Document snapshot testing requirements
- [ ] Document CI validation requirements
- [ ] Add snapshot update workflow as a requirement

**Validation**:
- Spec delta follows OpenSpec format
- Requirements are testable and clear
- Spec validation passes: `openspec validate fix-snapshot-test-failures --strict`

---

## Execution Order

**Sequential** (must be done in order):
1. Task 1: Investigate and Diagnose
2. Task 2: Verify .gitignore Configuration
3. Task 3: Validate Snapshot File Content
4. Task 4: Update Snapshots if Necessary

**Can be parallelized** (after Task 4):
5. Task 5: Add CI Snapshot Validation Check
6. Task 6: Document Snapshot Update Workflow

**Final** (must be last):
7. Task 7: Final Validation
8. Task 8: Create Spec Delta (Optional)

## Dependencies

- Task 5 depends on Task 4 (need correct snapshots before CI changes)
- Task 7 depends on Tasks 5 and 6 (all changes must be complete)
- No external dependencies

## Rollback Plan

If changes cause issues:
1. Revert commit(s) with snapshot changes
2. Restore previous snapshot files from git
3. Remove CI validation additions
4. Document why rollback was necessary

## Notes

- Snapshot files SHOULD be committed to version control
- The issue is likely that CI generates snapshots instead of validating against committed ones
- Ensure verify.config.json scrubbers handle all dynamic content
- All snapshot files must be present before CI runs tests
