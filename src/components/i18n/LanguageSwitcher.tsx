import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  const languages = [
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' }
  ];

  return (
    <Select
      value={i18n.language}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t('languageSwitcher.selectLanguage')} />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
