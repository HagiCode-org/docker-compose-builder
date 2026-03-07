import type { DockerComposeConfig } from '@/lib/docker-compose/types';

export interface HttpsConfig {
  enabled: boolean;
  port: string;
  lanIp: string;
}

export interface CaddyfilePreviewConfig {
  services: string[];
  lanIp: string;
  port: string;
}

export interface ComposeConfig extends DockerComposeConfig {
  httpsConfig?: HttpsConfig;
}
