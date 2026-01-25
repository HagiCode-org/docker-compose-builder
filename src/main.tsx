import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from 'react-redux';
import { store } from './lib/store';
import { ThemeProvider } from './contexts/theme-context';
import { initializeClarity } from './services/clarityService';

import "./index.css"
import App from "./App.tsx"
import './i18n/config'; // Import i18n configuration

// Initialize Microsoft Clarity
initializeClarity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
