import { describe, expect, it } from 'vitest';
import { ComposeGeneratorService } from '@/services/ComposeGeneratorService';
import { createMockConfig } from '../helpers/config';

describe('ComposeGeneratorService', () => {
  const service = new ComposeGeneratorService();

  it('generateCompose produces YAML output', () => {
    const yaml = service.generateCompose(createMockConfig());
    expect(yaml).toContain('services:');
    expect(yaml).toContain('hagicode:');
  });

  it('generateHttpsProxyContainer produces Caddy service lines', () => {
    const lines = service.generateHttpsProxyContainer(createMockConfig({
      enableHttps: true,
      httpsPort: '8443',
    }));
    expect(lines.join('\n')).toContain('https-proxy:');
    expect(lines.join('\n')).toContain('"8443:443"');
  });

  it('injectHttpsConfig appends proxy service and volumes', () => {
    const compose = {
      services: {
        hagicode: { image: 'newbe36524/hagicode:0' },
      },
      volumes: {},
    };
    const updated = service.injectHttpsConfig(compose, createMockConfig({
      enableHttps: true,
      httpsPort: '443',
    }));

    expect(updated.services).toHaveProperty('https-proxy');
    expect(updated.volumes).toHaveProperty('caddy_data');
    expect(updated.volumes).toHaveProperty('caddy_config');
    expect((updated.services as Record<string, { networks?: string[] }>)['https-proxy'].networks).toContain('pcode-network');
  });

  it('injectHttpsConfig keeps compose unchanged when HTTPS is disabled', () => {
    const compose = {
      services: {
        hagicode: { image: 'newbe36524/hagicode:0' },
      },
      volumes: {},
    };
    const updated = service.injectHttpsConfig(compose, createMockConfig({
      enableHttps: false,
    }));

    expect(updated.services).not.toHaveProperty('https-proxy');
  });

  it('toYaml serializes plain object', () => {
    const result = service.toYaml({ services: { test: { image: 'alpine' } } });
    expect(result).toContain('services:');
    expect(result).toContain('image: alpine');
  });
});
