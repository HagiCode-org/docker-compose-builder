# Docker Compose Builder Web - Agent Configuration

## Root Configuration
Inherits all behavior from `/AGENTS.md` at monorepo root.

## Project Context

Docker Compose Builder Web is a web-based tool for generating Docker Compose configurations for HagiCode. It provides an interactive configuration form with real-time validation and automatic YAML file generation.

Key features:
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
- **React**: 19.2.0
- **React DOM**: 19.2.0
- **TypeScript**: ~5.9.3 (strict mode enabled)
- **Vite**: 7.2.4 (build tool and dev server)

### State Management
- **Redux Toolkit**: ^2.11.2
- **React Redux**: ^9.2.0

### Styling
- **Tailwind CSS**: ^4.1.17
- **Radix UI**: Multiple components (@radix-ui/react-*)
- **Base UI**: ^1.1.0
- **shadcn**: ^3.7.0
- **next-themes**: ^0.4.6 (theme support)

### Internationalization
- **i18next**: ^25.8.0
- **react-i18next**: ^16.5.3
- **i18next-browser-languagedetector**: ^8.2.0

### Utilities
- **js-yaml**: ^4.1.1 (YAML parsing and generation)
- **clsx**: ^2.1.1
- **tailwind-merge**: ^3.4.0
- **class-variance-authority**: ^0.7.1

### UI Components
- **lucide-react**: ^0.563.0 (icons)
- **react-resizable-panels**: ^3.0.6
- **react-syntax-highlighter**: ^16.1.0 (code highlighting)
- **sonner**: ^2.0.7 (toast notifications)
- **vaul**: ^1.1.2 (drawer)
- **input-otp**: ^1.4.2

### Analytics
- **Microsoft Clarity**: 1.0.2

### Testing
- **Vitest**: ^4.0.18
- **@vitest/ui**: ^4.0.18
- **verifyjs**: ^0.0.2

## Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── docker-compose/      # Docker Compose specific components
├── lib/
│   ├── docker-compose/      # Type definitions, utils, state management
│   │   ├── __tests__/       # BDD-style tests with verify snapshots
│   │   └── ...
│   ├── seo/                 # SEO utilities and configuration
│   ├── store.ts             # Redux store configuration
│   └── utils.ts             # General utilities
├── pages/                   # Main page components
├── hooks/                   # Custom React hooks
├── contexts/                # React contexts
├── config/                  # Configuration files (SEO, etc.)
├── services/                # External service integrations (Clarity, etc.)
├── i18n/                    # Internationalization configuration
├── assets/                  # Static assets
├── App.tsx                  # Root component
└── main.tsx                 # Entry point
```

## Agent Behavior

When working in the docker-compose-builder-web submodule:

1. **Pure frontend application**: This is a client-side only React app, no backend
2. **Use Vite patterns**: Follow Vite conventions for imports and configuration
3. **Component structure**: Use shadcn/ui patterns for component composition
4. **State management**: Use Redux Toolkit for global state
5. **Testing**: Write BDD-style tests with verify snapshots in `__tests__/__verify__` directories
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
npm run lint             # Run ESLint
```

### Testing Strategy
- Unit tests with Vitest
- BDD-style scenarios with verify snapshots
- Verify tests located in `__tests__/__verify__` directories
- Use `npm run test:verify` to run snapshot tests

## Specific Conventions

### Component Organization
- shadcn/ui components in `src/components/ui/`
- Feature-specific components in appropriate directories
- Follow shadcn composition patterns

### State Management
- Redux Toolkit for global application state
- Use slices for domain-specific state
- Keep component-local state in React useState/useReducer

### Styling
- Use Tailwind utility classes
- Follow Tailwind CSS 4 patterns
- Use cn() utility for conditional classes (clsx + tailwind-merge)

### YAML Generation
- Use js-yaml library for YAML parsing and generation
- Maintain type safety for Docker Compose configurations
- Validate generated YAML structure

### SEO
- All pages should have proper SEO meta tags
- Use utility functions in `src/lib/seo/utils.ts` for dynamic SEO updates
- Keep SEO configuration in `src/config/seo.ts`

## Disabled Capabilities

AI assistants should NOT suggest:
- Backend-only technologies (Express, Fastify, NestJS, etc.)
- Server-side rendering frameworks (Next.js pages, Remix, etc.)
- Database connections or ORMs (this is a frontend-only app)
- API routes or endpoints (no backend server)
- Electron patterns (this is a web app, not a desktop app)
- Orleans patterns or distributed systems (this is a simple web app)

## References

- **Root AGENTS.md**: `/AGENTS.md` at monorepo root
- **Monorepo CLAUDE.md**: See root directory for monorepo-wide conventions
- **OpenSpec Workflow**: Proposal-driven development happens at monorepo root level (`/openspec/`)
- **README**: `repos/docker-compose-builder-web/README.md`
- **Testing Guide**: `repos/docker-compose-builder-web/TESTING.md`
