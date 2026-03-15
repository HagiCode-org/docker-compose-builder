import type { DockerComposeConfig } from './types';

export const defaultConfig: DockerComposeConfig = {
  profile: 'quick-start',
  enabledExecutors: ['claude'],
  httpPort: '45000',
  enableHttps: false,
  httpsPort: '443',
  lanIp: '192.168.1.100',
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
  // Codex Runtime Configuration (default to empty strings)
  codexApiKey: '',
  codexBaseUrl: undefined,
  // CodeBuddy Runtime Configuration
  codebuddyApiKey: '',
  codebuddyInternetEnvironment: 'ioa',
  // Copilot CLI Runtime Configuration (default to empty strings)
  copilotApiKey: '',
  copilotBaseUrl: undefined,
  copilotMountWorkspace: true,
  // OpenCode Runtime Configuration
  openCodeModel: 'anthropic/claude-sonnet-4',
  workdirPath: '',
  workdirCreatedByRoot: false,
  puid: '1000',
  pgid: '1000',
  // Claude Code Extended Configuration (optional)
  anthropicSonnetModel: undefined,
  anthropicOpusModel: undefined,
  anthropicHaikuModel: undefined,
  claudeCodeExperimentalAgentTeams: false,
};
