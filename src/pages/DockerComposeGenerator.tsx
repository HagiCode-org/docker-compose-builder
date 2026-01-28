import { ConfigForm } from '@/components/docker-compose/ConfigForm';
import { ConfigPreview } from '@/components/docker-compose/ConfigPreview';
import { NavigationLinks } from '@/components/Header/NavigationLinks';
import { useTranslation } from 'react-i18next';
import { Dock } from 'lucide-react';

export function DockerComposeGenerator() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Single row: Logo/Title and Navigation Links */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Dock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  {t('header.title')}
                </h1>
              </div>
            </div>
            <NavigationLinks />
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
          <div className="order-1 xl:order-2 xl:sticky xl:top-20">
            <ConfigPreview />
          </div>
        </div>
      </main>
    </div>
  );
}
