# Implementation Tasks

## Phase 1: Type System Updates

- [x] Add `ConfigProfile` type definition to `src/lib/docker-compose/types.ts`
  - Define type: `'quick-start' | 'full-custom'`
  - Add JSDoc comment explaining the profile modes
  - Export the type for use in components

- [x] Add `profile` field to `DockerComposeConfig` interface
  - Add field with default value `'quick-start'`
  - Position at the top of the interface for visibility
  - Ensure type safety throughout the codebase

## Phase 2: State Management Updates

- [x] Update default configuration in `src/lib/docker-compose/slice.ts`
  - Add `profile: 'quick-start'` to initial state
  - Set appropriate defaults for fields hidden in Quick Start mode:
    - `containerName`: Use sensible default
    - `imageTag`: Set to `'latest'`
    - `hostOS`: Set to `'linux'` as default
    - `databaseType`: Set to `'internal'`
    - `licenseKeyType`: Set to `'public'`
    - `anthropicApiProvider`: Set to `'zai'`
    - `volumeType`: Set to `'named'`
    - `puid`/`pgid`: Set to default Linux user values

- [x] Verify Redux slice handles profile field correctly
  - Ensure `setConfigField` action works for profile
  - Test state persistence

## Phase 3: UI Component Implementation

- [x] Add Profile selector to top of `ConfigForm.tsx`
  - Create radio button group component
  - Position before basic settings section
  - Add descriptive label and help text
  - Ensure proper styling matches existing form elements

- [x] Implement conditional rendering for configuration sections
  - Wrap "Database Configuration" section with `config.profile === 'full-custom'` check
  - Wrap "License Configuration" section with `config.profile === 'full-custom'` check
  - Keep "Basic Settings" visible but conditionally hide some fields:
    - Hide container name, image tag, host OS in Quick Start mode
  - Keep "API Configuration" visible but simplify:
    - Hide API provider selector in Quick Start mode
    - Always show API Token field
  - Wrap "Volume Mounts" advanced options with profile check
  - Wrap "Advanced" section (PUID/PGID) with `config.profile === 'full-custom'` check

- [x] Ensure shared fields maintain state when switching modes
  - Work directory path
  - HTTP port
  - API Token
  - Image registry (should be visible in both modes)
  - Workdir path (should be visible in both modes)

## Phase 4: Internationalization

- [x] Add Profile-related translations to `src/i18n/locales/en-US.json`
  - `configForm.profile`: Profile
  - `configForm.profileLabel`: Configuration Mode
  - `configForm.quickStart`: Quick Start (Recommended for new users)
  - `configForm.quickStartDescription`: Get started quickly with minimal configuration
  - `configForm.fullCustom`: Full Custom
  - `configForm.fullCustomDescription`: Complete control over all configuration options
  - `configForm.profileHelp`: Choose your configuration experience. You can switch modes at any time.

- [x] Add Profile-related translations to `src/i18n/locales/zh-CN.json`
  - `configForm.profile`: 配置模式
  - `configForm.profileLabel`: 配置模式
  - `configForm.quickStart`: 本地快速体验 (推荐新用户)
  - `configForm.quickStartDescription`: 使用最小配置快速开始
  - `configForm.fullCustom`: 完整自定义
  - `configForm.fullCustomDescription`: 完全控制所有配置选项
  - `configForm.profileHelp`: 选择您的配置体验。您可以随时切换模式。

## Phase 5: Testing and Validation

- [x] Test Quick Start mode configuration generation
  - Fill only required fields (workdir, HTTP port, API Token)
  - Generate Docker Compose YAML
  - Verify all necessary services and configurations are present
  - Confirm hidden fields use correct defaults

- [x] Test Full Custom mode configuration generation
  - Verify all sections are visible
  - Fill all fields and generate configuration
  - Compare output with current implementation (should be identical)

- [x] Test mode switching behavior
  - Start in Quick Start mode, fill shared fields
  - Switch to Full Custom mode
  - Verify shared field values are preserved
  - Switch back to Quick Start mode
  - Confirm no data loss

- [x] Test form validation in both modes
  - Verify required field validation works correctly
  - Check error messages display properly (with i18n)
  - Ensure form submit behaves correctly

- [x] Test responsive design
  - Verify Profile selector looks good on mobile and desktop
  - Check conditional rendering works on different screen sizes

## Phase 6: Documentation

- [x] Create spec delta for `docker-compose-generator` capability
  - Add new Requirement: "Configuration Profile Selection"
  - Add scenarios for Quick Start mode
  - Add scenarios for Full Custom mode
  - Add scenarios for mode switching

- [x] Update README if needed
  - Document the new Profile feature
  - Provide usage examples for both modes

## Dependencies and Parallelization

**Sequential Tasks (must be done in order):**
1. Phase 1 must complete before Phase 2 (type system needed for state)
2. Phase 2 must complete before Phase 3 (state needed for UI)
3. Phase 3 must complete before Phase 5 (UI needed for testing)

**Parallelizable Tasks:**
- Phase 4 (i18n) can be done in parallel with Phases 1-3
- Phase 6 (documentation) can be done alongside implementation

**Blockers:**
- None identified

## Completion Checklist

- [x] All tasks completed
- [x] Code passes linting and type checking
- [x] All tests pass
- [x] i18n complete for both languages
- [x] Manual testing completed for both modes
- [x] Spec delta validated with `openspec validate --strict`
- [x] Ready for review

## Estimated Time

- Phase 1: 20 minutes
- Phase 2: 15 minutes
- Phase 3: 60 minutes
- Phase 4: 20 minutes
- Phase 5: 45 minutes
- Phase 6: 30 minutes
- **Total: ~3 hours**
