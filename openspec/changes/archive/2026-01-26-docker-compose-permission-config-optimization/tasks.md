## 1. Implementation

- [x] 1.1 Update ConfigForm.tsx conditional rendering logic for permission fields
  - Modify the condition at line 472 to check all three requirements:
    - `config.profile === 'full-custom'`
    - `config.hostOS === 'linux'`
    - `!config.workdirCreatedByRoot`
  - Ensure permission fields only appear when ALL conditions are met
  - Test with different profile/OS/root-user combinations

- [x] 1.2 Add informational message for root user scenario
  - Create info message component explaining why permission fields are hidden
  - Display when: `config.profile === 'full-custom' && config.hostOS === 'linux' && config.workdirCreatedByRoot`
  - Use appropriate icon (ℹ️) and styling to match existing UI patterns
  - Ensure message is translatable via i18n system

- [x] 1.3 Update i18n translation files
  - Add new translation key: `configForm.permissionNotRequiredInfo`
  - Provide translations for all supported languages
  - Update existing permission configuration help text if needed
  - Ensure consistency with existing translation patterns

- [x] 1.4 Verify Windows mode behavior
  - Confirm permission fields are hidden when `config.hostOS === 'windows'`
  - Test that no permission-related errors appear in validation
  - Verify generated YAML doesn't include PUID/PGID for Windows mode
  - Test with both quick-start and full-custom profiles

## 2. Testing and Validation

- [x] 2.1 Manual testing of all scenarios
  - Test quick-start profile (permission fields should never appear)
  - Test full-custom + Windows (permission fields hidden)
  - Test full-custom + Linux + root user (permission fields hidden, info message shown)
  - Test full-custom + Linux + non-root user (permission fields visible and required)
  - Verify mode switching preserves user input correctly

- [x] 2.2 Validation testing
  - Test that PUID/PGID validation still works for Linux non-root users
  - Confirm no validation errors for Windows or Linux root user scenarios
  - Verify error messages display correctly (multi-language)
  - Test with invalid PUID/PGID values in Linux mode

- [x] 2.3 YAML generation testing
  - Verify generated YAML includes PUID/PGID for Linux non-root users
  - Confirm generated YAML excludes PUID/PGID for Windows mode
  - Confirm generated YAML excludes PUID/PGID for Linux root user
  - Check that all other configuration options generate correctly

- [x] 2.4 Multi-language testing
  - Test UI in all supported languages
  - Verify permission fields show/hide correctly regardless of language
  - Confirm new info message displays correctly in all languages
  - Check that all existing translations remain functional

- [x] 2.5 Responsive design testing
  - Test permission field visibility on desktop layouts
  - Test permission field visibility on mobile layouts
  - Verify info message is readable on small screens
  - Ensure form layout remains consistent

## 3. Documentation and Code Quality

- [x] 3.1 Code review
  - Review conditional logic for clarity and correctness
  - Ensure code follows project conventions
  - Check for any edge cases or missed scenarios
  - Verify no TypeScript errors

- [x] 3.2 Add comments for complex logic
  - Document the three-condition check for permission visibility
  - Explain the root user permission requirement exemption
  - Add inline comments for future maintainers

- [x] 3.3 Update CHANGELOG (if applicable)
  - Document the UI improvement
  - Describe the benefit to users
  - Note any breaking changes (none expected)

## 4. Deployment and Verification

- [x] 4.1 Build and test production bundle
  - Run production build
  - Verify no build warnings or errors
  - Test production build locally

- [x] 4.2 Pre-deployment checklist
  - All tasks completed and tested
  - No console errors in browser
  - All scenarios verified working
  - Translation files complete

- [x] 4.3 Deployment verification
  - Deploy to staging/production
  - Smoke test all major scenarios
  - Monitor for any user-reported issues
  - Verify existing functionality not broken

## Task Dependencies

- Task 1.1 MUST be completed before 1.2 (need correct conditional logic first)
- Task 1.3 SHOULD be completed alongside 1.1 and 1.2 (translations needed for info message)
- Tasks 2.1-2.5 CAN be done in parallel after implementation is complete
- Task 3.1 SHOULD be done during implementation, not after
- Task 4.1-4.3 MUST follow all previous tasks

## Estimated Complexity

- **Low complexity**: Changes are limited to UI conditional rendering
- **Low risk**: Core functionality (validation, generation) already handles these conditions
- **Quick implementation**: Estimated 2-4 hours for complete implementation and testing
