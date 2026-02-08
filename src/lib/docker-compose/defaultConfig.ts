import type { DockerComposeConfig } from './types';

export const defaultConfig: DockerComposeConfig = {
  profile: 'quick-start',
  httpPort: '45000',
  containerName: 'hagicode-app',
  imageTag: '0',
  hostOS: 'linux',
  imageRegistry: 'aliyun-acr',
  aspNetEnvironment: 'Production',
  timezone: 'Asia/Shanghai',
  databaseType: 'sqlite',
  postgresDatabase: 'hagicode',
  postgresUser: 'postgres',
  postgresPassword: 'postgres',
  volumeType: 'named',
  volumeName: 'postgres-data',
  licenseKeyType: 'public',
  licenseKey: 'D76B5C-EC0A70-AEA453-BC9414-0A198D-V3',
  // Anthropic API Configuration (default to Zhipu AI)
  anthropicApiProvider: 'zai',
  anthropicAuthToken: '',
  anthropicUrl: '',
  workdirPath: '',
  workdirCreatedByRoot: false,
  puid: '1000',
  pgid: '1000',
};
