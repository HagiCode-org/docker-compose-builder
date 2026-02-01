## 1. Implementation

- [x] 1.1 Create `.github/workflows/ci.yml` with PR trigger configuration
- [x] 1.2 Configure workflow to trigger on pull_request events targeting main branch
- [x] 1.3 Add Node.js 20 setup step with npm dependency caching
- [x] 1.4 Add npm ci step to install dependencies
- [x] 1.5 Add build step (`npm run build`) with TypeScript compilation verification
- [x] 1.6 Add test step (`npm test`) to run vitest test suite
- [x] 1.7 Configure workflow permissions (contents: read, pull-requests: write) for CI and PR comments
- [x] 1.8 Add PR comment step to report test results (success/failure with details)
- [x] 1.9 Use actions/github-script@v7 to post comments on PR with workflow outcome

## 2. Validation

- [ ] 2.1 Create test PR to verify workflow triggers correctly
- [ ] 2.2 Confirm build step executes successfully on greenfield PR
- [ ] 2.3 Confirm test step runs and produces expected output
- [ ] 2.4 Verify CI status appears on PR page (checkmark/X indicator)
- [ ] 2.5 Verify PR comment is posted with test results (success/failure)
- [ ] 2.6 Test failure scenario: introduce breaking change and verify CI fails appropriately with PR comment
- [ ] 2.7 Verify workflow completes within reasonable time (<5 minutes for typical change)

## 3. Documentation

- [ ] 3.1 Update README.md with CI badge and status link (optional)
- [ ] 3.2 Document CI workflow requirements in project.md or contributing guidelines
- [ ] 3.3 Add workflow file comments explaining each step's purpose

## 4. Optional Enhancements (Future Work)

- [ ] 4.1 Add test coverage reporting as PR comment (via codecov or vitest coverage)
- [ ] 4.2 Configure branch protection rules requiring passing CI before merge
- [ ] 4.3 Add ESLint step for code quality checks
- [ ] 4.4 Add workflow status badge to project README
