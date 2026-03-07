import type { DockerComposeConfig } from '@/lib/docker-compose/types';

export function renderCaddyfileTemplate(config: DockerComposeConfig): string {
  const host = config.lanIp || '127.0.0.1';
  const listener = config.httpsPort === '443' ? host : `${host}:${config.httpsPort}`;

  return `# Auto-generated Caddyfile for Hagicode HTTPS
${listener} {
  tls internal

  handle /health {
    respond "OK" 200
  }

  reverse_proxy hagicode:45000 {
    header_up Host {host}
    header_up X-Forwarded-For {remote_host}
    header_up X-Forwarded-Proto {scheme}
  }
}
`;
}
