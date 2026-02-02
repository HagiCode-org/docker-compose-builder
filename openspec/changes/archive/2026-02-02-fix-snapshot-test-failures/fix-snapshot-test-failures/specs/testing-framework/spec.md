# Testing Framework Specification

## ADDED Requirements

### Requirement: Snapshot File Version Control
Snapshot test files MUST be tracked in version control to ensure consistent validation across all environments.

#### Scenario: Developer commits snapshot files
**Given** a developer has created or modified snapshot tests
**When** the developer runs tests and commits snapshot files
**Then** all `*.snap` files in `__verify__/__snapshots__/` directories MUST be committed to git
**And** the files MUST be tracked (visible in `git ls-files`)

#### Scenario: CI environment validates committed snapshots
**Given** snapshot files are committed to the repository
**When** CI runs the test suite with `npm test`
**Then** tests MUST validate generated output against committed snapshots
**And** tests MUST NOT create new snapshot files
**And** all snapshot verification tests MUST pass

#### Scenario: Missing snapshot files cause test failure
**Given** snapshot test files exist but snapshot files are not committed
**When** CI or another developer runs the test suite
**Then** tests MUST fail with clear error message indicating missing snapshots
**And** error message SHOULD guide developer to update snapshots with `-u` flag

---

### Requirement: Snapshot File Exclusion from .gitignore
The `.gitignore` file MUST NOT exclude snapshot test files to ensure they are tracked in version control.

#### Scenario: Verify .gitignore does not block snapshots
**Given** the project has snapshot tests in `__verify__/` directories
**When** `.gitignore` is reviewed
**Then** it MUST NOT contain patterns like `*.snap`, `__snapshots__/`, or `**/__verify__/`
**And** running `git check-ignore` on any snapshot file MUST NOT match any ignore pattern

---

### Requirement: Dynamic Content Scrubbing
Snapshot files MUST NOT contain dynamic or environment-specific content that changes between test runs.

#### Scenario: Timestamps are scrubbed from snapshots
**Given** YAML generation includes timestamps or generation dates
**When** snapshot tests are created or updated
**Then** verifyjs scrubbers MUST replace all timestamps with fixed values
**And** `verify.config.json` MUST include timestamp scrubbing configuration
**And** snapshot files MUST contain `[FIXED_TIMESTAMP]` or similar placeholder instead of actual timestamps

#### Scenario: Environment-specific paths are standardized
**Given** YAML generation might include file paths
**When** snapshot tests are run in different environments (Windows, Linux, macOS)
**Then** paths MUST use consistent format (forward slashes)
**And** Windows paths MUST be escaped properly (e.g., `C:\\\\repos`)
**Or** paths SHOULD use environment-agnostic placeholders

---

### Requirement: CI Snapshot Validation
The CI pipeline MUST explicitly validate snapshot file presence and run snapshot verification tests.

#### Scenario: CI checks for snapshot files before running tests
**Given** a CI workflow runs the test suite
**When** the workflow reaches the test step
**Then** CI MUST first verify snapshot files exist in `__verify__/__snapshots__/`
**And** if snapshot files are missing, the build MUST fail immediately
**And** the failure MUST indicate missing snapshot files

#### Scenario: CI runs snapshot tests and reports failures
**Given** snapshot files exist in the repository
**When** CI runs `npm test` which includes snapshot verification
**Then** all snapshot tests MUST pass
**And** if snapshot tests fail, CI MUST report the specific test cases that failed
**And** failure output SHOULD include diff between expected and actual output

---

### Requirement: Snapshot Update Workflow
Developers MUST follow a documented workflow when updating snapshots to ensure changes are intentional.

#### Scenario: Developer intentionally changes YAML structure
**Given** a developer makes code changes that modify the generated YAML structure
**When** the changes are intentional and correct
**Then** developer MUST run tests with update flag: `npm run test:verify -- -u`
**And** developer MUST carefully review all snapshot changes
**And** snapshot files MUST be committed along with code changes
**And** commit message SHOULD indicate snapshot updates

#### Scenario: Snapshot changes require PR review
**Given** a developer submits a PR with snapshot file changes
**When** reviewers review the PR
**Then** snapshot file changes SHOULD be carefully reviewed
**And** reviewers MUST verify YAML structure changes are intentional
**And** unexpected snapshot changes SHOULD be questioned

#### Scenario: Documentation guides snapshot updates
**Given** a developer needs to update snapshots
**When** they consult project documentation
**Then** documentation MUST clearly explain when to update snapshots
**And** documentation MUST provide the update command
**And** documentation MUST include troubleshooting section for common issues

---

### Requirement: Snapshot Test Coverage
All Docker Compose YAML generation scenarios MUST have corresponding snapshot verification tests.

#### Scenario: Quick start configurations are tested
**Given** the project provides quick start configuration profiles
**When** snapshot tests are defined
**Then** tests MUST cover default configuration (zh-CN)
**And** tests MUST cover default configuration (en-US)
**And** tests MUST cover all API provider options (Anthropic, ZAI, Custom)
**And** each profile MUST generate valid YAML structure

#### Scenario: Full custom configurations are tested
**Given** the project provides full custom configuration options
**When** snapshot tests are defined
**Then** tests MUST cover Windows deployment with internal database
**And** tests MUST cover Linux root user with internal database
**And** tests MUST cover Linux non-root user with internal database
**And** tests MUST cover external database configuration
**And** tests MUST cover bind mount volume configuration
**And** each configuration MUST generate valid YAML structure

#### Scenario: API provider configurations are tested
**Given** the project supports multiple API providers
**When** snapshot tests are defined
**Then** tests MUST cover Anthropic official API
**And** tests MUST cover Zhipu AI (ZAI) provider
**And** tests MUST cover custom API endpoint configuration
**And** each provider MUST generate correct environment variables

---

## Implementation Notes

### Snapshot File Structure
```
src/lib/docker-compose/__tests__/
└── __verify__/
    ├── __snapshots__/
    │   ├── quick-start-snapshots.test.ts.snap  # MUST be committed
    │   ├── full-custom-snapshots.test.ts.snap  # MUST be committed
    │   └── api-provider-snapshots.test.ts.snap # MUST be committed
    ├── quick-start-snapshots.test.ts
    ├── full-custom-snapshots.test.ts
    └── api-provider-snapshots.test.ts
```

### Verification Commands
```bash
# Check if snapshots are tracked
git ls-files src/lib/docker-compose/__tests__/__verify__/__snapshots__/

# Run snapshot tests
npm run test:verify

# Update snapshots (when changes are intentional)
npm run test:verify -- -u

# Check if files are ignored
git check-ignore -v src/lib/docker-compose/__tests__/__verify__/__snapshots__/*.snap
```

### Testing CI Behavior
To test CI behavior locally:
```bash
# Clean start (simulate CI environment)
git clean -fdx
npm ci
npm test
```
