import clarity from '@microsoft/clarity';

// Configuration interface for Clarity
export interface ClarityConfig {
  projectId: string;
  tag?: string;
  regions?: string;
  upload?: {
    endpoint?: string;
    maxEvents?: number;
    maxBufferSize?: number;
  };
}

// Consent types for Clarity
export type ConsentType = 'all' | 'analytics' | 'none';

class ClarityService {
  private static instance: ClarityService;
  private initialized: boolean = false;
  private config: ClarityConfig | null = null;

  // Singleton instance getter
  public static getInstance(): ClarityService {
    if (!ClarityService.instance) {
      ClarityService.instance = new ClarityService();
    }
    return ClarityService.instance;
  }

  // Initialize Clarity with configuration
  public initialize(config: ClarityConfig): void {
    if (this.initialized) {
      console.warn('Clarity has already been initialized');
      return;
    }

    this.config = config;
    clarity.init(config.projectId);
    this.initialized = true;

    console.log('Clarity initialized with projectId:', config.projectId);
  }

  // Check if Clarity is active and initialized
  public isActive(): boolean {
    return this.initialized;
  }

  // Get current configuration
  public getConfig(): ClarityConfig | null {
    return this.config;
  }

  // Identify user with custom session ID, page ID, and friendly name
  public identifyUser(userId: string, customSessionId?: string, customPageId?: string, friendlyName?: string): void {
    if (!this.initialized) {
      console.warn('Clarity not initialized - call initialize() first');
      return;
    }

    clarity.identify(userId, customSessionId, customPageId, friendlyName);
    console.log('Clarity user identified:', userId);
  }

  // Set custom tag
  public setTag(tag: string, value: string | string[]): void {
    if (!this.initialized) {
      console.warn('Clarity not initialized - call initialize() first');
      return;
    }

    clarity.setTag(tag, value);
    console.log('Clarity tag set:', tag, value);
  }

  // Set consent (simple mode)
  public setConsent(consent: boolean): void {
    if (!this.initialized) {
      console.warn('Clarity not initialized - call initialize() first');
      return;
    }

    clarity.consent(consent);
    console.log('Clarity consent set:', consent);
  }

  // Set consent (GDPR mode with granular control)
  public setConsentV2(consent: ConsentType): void {
    if (!this.initialized) {
      console.warn('Clarity not initialized - call initialize() first');
      return;
    }

    switch (consent) {
      case 'all':
        clarity.consentV2({
          ad_Storage: 'granted',
          analytics_Storage: 'granted'
        });
        console.log('Clarity consent set to: all');
        break;
      case 'analytics':
        clarity.consentV2({
          ad_Storage: 'denied',
          analytics_Storage: 'granted'
        });
        console.log('Clarity consent set to: analytics');
        break;
      case 'none':
        clarity.consentV2({
          ad_Storage: 'denied',
          analytics_Storage: 'denied'
        });
        console.log('Clarity consent set to: none');
        break;
    }
  }
}

// Helper function to initialize Clarity with fixed project ID
export function initializeClarity(): ClarityService {
  const service = ClarityService.getInstance();
  service.initialize({
    projectId: 'v6zgmrg1q7' // Fixed project ID
  });
  return service;
}

export { ClarityService };