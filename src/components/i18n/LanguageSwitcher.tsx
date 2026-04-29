import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BUILDER_LANGUAGES,
  persistBuilderLanguage,
  resolveBuilderLanguageCode,
} from '@/i18n/config';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    persistBuilderLanguage(value);
    void i18n.changeLanguage(value);
  };
  const currentLanguage = resolveBuilderLanguageCode(i18n.resolvedLanguage ?? i18n.language);

  return (
    <Select
      value={currentLanguage}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder={t('common:languageSwitcher.selectLanguage')} />
      </SelectTrigger>
      <SelectContent>
        {BUILDER_LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
