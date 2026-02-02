export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
  type: 'website' | 'web-application' | 'article';
  locale: string;
  alternateLocales?: string[];
  twitterHandle?: string;
}

export interface PageSEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  canonical?: string;
}

export const defaultSEOConfig: SEOConfig = {
  title: 'Hagicode Docker Compose Builder',
  description: 'A powerful visual tool for creating and managing Docker Compose configurations. Build, customize, and export your docker-compose.yml files with an intuitive interface.',
  keywords: [
    'docker',
    'docker compose',
    'docker-compose',
    'yaml generator',
    'docker builder',
    'container orchestration',
    'devops tools',
    'docker ui',
    'compose builder'
  ],
  image: '/og-image.png',
  url: 'https://hagicode-org.github.io/docker-compose-builder/',
  type: 'web-application',
  locale: 'en',
  alternateLocales: ['zh-CN']
};

export const siteConfig = {
  name: 'Hagicode Docker Compose Builder',
  siteUrl: 'https://hagicode-org.github.io/docker-compose-builder/',
  githubUrl: 'https://github.com/newbe36524/docker-compose-builder',
  author: {
    name: 'newbe36524',
    url: 'https://github.com/newbe36524'
  },
  organization: {
    name: 'Hagicode',
    url: 'https://github.com/newbe36524'
  }
};

export const pageSEOMetadata: Record<string, PageSEOConfig> = {
  '/': {
    title: 'Hagicode Docker Compose Builder - Visual Docker Compose Generator',
    description: 'Create and manage Docker Compose configurations visually. Build docker-compose.yml files with an intuitive drag-and-drop interface.'
  }
};
