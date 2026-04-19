import { beforeEach, describe, expect, it } from 'vitest';

import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebApplicationSchema,
  injectAllSchemas,
} from '../schema-generator';

type MockScript = {
  id: string;
  type: string;
  textContent: string;
  remove: () => void;
};

function installMockDocument() {
  const scripts: MockScript[] = [];

  const head = {
    appendChild(node: MockScript) {
      scripts.push(node);
    },
    querySelectorAll(selector: string) {
      if (selector !== 'script[type="application/ld+json"]') {
        return [];
      }

      return scripts.filter((script) => script.type === 'application/ld+json');
    },
  };

  Object.defineProperty(head, 'innerHTML', {
    configurable: true,
    get() {
      return '';
    },
    set() {
      scripts.length = 0;
    },
  });

  const documentMock = {
    head,
    getElementById(id: string) {
      return scripts.find((script) => script.id === id) ?? null;
    },
    createElement(tagName: string) {
      if (tagName !== 'script') {
        throw new Error(`Unsupported tag requested in test mock: ${tagName}`);
      }

      const node: MockScript = {
        id: '',
        type: '',
        textContent: '',
        remove() {
          const index = scripts.indexOf(node);
          if (index >= 0) {
            scripts.splice(index, 1);
          }
        },
      };

      return node;
    },
  };

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: documentMock,
  });
}

describe('builder schema-generator', () => {
  beforeEach(() => {
    installMockDocument();
    document.head.innerHTML = '';
  });

  it('adds ecosystem relations to organization and application schemas', () => {
    const organization = generateOrganizationSchema();
    const webApplication = generateWebApplicationSchema();
    const softwareApplication = generateSoftwareApplicationSchema();

    expect(organization.sameAs).toContain('https://hagicode.com/');
    expect(organization.sameAs).toContain('https://docs.hagicode.com/');
    expect(webApplication.isPartOf?.url).toBe('https://hagicode.com/');
    expect(softwareApplication.isPartOf?.url).toBe('https://hagicode.com/');
  });

  it('injects the enriched JSON-LD graph into the document head', () => {
    injectAllSchemas();

    const scripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'));
    expect(scripts).toHaveLength(3);

    const organization = JSON.parse(document.getElementById('json-ld-Organization')?.textContent ?? '{}');
    const webApplication = JSON.parse(document.getElementById('json-ld-WebApplication')?.textContent ?? '{}');

    expect(organization.sameAs).toContain('https://trait.hagicode.com/');
    expect(webApplication.isPartOf.url).toBe('https://hagicode.com/');
  });
});
