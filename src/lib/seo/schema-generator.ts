import { siteConfig, defaultSEOConfig } from '../../config/seo';

const HAGICODE_MAIN_URL = 'https://hagicode.com/';
const HAGICODE_DOCS_URL = 'https://docs.hagicode.com/';
const HAGICODE_COST_URL = 'https://cost.hagicode.com/';
const HAGICODE_SOUL_URL = 'https://soul.hagicode.com/';
const HAGICODE_TRAIT_URL = 'https://trait.hagicode.com/';

interface SiteReference {
  '@type': 'WebSite';
  '@id'?: string;
  name: string;
  url: string;
}

export interface WebApplicationSchema {
  '@context': string;
  '@type': 'WebApplication';
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  author?: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  isPartOf?: SiteReference;
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'Organization';
  name: string;
  url: string;
  description?: string;
  sameAs?: string[];
}

export interface SoftwareApplicationSchema {
  '@context': string;
  '@type': 'SoftwareApplication';
  name: string;
  operatingSystem: string;
  applicationCategory: string;
  description: string;
  url: string;
  author?: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  isPartOf?: SiteReference;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
}

export function generateWebApplicationSchema(): WebApplicationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    description: defaultSEOConfig.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      url: siteConfig.organization.url
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${HAGICODE_MAIN_URL}#website`,
      name: 'HagiCode',
      url: HAGICODE_MAIN_URL
    }
  };
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organization.name,
    url: siteConfig.organization.url,
    description: 'Open source tools for developers',
    sameAs: [
      siteConfig.githubUrl,
      HAGICODE_MAIN_URL,
      HAGICODE_DOCS_URL,
      HAGICODE_COST_URL,
      HAGICODE_SOUL_URL,
      HAGICODE_TRAIT_URL
    ]
  };
}

export function generateSoftwareApplicationSchema(): SoftwareApplicationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    operatingSystem: 'Web',
    applicationCategory: 'DeveloperApplication',
    description: defaultSEOConfig.description,
    url: siteConfig.siteUrl,
    author: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
      url: siteConfig.organization.url
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${HAGICODE_MAIN_URL}#website`,
      name: 'HagiCode',
      url: HAGICODE_MAIN_URL
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };
}

export function injectJSONLD(schema: WebApplicationSchema | OrganizationSchema | SoftwareApplicationSchema) {
  const scriptId = `json-ld-${schema['@type']}`;
  let script = document.getElementById(scriptId) as HTMLScriptElement;

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(schema, null, 2);
}

export function injectAllSchemas() {
  injectJSONLD(generateWebApplicationSchema());
  injectJSONLD(generateOrganizationSchema());
  injectJSONLD(generateSoftwareApplicationSchema());
}

export function removeJSONLD(type: string) {
  const scriptId = `json-ld-${type}`;
  const script = document.getElementById(scriptId);
  if (script) {
    script.remove();
  }
}

export function removeAllSchemas() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => script.remove());
}
