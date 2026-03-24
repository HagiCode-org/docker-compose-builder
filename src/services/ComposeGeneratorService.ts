import type { DockerComposeConfig } from '@/lib/docker-compose/types';
import { buildCaddyService, generateYAML } from '@/lib/docker-compose/generator';
// Deployment builds may skip the optional DefinitelyTyped package for this library.
// @ts-ignore
import yaml from 'js-yaml';

export class ComposeGeneratorService {
  generateCompose(config: DockerComposeConfig, language: string = 'zh-CN'): string {
    return generateYAML(config, undefined, language);
  }

  generateHttpsProxyContainer(config: DockerComposeConfig): string[] {
    return buildCaddyService(config);
  }

  generateCaddyDataVolume(): Record<string, never> {
    return {};
  }

  injectHttpsConfig(composeObject: Record<string, unknown>, config: DockerComposeConfig): Record<string, unknown> {
    if (!config.enableHttps) {
      return composeObject;
    }

    const services = (composeObject.services as Record<string, unknown> | undefined) ?? {};
    services['https-proxy'] = {
      image: 'caddy:2-alpine',
      container_name: 'https-proxy',
      ports: [`${config.httpsPort}:443`],
      volumes: [
        './Caddyfile:/etc/caddy/Caddyfile:ro',
        'caddy_data:/data',
        'caddy_config:/config',
      ],
      depends_on: ['hagicode'],
      restart: 'unless-stopped',
      networks: ['pcode-network'],
    };

    const volumes = (composeObject.volumes as Record<string, unknown> | undefined) ?? {};
    volumes.caddy_data = this.generateCaddyDataVolume();
    volumes.caddy_config = this.generateCaddyDataVolume();

    return {
      ...composeObject,
      services,
      volumes,
    };
  }

  toYaml(composeObject: Record<string, unknown>): string {
    return yaml.dump(composeObject, { noRefs: true });
  }
}
