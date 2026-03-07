import { describe, expect, it } from 'vitest';
import { CaddyfileGeneratorService } from '@/services/CaddyfileGeneratorService';
import { createMockConfig } from '../helpers/config';
import { renderCaddyfileTemplate } from '@/utils/caddyfileTemplate';

describe('CaddyfileGeneratorService', () => {
  const service = new CaddyfileGeneratorService();

  it('generateCaddyfile produces valid Caddyfile', () => {
    const content = service.generateCaddyfile(createMockConfig({ enableHttps: true }));
    expect(content).toContain('tls internal');
    expect(content).toContain('reverse_proxy hagicode:45000');
  });

  it('generateHttpsListener supports custom IP and port', () => {
    expect(service.generateHttpsListener('192.168.1.10', '8443')).toBe('192.168.1.10:8443');
    expect(service.generateHttpsListener('192.168.1.10', '443')).toBe('192.168.1.10');
  });

  it('generateTlsInternalConfig includes tls internal directive', () => {
    expect(service.generateTlsInternalConfig().join('\n')).toContain('tls internal');
  });

  it('generateReverseProxyConfig outputs headers', () => {
    const output = service.generateReverseProxyConfig('hagicode').join('\n');
    expect(output).toContain('header_up Host {host}');
    expect(output).toContain('header_up X-Forwarded-For {remote_host}');
  });

  it('generateReverseProxyConfig supports multiple services with path routing', () => {
    const output = service.generateReverseProxyConfig([
      { path: '/api/', serviceName: 'api', servicePort: '8080' },
      { path: '/web/', serviceName: 'web', servicePort: '3000' },
    ]).join('\n');

    expect(output).toContain('handle_path /api/*');
    expect(output).toContain('reverse_proxy api:8080');
    expect(output).toContain('handle_path /web/*');
    expect(output).toContain('reverse_proxy web:3000');
  });

  it('generateHealthCheckConfig adds health endpoint', () => {
    expect(service.generateHealthCheckConfig().join('\n')).toContain('handle /health');
  });

  it('formatCaddyfile keeps deterministic formatting', () => {
    const raw = 'a \n b \n';
    expect(service.formatCaddyfile(raw)).toBe('a\n b\n');
  });

  it('template rendering substitutes listener variables', () => {
    const content = renderCaddyfileTemplate(createMockConfig({
      enableHttps: true,
      lanIp: '192.168.1.100',
      httpsPort: '8443',
    }));

    expect(content).toContain('192.168.1.100:8443');
    expect(content).toContain('reverse_proxy hagicode:45000');
  });
});
