import { useTranslation } from 'react-i18next';

import { resolveBuilderFooterSiteLinks } from '@/lib/footer-site-links';

export function SiteFooter() {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'zh-CN' ? 'zh-CN' : 'en-US';
  const relatedLinks = resolveBuilderFooterSiteLinks(locale);

  return (
    <footer className="border-t border-border/70 bg-background/80 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.1fr_1fr_0.9fr]">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            DOCKER COMPOSE BUILDER
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {locale === 'zh-CN' ? '公开页脚' : 'Public footer'}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            {locale === 'zh-CN'
              ? '共享站点入口来自已签入 snapshot；Builder 自身的 GitHub、Discord 与 QQ 支持入口仍保留在本仓。'
              : 'Shared site destinations come from the bundled snapshot while Builder keeps its own GitHub, Discord, and QQ support actions.'}
          </p>
        </section>

        <nav aria-label={locale === 'zh-CN' ? '生态站点' : 'Related sites'}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {locale === 'zh-CN' ? '生态站点' : 'Related sites'}
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

        <nav aria-label={locale === 'zh-CN' ? '社区与支持' : 'Community and support'}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/80">
            {locale === 'zh-CN' ? '社区与支持' : 'Community and support'}
          </h2>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="https://github.com/HagiCode-org/site" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              GitHub
            </a>
            <a href="https://discord.gg/qY662sJK" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              Discord
            </a>
            <a href="https://qm.qq.com/q/Fwb0o094kw" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
              {locale === 'zh-CN' ? 'QQ 群 610394020' : 'QQ Group 610394020'}
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
