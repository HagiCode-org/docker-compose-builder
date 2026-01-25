# Change: Optimize Docker Compose Permission Configuration Display Logic

## Why
The permission configuration (PUID/PGID with value 1000) is currently visible in all deployment scenarios, which causes user confusion:
- In Windows mode, these configuration fields have no actual effect
- For non-Linux deployments or root user scenarios, displaying these fields is meaningless
- Users may mistakenly believe they need to configure these values when they don't apply to their deployment

## What Changes
- **MODIFIED**: Permission configuration fields (PUID/PGID) will only be displayed when:
  - Host OS is set to 'Linux'
  - Profile is set to 'full-custom'
  - Work directory was NOT created by root user
- **MODIFIED**: The default profile remains as 'quick-start' (Windows-friendly mode)
- **MODIFIED**: Conditional rendering logic in ConfigForm component will check all three conditions before showing permission fields
- **UNCHANGED**: Default permission values remain at 1000 for Linux non-root users
- **UNCHANGED**: Validation logic for PUID/PGID remains the same

## UI Design Changes

### Current Behavior (Problem)
```
┌─────────────────────────────────────────┐
│ Configuration Form (Linux + full-custom)│
├─────────────────────────────────────────┤
│                                         │
│ Host OS: [Linux ▼]                      │
│                                         │
│ ☑ Workdir created by root              │
│   (Checked = hidden)                    │
│   (Unchecked = shown)                   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Configure User Permission            │ │
│ │ PUID: [1000]                         │ │  ← Always shown when
│ │ PGID: [1000]                         │ │    unchecked + Linux
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### New Behavior (Solution)
```
┌─────────────────────────────────────────┐
│ Configuration Form (Linux + full-custom)│
├─────────────────────────────────────────┤
│                                         │
│ Host OS: [Linux ▼]                      │
│                                         │
│ ☑ Workdir created by root              │
│   ┌─────────────────────────────────┐   │
│   │ ℹ️ Permission Not Required      │   │
│   │                                 │   │
│   │ When workdir is created by      │   │
│   │ root, permission mapping is     │   │
│   │ not required.                   │   │
│   └─────────────────────────────────┘   │
│                                         │
│ OR                                      │
│                                         │
│ ☐ Workdir created by root              │
│   ┌─────────────────────────────────┐   │
│ │ Configure User Permission        │   │
│ │                                  │   │
│ │ PUID: [1000]            *         │   │  ← Only shown when
│ │ PGID: [1000]            *         │   │    unchecked + Linux
│ │                                  │   │
│ │ ℹ️ Maps container user to        │   │
│ │    host user for file access     │   │
│ └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Configuration Form (Windows + any)      │
├─────────────────────────────────────────┤
│                                         │
│ Host OS: [Windows ▼]                    │
│                                         │
│ (Permission section completely hidden)  │  ← Not shown for Windows
│                                         │
└─────────────────────────────────────────┘
```

### User Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as ConfigForm
    participant State as Redux Store

    User->>UI: Selects profile type
    User->>UI: Selects Host OS
    User->>UI: Toggles "Workdir created by root"

    UI->>State: Get current config
    State-->>UI: Return config values

    alt Linux + full-custom + NOT root
        UI->>User: Show PUID/PGID fields
        Note over UI: Permission fields<br/>visible and required
    else Linux + full-custom + root OR Windows
        UI->>User: Hide PUID/PGID fields
        Note over UI: Show info message<br/>explaining why not needed
    end

    User->>UI: Modify other config
    UI->>UI: Re-evaluate permission visibility
```

### State Transitions

```mermaid
stateDiagram-v2
    [*] --> QuickStart: User selects profile
    [*] --> FullCustom: User selects profile

    QuickStart --> Hidden: Permission config
    Note right of Hidden: Never shown in<br/>quick-start mode

    FullCustom --> CheckOS: User selects profile
    CheckOS --> Windows: OS = Windows
    CheckOS --> Linux: OS = Linux

    Windows --> Hidden: Permission config
    Note right of Hidden: Not applicable<br/>for Windows

    Linux --> CheckRoot: OS verified
    CheckRoot --> Hidden: Root user
    Note right of Hidden: Root doesn't need<br/>permission mapping

    CheckRoot --> Visible: Non-root user
    Note right of Visible: PUID/PGID<br/>required for file access

    Hidden --> [*]
    Visible --> [*]
```

## Code Flow Changes

### Conditional Rendering Logic

```mermaid
flowchart TD
    A[ConfigForm Render] --> B{Profile ==<br/>full-custom?}
    B -->|No| C[Hide Permission Fields]
    B -->|Yes| D{Host OS ==<br/>linux?}
    D -->|No| C
    D -->|Yes| E{Workdir created<br/>by root?}
    E -->|Yes| F[Show Info Message:<br/>Not Required]
    E -->|No| G[Show PUID/PGID<br/>Input Fields]

    C --> H[Render Form]
    F --> H
    G --> H

    style G fill:#90EE90
    style C fill:#FFB6C1
    style F fill:#FFD700
```

### Component Architecture

```mermaid
graph TD
    A[ConfigForm.tsx] --> B[Profile Section]
    A --> C[Host OS Section]
    A --> D[Permission Section]

    D --> E{Profile Check}
    E -->|quick-start| F[Hidden]
    E -->|full-custom| G{OS Check}

    G -->|windows| F
    G -->|linux| H{Root User Check}

    H -->|root| I[Info Message]
    H -->|non-root| J[PUID/PGID Inputs]

    J --> K[Validation]
    K --> L[Generator]

    style J fill:#90EE90
    style F fill:#FFB6C1
    style I fill:#FFD700
```

### Data Flow for Permission Validation

```mermaid
sequenceDiagram
    participant Form as ConfigForm
    participant Validator as validation.ts
    participant Generator as generator.ts

    Form->>Form: User inputs PUID/PGID
    Form->>Validator: Validate config

    alt Linux mode
        Validator->>Validator: Check PUID is valid number
        Validator->>Validator: Check PGID is valid number
        Validator-->>Form: Return errors or success
    else Windows mode
        Validator->>Validator: Skip PUID/PGID validation
        Validator-->>Form: Success (no permission errors)
    end

    Form->>Generator: Generate YAML

    alt Linux mode with PUID/PGID
        Generator->>Generator: Add PUID/PGID env vars
        Generator-->>Form: Return YAML with permissions
    else Windows mode
        Generator->>Generator: Skip permission env vars
        Generator-->>Form: Return YAML without permissions
    end
```

## Impact
- **Affected specs**: docker-compose-generator (MODIFIED Requirement: 配置模式选择)
- **Affected code**:
  - `/src/components/docker-compose/ConfigForm.tsx` (lines 472-550) - Update conditional rendering logic
  - `/src/lib/docker-compose/validation.ts` (lines 98-106) - Already correct, no changes needed
  - `/src/lib/docker-compose/generator.ts` (permission section) - Already correct, no changes needed
- **Benefits**:
  - Improved user experience by eliminating irrelevant configuration options
  - Reduced confusion for Windows users and Linux root users
  - Maintained functionality for Linux non-root users who need permission configuration
- **Risks**:
  - Low risk - changes are limited to UI conditional rendering logic
  - Core functionality remains unchanged
  - Existing validation and generation logic already handle these conditions correctly

## Migration Plan
No migration needed - this is a UI-only improvement that doesn't change existing data structures or APIs. Default values remain unchanged.

## Open Questions
None - the requirements are clear and the implementation is straightforward.
