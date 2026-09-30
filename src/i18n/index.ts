import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_BUILDER_LANGUAGE,
  i18nConfig,
  persistBuilderLanguage,
  resolveBuilderLanguageCode,
} from './config';
import { builderI18nResources } from './resources';

void i18n
  .use(initReactI18next)
  .init({
    ...i18nConfig,
    resources: builderI18nResources,
    lng: DEFAULT_BUILDER_LANGUAGE,
  });

i18n.on('languageChanged', (nextLanguage) => {
  const normalizedLanguage = resolveBuilderLanguageCode(nextLanguage);
  persistBuilderLanguage(normalizedLanguage);
});

export default i18n;
