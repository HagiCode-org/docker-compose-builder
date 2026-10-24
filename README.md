# Docker Compose Builder

[![license](https://img.shields.io/badge/license-AGPL--3.0-ffd43b)](./LICENSE)
[![last commit](https://img.shields.io/github/last-commit/HagiCode-org/docker-compose-builder)](https://github.com/HagiCode-org/docker-compose-builder/commits/main)
[![website](https://img.shields.io/website?url=https%3A%2F%2Fbuilder.hagicode.com%2F&label=website)](https://builder.hagicode.com/)

[简体中文](./README_cn.md)

A web form that generates a ready-to-use Docker Compose configuration for deploying HagiCode, so you get a correct `docker-compose.yml` without writing YAML by hand.

## Features

- **Interactive Configuration Form**: Step-by-step configuration with real-time validation
- **Docker Compose YAML Generation**: Automatic YAML file generation based on user input
- **SQLite-Only Database Contract**: Export the supported embedded SQLite deployment path without legacy database branches
- **Explicit Executor Configuration**: Enable Claude/Codex/OpenCode in parallel without a default-provider route
- **LAN HTTPS Support**: Optional Caddy reverse proxy with `tls internal`
- **Volume Management**: Configure volume mounts for data persistence
- **User Permissions**: Linux user permission mapping (PUID/PGID) support
- **Responsive Design**: Works on both desktop and mobile devices
- **Local Storage Persistence**: Configuration saved to localStorage for convenience
- **One-Click Copy/Download**: Copy generated YAML to clipboard or download as file
- **Caddyfile Copy Workflow**: Preview and copy Caddyfile (no file download)
- **Multi-language Support**: Internationalization (i18n) with English and Chinese support

## Quick Start

1. Open [builder.hagicode.com](https://builder.hagicode.com/).
2. Fill in the form step by step: basic settings, license, executors, volume mounts and, if you want it, HTTPS.
3. Copy or download the generated `docker-compose.yml`. If you enabled HTTPS, also copy the Caddyfile and save it as `Caddyfile` next to the compose file.
4. In that folder, start HagiCode with Docker Compose:

```bash
docker compose up -d
```

### Configuration Options

#### Basic Settings
- **HTTP Port**: Port for the application to listen on
- **Container Name**: Name of the Docker container
- **Image Tag**: Docker image tag to use
- **Host OS**: Target operating system (Windows/Linux)
- **Image Registry**: Docker Hub image registry

#### Database
- **SQLite only**: Generated deployments persist the app database at `/app/data/hagicode.db`
- **No extra database sidecar**: The builder no longer exports unsupported database service or connection settings

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
- Network configuration
- Volume definitions
- Health check configurations
- Environment variables
- SQLite connection settings stored inside the `hagicode` service
- Explicit Claude, Codex, and OpenCode executor branches when those capabilities are enabled

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

AGPL-3.0. See [LICENSE](./LICENSE).
