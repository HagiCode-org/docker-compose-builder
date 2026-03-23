import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from 'react-redux';
import { store } from './lib/store';
import { ThemeProvider } from './contexts/theme-context';
import { initializeClarity } from './services/clarityService';
import { initializeDefaultSEO } from './lib/seo/utils';
import { injectAllSchemas } from './lib/seo/schema-generator';
import { initializeProviderConfig, getProviderConfigLoader } from './lib/docker-compose/providerConfigLoader';
import {
  setProvidersLoading,
  setProviders,
  setProvidersError
} from './lib/docker-compose/slice';

import "./index.css"
import App from "./App.tsx"
import './i18n/config'; // Import i18n configuration

// Initialize Microsoft Clarity
initializeClarity();

// Initialize SEO
initializeDefaultSEO();
injectAllSchemas();

// Initialize provider configuration
async function initProviderConfig() {
  store.dispatch(setProvidersLoading(true));
  try {
    await initializeProviderConfig();
    // Get the providers from the loader instance
    const loader = getProviderConfigLoader();
    const providers = loader.getAllProviders();
    store.dispatch(setProviders(providers));
  } catch (error) {
    console.error('Failed to initialize provider configuration:', error);
    store.dispatch(setProvidersError(error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Start provider config initialization (non-blocking)
initProviderConfig();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
