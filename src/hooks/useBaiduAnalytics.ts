import { useEffect } from 'react';

// Default Baidu Analytics ID for builder.hagicode.com
const DEFAULT_BAIDU_ANALYTICS_ID = '26c9739b2f3cddbe36c649e0823ee2de';

/**
 * Custom React hook to integrate Baidu Analytics
 *
 * This hook dynamically injects the Baidu Analytics script in production environment only.
 * It ensures the script loads asynchronously without blocking page rendering.
 *
 * Environment Variables:
 * - VITE_BAIDU_ANALYTICS_ID: Baidu Analytics ID (optional, defaults to builder's ID)
 *
 * @see https://tongji.baidu.com/
 */
export function useBaiduAnalytics(): void {
  useEffect(() => {
    // Only load in production environment
    if (import.meta.env.PROD !== true) {
      return;
    }

    // Get Analytics ID from environment variable or use default
    const analyticsId = import.meta.env.VITE_BAIDU_ANALYTICS_ID || DEFAULT_BAIDU_ANALYTICS_ID;

    // Don't load if no ID is configured
    if (!analyticsId) {
      return;
    }

    // Check if script is already loaded to prevent duplicate injection
    if (document.querySelector(`script[src^="https://hm.baidu.com/hm.js?"]`)) {
      return;
    }

    // Create and inject the Baidu Analytics script
    const script = document.createElement('script');
    script.src = `https://hm.baidu.com/hm.js?${analyticsId}`;
    script.async = true; // Load asynchronously without blocking rendering

    // Insert script as the first script element
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      // Fallback: append to head if no scripts exist yet
      document.head.appendChild(script);
    }

    // Debug logging in development (optional, via environment variable)
    if (import.meta.env.VITE_BAIDU_ANALYTICS_DEBUG) {
      console.log('[Baidu Analytics] Script injected with ID:', analyticsId);
    }

    // Cleanup function (not strictly necessary for analytics scripts, but good practice)
    return () => {
      // Note: We don't remove the script on unmount because analytics should track
      // the full session. Removing it would stop tracking.
    };
  }, []);
}
