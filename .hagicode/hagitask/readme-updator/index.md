---
public: true
multilingual: true
languages:
  - en-US
  - zh-CN
sourceLanguage: en-US
style: product
---

# README requirements

## Product focus

- Introduce Docker Compose Builder at https://builder.hagicode.com as a web form that generates a ready-to-use Docker Compose configuration for deploying HagiCode.
- Describe what users get: step-by-step configuration with real-time validation, a generated `docker-compose.yml` with copy and download, SQLite-based persistence, parallel Claude, Codex and OpenCode executor settings, volume mounts with Linux PUID/PGID mapping, optional LAN HTTPS through a Caddy proxy with a copyable Caddyfile, settings remembered in the browser, a responsive layout, and English and Chinese interfaces.
- Address people who deploy HagiCode with Docker first. Developers who build or contribute to the site are secondary and need no more than a short pointer.
- Lead with product value (a correct compose file without writing YAML by hand) before technical detail.

## Required content

- Open with a short product introduction, the website link, the badges and the language link the current README carries.
- Keep the features list and a user-facing quick start: open the site, fill in the form, copy or download the generated files, and run them with Docker Compose.
- Keep the configuration options users choose (basic settings, database, license, executors, volume mounts, HTTPS) and what the generated Docker Compose file contains, as the current README does.
- Keep the AGPL-3.0 license badge and the license statement consistent with `LICENSE`.

## README languages

- Maintain English in `README.md` and Simplified Chinese in `README_cn.md`, keeping the reciprocal language link and the existing filenames.
- Keep both files aligned in scope and meaning.

## Exclusions

- Exclude analytics keys, tokens, secret values, internal hosts, machine-specific paths and private links.
- Do not list features the builder does not show.
- Keep repository maintenance instructions out of the README: repository layout and project structure, internal architecture, CI, build and test commands, deployment and Pages configuration, analytics and HagiLight integration, SEO internals and contribution workflow.
