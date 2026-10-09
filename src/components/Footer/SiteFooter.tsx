import { useTranslation } from 'react-i18next';

import { resolveBuilderLanguageCode } from '@/i18n/config';
import { resolveBuilderFooterLinks } from '@/lib/footer-site-links';

type FooterLinkData = ReturnType<typeof resolveBuilderFooterLinks>['quick'][number];

function FooterLink({ link }: { link: FooterLinkData }) {
  return (
    <a
      href={link.href}
      target={link.target}
      rel={link.rel}
      aria-label={link.ariaLabel}
      className="transition-colors hover:text-foreground"
    >
      {link.label}
    </a>
  );
}

export function SiteFooter() {
  const { i18n, t } = useTranslation();
  const locale = resolveBuilderLanguageCode(i18n.resolvedLanguage);
  const { relatedSites, quick, community, filings, labels } = resolveBuilderFooterLinks(locale);

  return (
    <footer className="border-t border-border/70 bg-background/80 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_1fr_0.8fr_0.9fr]">
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
            {relatedSites.map((site) => (
              <a
                key={site.id}
                href={site.href}
                target={site.target}
                rel={site.rel}
                className="flex flex-col items-start gap-1 rounded-lg px-1 py-1 text-left transition-colors hover:text-foreground"
              >
                <span className="font-medium text-foreground">{site.name}</span>
                {site.description && (
                  <span className="text-xs leading-5 text-muted-foreground">{site.description}</span>
                )}
              </a>
            ))}
          </div>
        </nav>

        <nav aria-label={labels.navigation.quickLinks}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {labels.quickLinks}
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            {quick.map((link) => (
              <FooterLink key={link.id} link={link} />
            ))}
          </div>
        </nav>

        <nav aria-label={t('common:footer.communitySupport')}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {t('common:footer.communitySupport')}
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            {community.map((link) => (
              <FooterLink key={link.id} link={link} />
            ))}
          </div>
        </nav>
      </div>

      <div className="mx-auto mt-8 w-full max-w-7xl border-t border-border/70 pt-6 text-center text-xs text-muted-foreground">
        <nav aria-label={labels.navigation.filings} className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {filings.map((link) => (
            <FooterLink key={link.id} link={link} />
          ))}
        </nav>
        <p className="mt-3" suppressHydrationWarning>© {new Date().getFullYear()} HagiCode</p>
      </div>
    </footer>
  );
}
