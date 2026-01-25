import { ConfigForm } from '@/components/docker-compose/ConfigForm';
import { ConfigPreview } from '@/components/docker-compose/ConfigPreview';
import { NavigationLinks } from '@/components/Header/NavigationLinks';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from 'react-i18next';
import { Dock, Waves } from 'lucide-react';

export function DockerComposeGenerator() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* First row: Logo/Title and Navigation Links */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Dock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {t('header.title')}
                </h1>
              </div>
            </div>
            <NavigationLinks />
          </div>

          {/* Second row: Subtitle and Controls */}
          <div className="flex justify-between items-center">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5" />
              {t('header.subtitle')}
            </p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Config Form Panel */}
          <div className="order-2 xl:order-1">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ConfigForm />
            </div>
          </div>

          {/* Config Preview Panel - Sticky on desktop */}
          <div className="order-1 xl:order-2 xl:sticky xl:top-32">
            <ConfigPreview />
          </div>
        </div>
      </main>
    </div>
  );
}
