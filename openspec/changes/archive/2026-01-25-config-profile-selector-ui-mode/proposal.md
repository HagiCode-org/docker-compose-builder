# Add Configuration Profile Selector to Simplify Form

## Overview

This proposal adds a **Profile (配置模式)** selector at the top of the Docker Compose configuration form, providing two preset modes to reduce the complexity for new users while maintaining full control for advanced users.

## Background

The current Docker Compose configuration generator's `ConfigForm` component exposes all configuration options by default, including:
- Basic settings (HTTP port, container name, image tag, host OS)
- Database configuration (type, credentials, volume settings)
- License configuration (key type, custom key)
- API configuration (provider selection, API token, URL)
- Volume mounts (workdir path, permissions)

This comprehensive approach creates a high barrier to entry for new users who must understand 30+ configuration fields to generate a working Docker Compose file.

## Problem

1. **High Learning Curve for New Users**: The form displays all configuration items (HTTP port, container name, image registry, database type, API provider, workdir permissions, etc.) by default, requiring users to understand the meaning and configuration logic of 30+ fields before they can generate a configuration.

2. **Configuration Complexity Mismatch with User Needs**: Most first-time users only want to quickly experience basic functionality and don't need to understand advanced options like database volume types or Linux permission configuration (PUID/PGID).

3. **Lack of Progressive Configuration Experience**: There's no way to provide different levels of configuration interface based on user expertise.

## Solution

Add a **Profile (配置模式)** selector at the top of the configuration form using radio button styling, providing two preset modes:

### 1. Quick Start Mode (default)
- **Shown Configuration Items**:
  - Work directory path (代码路径)
  - HTTP port
  - API Token
  - Other essential minimum configuration items
- **Hidden Configuration Items**:
  - Container name, image tag, host OS type
  - Database configuration (uses default internal PostgreSQL)
  - License key type
  - API provider (uses default ZAI)
  - Volume type, volume name/path
  - Linux user permissions (PUID/PGID)

### 2. Full Custom Mode
- **Shown Configuration Items**: All existing configuration items (consistent with current form)
- **Behavior**: Users have complete control over all Docker Compose configuration parameters

### Technical Implementation
- Add `profile: 'quick-start' | 'full-custom'` field to `DockerComposeConfig` type
- Render Profile radio button group at the top of `ConfigForm.tsx` (using existing Radio Group or custom component)
- Conditionally render configuration sections based on `config.profile` value:
  ```tsx
  {config.profile === 'full-custom' && <DatabaseConfigSection />}
  {config.profile === 'full-custom' && <LicenseConfigSection />}
  ```
- Set reasonable default values for "Quick Start" mode; hidden configuration items use predefined values
- Update i18n translation files (`en-US.json`, `zh-CN.json`) to add Profile-related text

## Impact

### User Experience
- **Lower Entry Barrier**: New users can generate a working Docker Compose file with only 3-5 required fields
- **Progressive Learning**: Users can switch to full custom mode to explore advanced options after becoming familiar with basic functionality
- **Reduce Configuration Errors**: Hiding advanced configurations prevents new users from making mistakes (e.g., incorrect permission settings causing container startup failures)

### Technical Impact
- **Modified Files**:
  - `src/lib/docker-compose/types.ts`: Add `profile` field type definition
  - `src/lib/docker-compose/slice.ts`: Update default config and Redux state
  - `src/components/docker-compose/ConfigForm.tsx`: Add Profile selector and conditional rendering logic
  - `src/i18n/locales/en-US.json`, `zh-CN.json`: Add multilingual support
- **Backward Compatibility**: Default to "Quick Start" mode without affecting existing full configuration logic
- **Testing Requirements**:
  - Verify configuration generation correctness in both modes
  - Verify configuration state persistence when switching modes

### Documentation Updates
- Add Profile configuration mode Requirement in `docker-compose-generator` spec
- Supplement scenario descriptions:
  - Minimum configuration flow for Quick Start mode
  - All configuration items display in Full Custom mode

## Alternatives Considered

1. **Accordion/Collapse Sections**: Keep all sections but collapse them by default
   - **Rejected**: Still exposes all field labels, doesn't reduce cognitive load sufficiently

2. **Wizard/Step-by-Step Form**: Break configuration into multiple steps
   - **Rejected**: Increases interaction cost for experienced users who want to see all options at once

3. **Tooltip/Help Text Expansion**: Add more explanatory text to existing fields
   - **Rejected**: Doesn't reduce the number of fields users must understand

## Success Criteria

1. New users can generate a valid Docker Compose configuration with 3-5 fields in Quick Start mode
2. Switching between modes preserves user input for shared fields
3. All existing functionality remains available in Full Custom mode
4. Configuration generation works correctly in both modes
5. i18n support is complete for both English and Chinese

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mode switching may lose user input | High | Preserve shared field values when switching modes; only use defaults for hidden fields |
| Quick Start defaults may not suit all users | Medium | Provide clear indication that users can switch to Full Custom mode at any time |
| Hidden fields may contain critical values for some use cases | Low | Carefully select defaults that work for most common scenarios |

## Related Changes

None. This is a standalone feature enhancement.

## Timeline Estimate

- Implementation: 2-3 hours
- Testing and validation: 1 hour
- Documentation updates: 30 minutes

## References

- Current form implementation: `src/components/docker-compose/ConfigForm.tsx:1-526`
- Type definitions: `src/lib/docker-compose/types.ts:1-106`
- Spec file: `openspec/specs/docker-compose-generator/spec.md:1-103`
