import type { DockerComposeConfig } from '@/lib/docker-compose/types';

export function buildHttpsPortMapping(config: DockerComposeConfig): string[] {
  const mappings = [`${config.httpsPort}:443`];
  if (config.httpsPort === '443') {
    mappings.push('80:80');
  }
  return mappings;
}

export function buildHttpsProxyVolumes(): string[] {
  return [
    './Caddyfile:/etc/caddy/Caddyfile:ro',
    'caddy_data:/data',
    'caddy_config:/config',
  ];
}
