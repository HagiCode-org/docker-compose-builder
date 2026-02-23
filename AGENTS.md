# Docker Compose Builder Web - Agent Configuration

## Root Configuration
Inherits all behavior from `/AGENTS.md` at monorepo root.

## Project Context

Docker Compose Builder Web is a web-based tool for generating Docker Compose configurations for HagiCode. It provides an interactive configuration form with real-time validation and automatic YAML file generation.

### Deployment
- **Production URL**: https://builder.hagicode.com
- **Base Path**: `/docker-compose-builder/` (GitHub Pages)
- **Dev Server**: http://localhost:5174

### Key Features
- Interactive step-by-step configuration form
- Docker Compose YAML generation based on user input
- Multiple database options (internal PostgreSQL or external)
- API provider configuration (Anthropic, Zhipu AI, custom endpoints)
- Volume management with data persistence
- User permission mapping (PUID/PGID) for Linux
- Local storage persistence for configuration
- One-click copy/download generated YAML
- SEO optimized with meta tags, Open Graph, Twitter Cards
- Multi-language support (English and Chinese)

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **React DOM** | 19.2.0 | DOM rendering |
| **TypeScript** | ~5.9.3 | Type safety (strict mode enabled) |
| **Vite** | 7.2.4 | Build tool and dev server |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Redux Toolkit** | ^2.11.2 | Global state management |
| **React Redux** | ^9.2.0 | React bindings for Redux |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4.1.17 | Utility-first CSS |
| **@tailwindcss/vite** | ^4.1.18 | Tailwind Vite plugin |
| **tw-animate-css** | ^1.4.0 | Tailwind animations |
| **Radix UI** | Multiple | Headless UI primitives |
| **Base UI** | ^1.1.0 | Base UI components |
| **shadcn** | ^3.7.0 | Component system |
| **next-themes** | ^0.4.6 | Theme management |

### Internationalization
| Technology | Version | Purpose |
|------------|---------|---------|
| **i18next** | ^25.8.0 | Internationalization framework |
| **react-i18next** | ^16.5.3 | React bindings |
| **i18next-browser-languagedetector** | ^8.2.0 | Language detection |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **js-yaml** | ^4.1.1 | YAML parsing and generation |
| **clsx** | ^2.1.1 | Conditional classes |
| **tailwind-merge** | ^3.4.0 | Tailwind class merging |
| **class-variance-authority** | ^0.7.1 | Component variants |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| **lucide-react** | ^0.563.0 | Icon library |
| **react-resizable-panels** | ^3.0.6 | Resizable layouts |
| **react-syntax-highlighter** | ^16.1.0 | Code highlighting |
| **sonner** | ^2.0.7 | Toast notifications |
| **vaul** | ^1.1.2 | Drawer component |
| **input-otp** | ^1.4.2 | OTP input |

### Analytics
| Technology | Version | Purpose |
|------------|---------|---------|
| **Microsoft Clarity** | 1.0.2 | User behavior analytics |
| **51LA** | L6b88a5yK4h2Xnci | Web analytics (China) |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | ^4.0.18 | Unit testing framework |
| **@vitest/ui** | ^4.0.18 | Test UI |
| **verifyjs** | ^0.0.2 | Snapshot testing |

### Fonts
| Technology | Version | Purpose |
|------------|---------|---------|
| **@fontsource-variable/noto-sans** | ^5.2.10 | Variable font (UI) |
| **@fontsource/jetbrains-mono** | ^5.1.1 | Monospace font (code) |

## Project Structure

```
src/
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── docker-compose/          # Docker Compose specific components
│   ├── Header/                  # Header component
│   ├── i18n/                    # Language switcher component
│   ├── api-key-input.tsx        # API key input component
│   └── PromoBanner.tsx          # Promotional banner
├── lib/
│   ├── docker-compose/          # Core business logic
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── generator.ts         # YAML generation logic
│   │   ├── validation.ts        # Input validation
│   │   ├── defaultConfig.ts     # Default configuration
│   │   ├── slice.ts             # Redux slice
│   │   └── __tests__/           # Test suites
│   │       ├── unit/            # Unit tests (validation, generator)
│   │       ├── bdd/             # BDD scenario tests
│   │       ├── __verify__/      # Snapshot tests
│   │       │   └── __snapshots__/  # Committed snapshots
│   │       └── helpers/         # Test helpers
│   ├── seo/                     # SEO utilities
│   ├── store.ts                 # Redux store configuration
│   ├── utils.ts                 # General utilities (cn function)
│   └── links.ts                 # External links
├── pages/                       # Main page components
├── hooks/                       # Custom React hooks
├── contexts/                    # React contexts
├── config/                      # Configuration files (SEO, etc.)
├── services/                    # External service integrations
├── i18n/                        # Internationalization configuration
│   ├── en/                      # English translations
│   └── zh/                      # Chinese translations
├── assets/                      # Static assets
├── App.tsx                      # Root component
└── main.tsx                     # Entry point
```

### Key Files Outside src/
```
.
├── index.html                   # HTML entry point with SEO meta tags
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── verify.config.json          # Snapshot testing configuration
├── components.json             # shadcn/ui configuration
├── eslint.config.js            # ESLint configuration
├── vitest.config.ts            # Vitest configuration
├── package.json                # Dependencies and scripts
└── .github/workflows/ci.yml    # CI/CD pipeline
```

## Agent Behavior

When working in the docker-compose-builder-web submodule:

### Core Principles
1. **Pure frontend application**: Client-side only React app, no backend
2. **Use Vite patterns**: Follow Vite conventions for imports and configuration
3. **Component structure**: Use shadcn/ui patterns for component composition
4. **State management**: Use Redux Toolkit for global state
5. **Testing**: Write BDD-style tests with verify snapshots
6. **i18n required**: All user-facing strings must use i18next translation keys
7. **SEO awareness**: Consider SEO implications when adding pages or features

### Development Workflow
```bash
cd repos/docker-compose-builder-web
npm run dev              # Start dev server at http://localhost:5174
npm run build            # Production build (TypeScript + Vite)
npm run preview          # Preview production build
npm run test             # Run tests
npm run test:ui          # Test UI
npm run test:verify      # Run verify snapshot tests
npm run test:coverage    # Run tests with coverage
npm run lint             # Run ESLint
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE_PATH` | Base path for deployment | `/docker-compose-builder/` (production) |
| `VITE_51LA_ID` | 51LA Analytics ID | `L6b88a5yK4h2Xnci` |
| `NODE_ENV` | Environment | `development` / `production` |

## Specific Conventions

### Component Organization
- **shadcn/ui components**: `src/components/ui/`
- **Feature components**: Co-locate with feature logic
- **Composition patterns**: Follow shadcn compound component patterns
- **Component variants**: Use `class-variance-authority` (cva)

### State Management
- **Global state**: Redux Toolkit with slices
- **Domain state**: `src/lib/docker-compose/slice.ts` for Docker Compose config
- **Local state**: React `useState`/`useReducer` for component-local state
- **Form state**: Consider React Hook Form for complex forms

### Styling Guidelines
- **Utility classes**: Use Tailwind utility classes
- **Conditional classes**: Use `cn()` utility (clsx + tailwind-merge)
- **CSS variables**: Define in Tailwind config for theming
- **Responsive design**: Mobile-first approach with Tailwind breakpoints
- **Animations**: Use `tw-animate-css` for predefined animations

### YAML Generation
- **Library**: js-yaml for YAML parsing and generation
- **Type safety**: Maintain TypeScript types for all configurations
- **Validation**: Validate user input before YAML generation
- **Comments**: Include helpful comments in generated YAML

### SEO Best Practices
- **Meta tags**: All pages need proper SEO meta tags
- **Dynamic updates**: Use `src/lib/seo/utils.ts` for dynamic SEO
- **Configuration**: Keep SEO config in `src/config/seo.ts`
- **Structured data**: Include JSON-LD Schema.org markup

### Internationalization
- **Translation keys**: Use kebab-case keys (e.g., `common.save`)
- **Namespaces**: Organize translations by feature
- **Pluralization**: Use i18next pluralization features
- **Date/number formatting**: Use i18next formatters

## Testing Strategy

### Test Structure
The project uses a comprehensive three-tier test structure:

#### 1. Unit Tests (~62 tests)
**Location**: `src/lib/docker-compose/__tests__/unit/`
- Validation tests
- Generator tests
- Test individual functions in isolation

#### 2. BDD Tests (~40 tests)
**Location**: `src/lib/docker-compose/__tests__/bdd/`
- Edge case scenarios (18 tests)
- Quick start scenarios (9 tests)
- Full custom scenarios (13 tests)
- Test end-to-end workflows and user behaviors

#### 3. Snapshot Tests (~23 tests)
**Location**: `src/lib/docker-compose/__tests__/__verify__/`
- API provider snapshots (9 tests)
- Quick start snapshots (8 tests)
- Full custom snapshots (6 tests)
- Validate generated YAML output against committed snapshots

### Running Tests
```bash
# All tests
npm test

# Specific categories
npm test -- src/lib/docker-compose/__tests__/unit/
npm test -- src/lib/docker-compose/__tests__/bdd/
npm run test:verify    # Snapshot tests only

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### Snapshot Testing Guidelines

**When to Update Snapshots:**
- Intentional YAML structure/format changes
- New configuration options affecting output
- Bug fixes that changed generated YAML
- New features modifying output

**When NOT to Update:**
- Test failures due to code bugs (fix the code)
- Only timestamps/dynamic content changed (check scrubbers)
- CI fails but local passes (investigate environment differences)

**Update Process:**
```bash
# 1. Run tests to see differences
npm run test:verify

# 2. Update snapshots if changes are intentional
npm run test:verify -- -u

# 3. Review ALL snapshot changes carefully
# 4. Commit updated snapshots with code changes
git add src/lib/docker-compose/__tests__/__verify__/__snapshots__/
git commit -m "feat: update snapshots for [reason]"
```

### Verifyjs Configuration
The `verify.config.json` configures snapshot behavior:
- **Scrubbers**: Remove dynamic content (timestamps, paths)
- **File extension**: `.txt` for YAML snapshots
- **Directory**: `__verify__` for test organization

## CI/CD Pipeline

### GitHub Actions CI
**Location**: `.github/workflows/ci.yml`

**Workflow Steps:**
1. **Checkout**: Repository code
2. **Setup Node.js**: Version 20 with npm caching
3. **Install dependencies**: `npm ci` for clean installs
4. **Verify Snapshot Files**: Explicit check for snapshot existence
5. **Build**: TypeScript compilation
6. **Test**: Full test suite including snapshots
7. **PR Comment**: Automated test results on pull requests

### Deployment
- **Platform**: GitHub Pages
- **Branch**: `gh-pages`
- **Trigger**: Push to `main` branch
- **Commands**:
  ```bash
  npm run predeploy  # Build
  npm run deploy     # Deploy to gh-pages
  ```

## Disabled Capabilities

AI assistants should NOT suggest:
- **Backend technologies**: Express, Fastify, NestJS, server-side frameworks
- **SSR frameworks**: Next.js pages, Remix (this is a client-side Vite app)
- **Database connections**: ORMs, database clients (frontend-only app)
- **API routes**: Backend endpoints or server handlers
- **Electron patterns**: This is a web app, not a desktop app
- **Orleans patterns**: Distributed systems patterns (simple web app)
- **Server-side features**: Authentication, session management on server

## Architecture Patterns

### Design Patterns Used
- **Container/Presenter**: Component organization
- **Reducer Pattern**: Redux state management
- **Composition**: shadcn/ui component composition
- **Factory**: YAML generation based on configuration
- **Strategy**: Different API providers (Anthropic, Zhipu, custom)
- **Observer**: Redux subscription pattern

### Code Organization Principles
1. **Separation of Concerns**: Components vs. business logic vs. styling
2. **Single Responsibility**: Each function/component has one purpose
3. **DRY**: Extract reusable logic into utilities and hooks
4. **Type Safety**: Leverage TypeScript strict mode
5. **Testability**: Write testable, pure functions when possible

## Troubleshooting

### Common Issues

**Issue**: Snapshot tests fail after unrelated changes
- **Solution**: Check scrubbers in `verify.config.json`, review actual diff

**Issue**: Timestamps appearing in snapshots
- **Solution**: Verify regex patterns in scrubbers, test regex manually

**Issue**: Different paths in CI vs local
- **Solution**: Add path scrubbers to `verify.config.json`

**Issue**: Assets not loading in production
- **Solution**: Check `vite.config.ts` `base` configuration

**Issue**: Build failures
- **Solution**: Run `npm ci` for clean dependency install

## References

### Internal Documentation
- **Root AGENTS.md**: `/AGENTS.md` at monorepo root
- **Monorepo CLAUDE.md**: Root directory for monorepo-wide conventions
- **OpenSpec Workflow**: `/openspec/` for proposal-driven development
- **README**: `repos/docker-compose-builder-web/README.md`
- **Testing Guide**: `repos/docker-compose-builder-web/TESTING.md`

### External Resources
- [Vite Documentation](https://vite.dev/)
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [i18next](https://www.i18next.com/)
- [Vitest](https://vitest.dev/)
- [verifyjs](https://github.com/your-org/verifyjs)

## Quick Reference

### Import Aliases (configured in tsconfig.json)
```typescript
@/              → ./src/
@/components    → ./src/components/
@/lib           → ./src/lib/
@/hooks         → ./src/hooks/
@/utils         → ./src/lib/utils
```

### Common Commands
```bash
# Development
npm run dev              # Start dev server (http://localhost:5174)

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # All tests
npm run test:ui          # Test UI
npm run test:verify      # Snapshot tests
npm run test:coverage    # Coverage report

# Quality
npm run lint             # ESLint

# Deployment
npm run deploy           # Deploy to GitHub Pages
```

### File Locations
| Concern | Location |
|---------|----------|
| Docker Compose types | `src/lib/docker-compose/types.ts` |
| YAML generation | `src/lib/docker-compose/generator.ts` |
| Validation | `src/lib/docker-compose/validation.ts` |
| Redux slice | `src/lib/docker-compose/slice.ts` |
| SEO utilities | `src/lib/seo/utils.ts` |
| SEO config | `src/config/seo.ts` |
| Translations | `src/i18n/{en,zh}/` |
| UI components | `src/components/ui/` |
| shadcn config | `components.json` |
