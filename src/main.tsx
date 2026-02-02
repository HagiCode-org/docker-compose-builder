import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from 'react-redux';
import { store } from './lib/store';
import { ThemeProvider } from './contexts/theme-context';
import { initializeClarity } from './services/clarityService';
import { initializeDefaultSEO } from './lib/seo/utils';
import { injectAllSchemas } from './lib/seo/schema-generator';

import "./index.css"
import App from "./App.tsx"
import './i18n/config'; // Import i18n configuration

// Initialize Microsoft Clarity
initializeClarity();

// Initialize SEO
initializeDefaultSEO();
injectAllSchemas();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
