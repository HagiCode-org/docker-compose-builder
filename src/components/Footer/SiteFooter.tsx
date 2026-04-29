import { useTranslation } from 'react-i18next';

import { resolveBuilderLanguageCode } from '@/i18n/config';
import { resolveBuilderFooterSiteLinks } from '@/lib/footer-site-links';

export function SiteFooter() {
  const { i18n, t } = useTranslation();
  const locale = resolveBuilderLanguageCode(i18n.resolvedLanguage).startsWith('zh') ? 'zh-CN' : 'en-US';
  const relatedLinks = resolveBuilderFooterSiteLinks(locale);

  return (
    <footer className="border-t border-border/70 bg-background/80 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_1fr_0.9fr]">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            {t('common:footer.eyebrow')}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {t('common:footer.title')}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            {t('common:footer.description')}
          </p>
        </section>

        <nav aria-label={t('common:footer.relatedSites')}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {t('common:footer.relatedSites')}
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            {relatedLinks.map((link) => (
              <a
                key={link.siteId}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-start gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:text-foreground"
              >
                <span className="font-medium text-foreground">{link.label}</span>
                <span className="text-xs leading-5 text-muted-foreground">{link.description}</span>
              </a>
            ))}
          </div>
        </nav>

        <nav aria-label={t('common:footer.communitySupport')}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {t('common:footer.communitySupport')}
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="https://github.com/HagiCode-org/site" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              GitHub
            </a>
            <a href="https://discord.gg/qY662sJK" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              Discord
            </a>
            <a href="https://qm.qq.com/q/Fwb0o094kw" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              {t('common:footer.qqGroup', { groupNumber: '610394020' })}
            </a>
            <a href="https://store.steampowered.com/app/4625540/Hagicode/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              Steam
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
