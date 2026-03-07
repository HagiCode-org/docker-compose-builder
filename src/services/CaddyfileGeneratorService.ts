import type { DockerComposeConfig } from '@/lib/docker-compose/types';
import { buildCaddyfile } from '@/lib/docker-compose/generator';

export class CaddyfileGeneratorService {
  generateCaddyfile(config: DockerComposeConfig): string {
    return this.formatCaddyfile(buildCaddyfile(config));
  }

  generateHttpsListener(lanIp: string, httpsPort: string): string {
    return httpsPort === '443' ? lanIp : `${lanIp}:${httpsPort}`;
  }

  generateTlsInternalConfig(): string[] {
    return ['  tls internal'];
  }

  generateReverseProxyConfig(
    serviceName: string | Array<{ path: string; serviceName: string; servicePort?: string }>,
    servicePort: string = '45000'
  ): string[] {
    if (Array.isArray(serviceName)) {
      const lines: string[] = [];
      serviceName.forEach((route) => {
        lines.push(`  handle_path ${route.path}* {`);
        lines.push(`    reverse_proxy ${route.serviceName}:${route.servicePort || '45000'} {`);
        lines.push('      header_up Host {host}');
        lines.push('      header_up X-Forwarded-For {remote_host}');
        lines.push('      header_up X-Forwarded-Proto {scheme}');
        lines.push('    }');
        lines.push('  }');
      });
      return lines;
    }

    return [
      `  reverse_proxy ${serviceName}:${servicePort} {`,
      '    header_up Host {host}',
      '    header_up X-Forwarded-For {remote_host}',
      '    header_up X-Forwarded-Proto {scheme}',
      '  }',
    ];
  }

  generateHealthCheckConfig(): string[] {
    return [
      '  handle /health {',
      '    respond "OK" 200',
      '  }',
    ];
  }

  generateLogConfig(): string[] {
    return [
      '  log {',
      '    output stdout',
      '    format console',
      '    level info',
      '  }',
    ];
  }

  formatCaddyfile(content: string): string {
    return content
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      .trimEnd()
      .concat('\n');
  }
}
