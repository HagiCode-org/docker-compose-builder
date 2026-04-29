import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  i18nConfig,
  persistBuilderLanguage,
  resolveBuilderLanguageCode,
  resolveInitialBuilderLanguage,
} from './config';
import { builderI18nResources } from './resources';

void i18n
  .use(initReactI18next)
  .init({
    ...i18nConfig,
    resources: builderI18nResources,
    lng: resolveInitialBuilderLanguage(),
  });

if (!i18n.isInitialized) {
  i18n.on('initialized', () => {
    persistBuilderLanguage(i18n.resolvedLanguage ?? i18n.language);
  });
} else {
  persistBuilderLanguage(i18n.resolvedLanguage ?? i18n.language);
}

i18n.on('languageChanged', (nextLanguage) => {
  const normalizedLanguage = resolveBuilderLanguageCode(nextLanguage);
  persistBuilderLanguage(normalizedLanguage);
});

export default i18n;
