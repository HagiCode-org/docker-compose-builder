import type { SEOConfig, PageSEOConfig } from '../../config/seo';
import { defaultSEOConfig, siteConfig } from '../../config/seo';

export function setMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function setOGMetaTag(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function setTwitterMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="twitter:${name}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', `twitter:${name}`);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function setLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function setTitle(title: string) {
  document.title = title;
}

export function setCanonicalUrl(url: string) {
  setLinkTag('canonical', url);
}

export function updateSEO(config: Partial<SEOConfig> & PageSEOConfig) {
  const fullConfig = { ...defaultSEOConfig, ...config };

  // Basic meta tags
  if (config.title || fullConfig.title) {
    setTitle(fullConfig.title);
    setMetaTag('title', fullConfig.title);
  }

  if (config.description || fullConfig.description) {
    setMetaTag('description', fullConfig.description);
  }

  if (config.keywords || fullConfig.keywords) {
    setMetaTag('keywords', fullConfig.keywords.join(', '));
  }

  // Open Graph tags
  setOGMetaTag('og:title', fullConfig.title);
  setOGMetaTag('og:description', fullConfig.description);
  setOGMetaTag('og:image', fullConfig.image);
  setOGMetaTag('og:url', fullConfig.url);
  setOGMetaTag('og:type', fullConfig.type);
  setOGMetaTag('og:locale', fullConfig.locale);

  // Twitter Card tags
  setTwitterMetaTag('card', 'summary_large_image');
  setTwitterMetaTag('title', fullConfig.title);
  setTwitterMetaTag('description', fullConfig.description);
  setTwitterMetaTag('image', fullConfig.image);

  if (fullConfig.twitterHandle) {
    setTwitterMetaTag('site', fullConfig.twitterHandle);
  }

  // Canonical URL
  if (config.canonical || fullConfig.url) {
    setCanonicalUrl(config.canonical || fullConfig.url);
  }

  // Noindex tag for pages that shouldn't be indexed
  if (config.noindex) {
    setMetaTag('robots', 'noindex, nofollow');
  } else {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.remove();
    }
  }

  // Alternate language tags
  if (fullConfig.alternateLocales && fullConfig.alternateLocales.length > 0) {
    fullConfig.alternateLocales.forEach(locale => {
      setLinkTag('alternate', `${fullConfig.url}?lang=${locale}`);
      const lastLink = document.querySelector(`link[rel="alternate"]:last-child`) as HTMLLinkElement;
      if (lastLink) {
        lastLink.setAttribute('hreflang', locale);
      }
    });
  }
}

export function updatePageSEO(pathname: string, pageConfig?: PageSEOConfig) {
  const url = `${siteConfig.siteUrl}${pathname.slice(1)}`;
  updateSEO({
    url,
    ...pageConfig
  });
}

export function initializeDefaultSEO() {
  updateSEO({});
}
