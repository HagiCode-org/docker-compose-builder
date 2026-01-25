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

## License

MIT
