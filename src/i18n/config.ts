import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const resources = {
  'zh-CN': {
    translation: zhCN
  },
  'en-US': {
    translation: enUS
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'zh-CN', // Default language
    lng: localStorage.getItem('language') || undefined, // Use saved language preference

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language
      caches: ['localStorage'],
      lookupLocalStorage: 'language'
    },

    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
