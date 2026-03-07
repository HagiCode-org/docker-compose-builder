# HTTPS Certificate Guide

## Overview

The Docker Compose Builder uses Caddy with `tls internal` to auto-generate self-signed certificates for LAN HTTPS.

## How It Works

1. Enable HTTPS in **Full Custom** mode.
2. Configure `HTTPS Port` and `LAN IP`.
3. Download `docker-compose.yml`.
4. Copy Caddyfile content from the preview panel and save it as `Caddyfile` in the same directory.
5. Run:

```bash
docker compose up -d
```

## Certificate Storage

- Caddy stores generated certificates in Docker volume: `caddy_data`
- Internal path: `/data` in the Caddy container

## Browser Trust Steps

### Chrome / Edge
- Open `https://<lan-ip>:<https-port>`
- Click **Advanced**
- Continue to the site and optionally trust certificate in your OS certificate manager

### Firefox
- Open `https://<lan-ip>:<https-port>`
- Click **Advanced**
- Accept the risk and continue

### Safari
- Open `https://<lan-ip>:<https-port>`
- Open certificate details from warning page
- Trust certificate in Keychain when needed

## FAQ

### Why do I still see a warning?
Self-signed certificates are not trusted by default. This is expected for local deployments.

### Where is Caddyfile downloaded?
Caddyfile is **not downloaded**. Use the preview panel's copy action, then save it manually as `Caddyfile`.

### Which browsers are supported?
Latest stable Chrome, Edge, Firefox, and Safari.

### Troubleshooting

- Ensure Caddyfile and docker-compose.yml are in the same directory
- Check if `HTTPS Port` conflicts with other services
- Verify `LAN IP` matches your host network interface
