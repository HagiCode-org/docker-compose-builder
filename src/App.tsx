import { StrictMode, useEffect } from "react";
import { Provider } from "react-redux";

import { ThemeProvider } from "@/contexts/theme-context";
import {
  loadPersistedConfig,
  setProviders,
  setProvidersError,
  setProvidersLoading,
  updateConfig,
} from "@/lib/docker-compose/slice";
import { getProviderConfigLoader, initializeProviderConfig } from "@/lib/docker-compose/providerConfigLoader";
import { store } from "@/lib/store";
import { initializeDefaultSEO } from "@/lib/seo/utils";
import {
  resolveBuilderLanguageCode,
  resolveInitialBuilderLanguage,
} from "@/i18n/config";
import i18n from "@/i18n";
import { initializeClarity } from "@/services/clarityService";
import { DockerComposeGenerator } from "@/components/DockerComposeGenerator";

let browserInitializationStarted = false;

function initializeProviderSettings() {
  store.dispatch(setProvidersLoading(true));
  void initializeProviderConfig()
    .then(() => {
      store.dispatch(setProviders(getProviderConfigLoader().getAllProviders()));
    })
    .catch((error: unknown) => {
      console.error("Failed to initialize provider configuration:", error);
      store.dispatch(setProvidersError(error instanceof Error ? error.message : "Unknown error"));
    });
}

function updateLanguageMetadata(language: string) {
  initializeDefaultSEO(language);
  document.documentElement.lang = resolveBuilderLanguageCode(language);
}

function BrowserInitializer() {
  useEffect(() => {
    if (browserInitializationStarted) return;
    browserInitializationStarted = true;

    const savedConfig = loadPersistedConfig();
    if (savedConfig) {
      store.dispatch(updateConfig(savedConfig));
    }

    document.documentElement.classList.add("is-hydrated");
    initializeClarity();
    updateLanguageMetadata(i18n.resolvedLanguage ?? i18n.language);
    i18n.on("languageChanged", updateLanguageMetadata);
    initializeProviderSettings();
    void i18n.changeLanguage(resolveInitialBuilderLanguage());
  }, []);

  return null;
}

export function App({ initialRenderTime }: { initialRenderTime: string }) {
  return (
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider defaultTheme="dark">
          <BrowserInitializer />
          <DockerComposeGenerator initialRenderTime={initialRenderTime} />
        </ThemeProvider>
      </Provider>
    </StrictMode>
  );
}

export default App;