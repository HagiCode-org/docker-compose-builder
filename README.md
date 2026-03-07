# Docker Compose Builder

A modern Docker Compose configuration generator for Hagicode, built with React + TypeScript + Vite + shadcn/ui.

## Features

- **Interactive Configuration Form**: Step-by-step configuration with real-time validation
- **Docker Compose YAML Generation**: Automatic YAML file generation based on user input
- **Multiple Database Options**: Support for internal PostgreSQL or external database connections
- **API Provider Configuration**: Choose from Anthropic, Zhipu AI, or custom API endpoints
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

#### API Configuration

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

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
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
