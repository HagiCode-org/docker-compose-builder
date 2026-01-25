import { useState, useEffect } from 'react';
import { ClarityService } from '@/services/clarityService';
import type { ConsentType } from '@/services/clarityService';
import type { ClarityConfig } from '@/services/clarityService';

// Hook to manage user consent for Clarity
export function useClarityConsent() {
  const [consent, setConsentState] = useState<ConsentType>('all');

  useEffect(() => {
    const service = ClarityService.getInstance();
    if (service.isActive()) {
      service.setConsentV2(consent);
    }
  }, [consent]);

  const setConsent = (newConsent: ConsentType) => {
    setConsentState(newConsent);
  };

  return { consent, setConsent };
}

// Hook to get Clarity status
export function useClarityStatus() {
  const [status, setStatus] = useState<{ isActive: boolean; config: ClarityConfig | null }>({
    isActive: false,
    config: null
  });

  useEffect(() => {
    const service = ClarityService.getInstance();
    setStatus({
      isActive: service.isActive(),
      config: service.getConfig()
    });
  }, []);

  return status;
}