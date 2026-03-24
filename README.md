# Docker Compose Builder

[简体中文](./README_cn.md)

A modern Docker Compose configuration generator for Hagicode, built with React + TypeScript + Vite + shadcn/ui.

## Features

- **Interactive Configuration Form**: Step-by-step configuration with real-time validation
- **Docker Compose YAML Generation**: Automatic YAML file generation based on user input
- **Multiple Database Options**: Support for internal PostgreSQL or external database connections
- **Explicit Executor Configuration**: Enable Claude/Codex/OpenCode in parallel without a default-provider route
- **LAN HTTPS Support**: Optional Caddy reverse proxy with `tls internal`
- **Volume Management**: Configure volume mounts for data persistence
- **User Permissions**: Linux user permission mapping (PUID/PGID) support
- **Responsive Design**: Works on both desktop and mobile devices
- **Local Storage Persistence**: Configuration saved to localStorage for convenience
- **One-Click Copy/Download**: Copy generated YAML to clipboard or download as file
- **Caddyfile Copy Workflow**: Preview and copy Caddyfile (no file download)
- **SEO Optimized**: Full search engine optimization with meta tags, Open Graph, Twitter Cards, and structured data
- **Multi-language Support**: Internationalization (i18n) with English and Chinese support

## Quick Start

### Installation

Use Node.js `^20.19.0 || >=22.12.0` before installing dependencies. This applies to `npm run dev`, `npm run build`, and `npm test`.

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5174`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Recommended Validation

Run these commands after dependency upgrades or CI/runtime changes:

```bash
npm run build
npm test
npm run dev
```

Expected behavior:

- `npm run build` completes TypeScript compilation and writes assets to `dist/`
- `npm test` completes the Vitest suite, including snapshot verification
- `npm run dev` starts the Vite 8 dev server and keeps the app reachable on `http://localhost:5174`

### Deploy to GitHub Pages

#### Automatic Deployment (GitHub Actions)

The project is configured with GitHub Actions to automatically deploy to GitHub Pages when code is pushed to the `main` branch.

#### Manual Deployment

```bash
npm run deploy
```

This will build the application and deploy it to the `gh-pages` branch.

### GitHub Pages Configuration

1. Ensure your repository has GitHub Pages enabled:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Build and deployment", select "Deploy from a branch"
   - Choose "gh-pages" branch and "/ (root)" folder
   - Click "Save"

2. The application will be available at:
   `https://<your-username>.github.io/docker-compose-builder/`

### Deployment Troubleshooting

- **404 Error**: Ensure GitHub Pages is properly configured and the `gh-pages` branch exists
- **Assets not loading**: Check that `vite.config.ts` has the correct `base` configuration
- **Build failures**: Verify dependencies are installed correctly with `npm ci`
- **Permissions**: Ensure the GitHub Actions workflow has the necessary permissions

### Configuration Options

#### Basic Settings
- **HTTP Port**: Port for the application to listen on
- **Container Name**: Name of the Docker container
- **Image Tag**: Docker image tag to use
- **Host OS**: Target operating system (Windows/Linux)
- **Image Registry**: Docker image registry (Docker Hub/Azure ACR)

#### Database
- **Internal PostgreSQL**: Built-in PostgreSQL service
- **External Database**: Connect to external PostgreSQL instance
- **Volume Type**: Named volume or bind mount for data storage

#### License
- **Public Test Key**: Default public test license
- **Custom License Key**: Use your own license key

#### Executor & API Configuration

- **Parallel Enablement**: Claude, Codex, and OpenCode can be enabled together (non-exclusive)
- **Explicit Selection Only**: Generated YAML exports enabled executor branches only; it does not write `AI__Providers__DefaultProvider`
- **Capability vs Routing**: Enabling one executor does not disable others, and runtime selection must now be explicit

##### Retained Integrated Executor Matrix

| Executor | Form Fields | Validation | Export Behavior |
|----------|-------------|------------|-----------------|
| Claude | Provider preset, token, optional custom endpoint | Requires token; custom preset also requires endpoint URL | Emits `ANTHROPIC_*` variables for the enabled Claude branch |
| Codex | `CODEX_API_KEY`, optional `CODEX_BASE_URL` | Requires `CODEX_API_KEY` when enabled | Emits `CODEX_*` variables only |
| OpenCode | Optional managed runtime model, config source toggle, host `opencode.json` path, plus optional `auth.json` / `models.json` paths | `default-managed` needs no extra field; `host-file` requires an absolute `opencode.json` path, and any provided `auth.json` / `models.json` path must also be an absolute `.json` path for the selected host OS | Emits explicit OpenCode provider registration plus `AI__OpenCode__*` managed runtime keys, then either mounts three managed volumes, or in `host-file` mode binds `opencode.json` and optionally adds `auth.json` / `models.json` mounts |

##### Other CLI Tools

HagiCode also supports other CLI tools, but the container integration documentation for them is not complete yet.

- Contribute container configuration changes in `https://github.com/HagiCode-org/docker-compose-builder`
- Contribute release and runtime contract changes in `https://github.com/HagiCode-org/releases`

##### OpenCode Notes

- OpenCode export uses the managed runtime contract already documented in the unified image. The builder emits `AI__OpenCode__*` settings explicitly and does not depend on a fallback default executor.
- The OpenCode runtime user inside the unified image is always `hagicode`. Every in-container path in this guide therefore uses the `/home/hagicode/` prefix instead of the host `~` directory.
- OpenCode always targets `/home/hagicode/.config/opencode/opencode.json` inside the container. In the recommended `default-managed` mode, the builder mounts three named volumes: `opencode-config-data:/home/hagicode/.config/opencode`, `opencode-auth-data:/home/hagicode/.local/share/opencode`, and `opencode-models-data:/home/hagicode/.cache/opencode`, so config, auth state, and model cache survive together.
- If you switch OpenCode to `host-file`, enter an absolute host path such as `/srv/opencode/opencode.json` or `C:\\opencode\\opencode.json`. Browsers cannot discover the Docker host bind path for you, so the exported compose file uses the manually entered path exactly as typed.
- `host-file` mode now supports three host file mappings: `opencode.json`, `auth.json`, and `models.json`. The config path is required, while the auth and model cache paths are optional and skipped when left empty.

##### OpenCode Default Path Mapping

The table below uses OpenCode's default macOS/Linux XDG directories for host-side examples and shows the corresponding in-container target paths for the `hagicode` user:

| File | Default host path (macOS/Linux) | In-container `hagicode` path | Notes |
|------|---------------------------------|------------------------------|-------|
| `opencode.json` | `~/.config/opencode/opencode.json` | `/home/hagicode/.config/opencode/opencode.json` | Config file managed by Builder and also bound in `host-file` mode |
| `auth.json` | `~/.local/share/opencode/auth.json` | `/home/hagicode/.local/share/opencode/auth.json` | Can be bound explicitly in `host-file` mode; otherwise you still prepare it yourself |
| `models.json` | `~/.cache/opencode/models.json` | `/home/hagicode/.cache/opencode/models.json` | Can be bound explicitly in `host-file` mode and skipped when empty |

##### Manual `auth.json` Migration

Persisting `opencode.json` does not mean the authentication state is already available inside the container. If you want the containerized OpenCode runtime to reuse an existing host login, follow these steps:

1. Locate the current host `auth.json`, usually at `~/.local/share/opencode/auth.json`.
2. If you use Builder's `host-file` mode, place that absolute host path in the `auth.json` mapping field. If you do not use that field, you can still prepare `/home/hagicode/.local/share/opencode/auth.json` with your own bind mount, pre-seeded file, or image initialization step.
3. If you also want to reuse the host model cache, provide the absolute host path to `models.json` so Builder can add `/home/hagicode/.cache/opencode/models.json` as another bind mount.
4. Make sure the files and their parent directories stay readable by the `hagicode` user inside the container.
5. Export and start the compose stack after that. Builder only binds the host paths you explicitly provide; it does not automatically discover, copy, or migrate these files.

##### Default CLI Persistence Volumes

All managed CLI volumes are emitted only when the related retained executor is enabled. If a volume is omitted from the service mount list, it is also omitted from the top-level `volumes:` section.

| Executor | Default volume | Container path | Override rule |
|----------|----------------|----------------|---------------|
| Claude | `claude-data` | `/home/hagicode/.claude` | None; emitted only when Claude is enabled |
| Codex | `codex-data` | `/home/hagicode/.codex` | None |
| OpenCode Config | `opencode-config-data` | `/home/hagicode/.config/opencode` | `host-file` mode replaces this managed volume with `<configHostPath>:/home/hagicode/.config/opencode/opencode.json` |
| OpenCode Auth | `opencode-auth-data` | `/home/hagicode/.local/share/opencode` | In `host-file` mode, providing `auth.json` switches this to a file mount at `/home/hagicode/.local/share/opencode/auth.json` |
| OpenCode Models | `opencode-models-data` | `/home/hagicode/.cache/opencode` | In `host-file` mode, providing `models.json` switches this to a file mount at `/home/hagicode/.cache/opencode/models.json` |

The application dynamically loads provider configurations from the docs repository at `https://docs.hagicode.com/presets/claude-code/providers/`. Available providers include:

- **Anthropic Official**: Official Anthropic API
- **Zhipu AI (ZAI)**: Chinese AI provider with Anthropic-compatible API
- **Aliyun DashScope**: Aliyun's AI service with Anthropic-compatible API
- **MiniMax**: MiniMax AI service with Anthropic-compatible API
- **Custom**: Custom API endpoint with Anthropic-compatible interface

##### Provider Configuration Fallback

The application uses a three-tier fallback strategy for provider configurations:

1. **Primary**: Fetch from docs repository (`https://docs.hagicode.com/presets/claude-code/providers/`)
2. **Fallback**: Use embedded backup configuration (included in code)
3. **Legacy**: Use hardcoded constants (for backward compatibility)

This ensures the application always works, even if the docs repository is temporarily unavailable.

##### Environment Variable Override

For local development, you can override the docs repository URL:

```bash
# Override to use local docs repository
VITE_PRESETS_BASE_URL=http://localhost:3000 npm run dev

# Or specify a different remote URL
VITE_PRESETS_BASE_URL=https://your-custom-docs-url.com npm run dev
```

The default value is `https://docs.hagicode.com`.

##### Embedded Backup Synchronization

The embedded backup configuration (`src/lib/docker-compose/providerConfigLoader.ts`) is synchronized with the docs repository presets. When adding new providers or updating existing ones in the docs repository, update the `EMBEDDED_BACKUP` constant to include the latest data.

#### Volume Mounts
- **Work Directory**: Path to your code repository
- **Root User Warning**: Detection and warning for root-owned directories
- **User Permission Mapping**: PUID/PGID configuration for Linux

#### HTTPS (Full Custom mode only)
- **Enable HTTPS Proxy**: Toggle Caddy reverse proxy generation
- **HTTPS Port**: Default `443`, supports custom ports
- **LAN IP Address**: Used for generated Caddy listener
- **Caddyfile Preview + Copy**: Copy content and save as `Caddyfile` alongside `docker-compose.yml`
- **Guide**: See `docs/https-certificate-guide.md`

## Generated Docker Compose File

The generator creates a complete `docker-compose.yml` file with:
- Hagicode application service
- PostgreSQL service (if internal database selected)
- Network configuration
- Volume definitions
- Health check configurations
- Environment variables
- Explicit Claude, Codex, and OpenCode executor branches when those capabilities are enabled

## Analytics Configuration

The application integrates two analytics platforms for comprehensive user behavior tracking:

### Microsoft Clarity

- **Purpose**: User behavior analysis with heatmaps, session recordings, and user journeys
- **Project ID**: `v6zgmrg1q7`
- **Environment**: Production only
- **Implementation**: Singleton service pattern via `src/services/clarityService.ts`

### Baidu Analytics (百度统计)

- **Purpose**: Web analytics for Chinese users, tracking page views, traffic sources, and user behavior
- **Analytics ID**: `26c9739b2f3cddbe36c649e0823ee2de` (default)
- **Environment**: Production only
- **Implementation**: Direct script embedding in `index.html`

### Configuration

Analytics IDs can be configured via environment variables:

```bash
# For local builds
VITE_BAIDU_ANALYTICS_ID=your_analytics_id npm run build

# For GitHub Actions (configured in repository secrets)
BAIDU_ANALYTICS_ID=26c9739b2f3cddbe36c649e0823ee2de
```

**Default Analytics IDs**:
- builder.hagicode.com: `26c9739b2f3cddbe36c649e0823ee2de`
- docs.hagicode.com: `04ac03637b01a1f4cc0bdfa376387fe5`
- hagicode.com: `43081dabdf7dd7249f20795e76c2f017`

### Verification

To verify analytics integration in production:

1. Open browser DevTools (F12)
2. Go to Network panel
3. Check for requests to:
   - `https://hm.baidu.com/hm.js?` (Baidu Analytics)
4. Verify Clarity is recording sessions in the Clarity Dashboard

## Technology Stack

- **React 19.2.0** with TypeScript
- **Vite 8** - Build tool and dev server
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Radix UI** - Headless UI primitives
- **Redux Toolkit** - State management
- **Sonner** - Toast notifications
- **React Syntax Highlighter** - Code highlighting

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── docker-compose/  # Docker Compose specific components
├── lib/
│   ├── docker-compose/  # Type definitions, utils, and state management
│   └── store.ts         # Redux store configuration
├── pages/               # Main page components
└── hooks/               # Custom React hooks
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## SEO Configuration

The application includes comprehensive SEO (Search Engine Optimization) features:

### Features

- **Meta Tags**: Complete HTML meta tags for title, description, keywords
- **Open Graph**: Enhanced social media sharing on Facebook, LinkedIn, etc.
- **Twitter Cards**: Optimized card display when sharing on Twitter
- **Structured Data**: JSON-LD Schema.org markup for WebApplication, SoftwareApplication, and Organization
- **Sitemap**: XML sitemap for search engine crawlers (`/sitemap.xml`)
- **Robots.txt**: Search engine crawler configuration (`/robots.txt`)
- **Canonical URLs**: Prevents duplicate content issues
- **Hreflang Tags**: Multi-language SEO support

### Customization

SEO configuration is centralized in `src/config/seo.ts`. You can customize:

- Site title and description
- Keywords
- Social media images
- Default locale and alternate languages
- Organization information

### Dynamic SEO Updates

SEO tags can be dynamically updated using the utility functions in `src/lib/seo/utils.ts`:

```typescript
import { updateSEO } from './lib/seo/utils';

// Update SEO for specific pages
updateSEO({
  title: 'Custom Page Title',
  description: 'Custom description',
  image: '/custom-image.png'
});
```

### Validation Tools

Test your SEO implementation with these online tools:

- **Google Lighthouse**: Built into Chrome DevTools - Tests SEO performance
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Markup Validator**: https://validator.schema.org/

### Adding a Custom Open Graph Image

To add a custom OG image:

1. Create an image at `public/og-image.png` (recommended size: 1200x630px)
2. Update the `image` property in `src/config/seo.ts`

## License

MIT
