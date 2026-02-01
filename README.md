# Docker Compose Builder

A modern Docker Compose configuration generator for Hagicode, built with React + TypeScript + Vite + shadcn/ui.

## Features

- **Interactive Configuration Form**: Step-by-step configuration with real-time validation
- **Docker Compose YAML Generation**: Automatic YAML file generation based on user input
- **Multiple Database Options**: Support for internal PostgreSQL or external database connections
- **API Provider Configuration**: Choose from Anthropic, Zhipu AI, or custom API endpoints
- **Volume Management**: Configure volume mounts for data persistence
- **User Permissions**: Linux user permission mapping (PUID/PGID) support
- **Responsive Design**: Works on both desktop and mobile devices
- **Local Storage Persistence**: Configuration saved to localStorage for convenience
- **One-Click Copy/Download**: Copy generated YAML to clipboard or download as file
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

## Configuration Options

### Basic Settings
- **HTTP Port**: Port for the application to listen on
- **Container Name**: Name of the Docker container
- **Image Tag**: Docker image tag to use
- **Host OS**: Target operating system (Windows/Linux)
- **Image Registry**: Docker image registry (Docker Hub/Azure ACR)

### Database
- **Internal PostgreSQL**: Built-in PostgreSQL service
- **External Database**: Connect to external PostgreSQL instance
- **Volume Type**: Named volume or bind mount for data storage

### License
- **Public Test Key**: Default public test license
- **Custom License Key**: Use your own license key

### API Configuration
- **Anthropic**: Official Anthropic API
- **Zhipu AI (ZAI)**: Chinese AI provider with Anthropic-compatible API
- **Custom**: Custom API endpoint with Anthropic-compatible interface

### Volume Mounts
- **Work Directory**: Path to your code repository
- **Root User Warning**: Detection and warning for root-owned directories
- **User Permission Mapping**: PUID/PGID configuration for Linux

## Generated Docker Compose File

The generator creates a complete `docker-compose.yml` file with:
- Hagicode application service
- PostgreSQL service (if internal database selected)
- Network configuration
- Volume definitions
- Health check configurations
- Environment variables

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
