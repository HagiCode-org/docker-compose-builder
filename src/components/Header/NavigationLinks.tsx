import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Menu, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { NAVIGATION_LINKS } from '@/config/navigationLinks';

interface NavigationLinksProps {
  className?: string;
}

export function NavigationLinks({ className = '' }: NavigationLinksProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCopyQQNumber = async () => {
    try {
      await navigator.clipboard.writeText(NAVIGATION_LINKS.qqGroup.groupNumber!);
      toast.success(t('header.navigation.copied'));
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(t('common.error'));
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:flex items-center gap-2 ${className}`}>
        {/* Official Site Link */}
        <a
          href={NAVIGATION_LINKS.officialSite.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
          aria-label={t(NAVIGATION_LINKS.officialSite.labelKey)}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t(NAVIGATION_LINKS.officialSite.labelKey)}</span>
        </a>

        {/* GitHub Repository Link */}
        <a
          href={NAVIGATION_LINKS.githubRepo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
          aria-label={t(NAVIGATION_LINKS.githubRepo.labelKey)}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t(NAVIGATION_LINKS.githubRepo.labelKey)}</span>
        </a>

        {/* QQ Group Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyQQNumber}
          className="text-sm h-8 px-3 hover:bg-accent/50 transition-all duration-200"
          aria-label={t('header.navigation.copyGroupNumber')}
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          <span>{t(NAVIGATION_LINKS.qqGroup.labelKey, { groupNumber: NAVIGATION_LINKS.qqGroup.groupNumber })}</span>
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden" ref={menuRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          className="h-8 px-2"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div
            className="absolute right-4 top-16 bg-card/95 backdrop-blur-xl border-2 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 min-w-[200px]"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Official Site Link */}
            <a
              href={NAVIGATION_LINKS.officialSite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-xl transition-all duration-200 cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>{t(NAVIGATION_LINKS.officialSite.labelKey)}</span>
            </a>

            {/* GitHub Repository Link */}
            <a
              href={NAVIGATION_LINKS.githubRepo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-xl transition-all duration-200 cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>{t(NAVIGATION_LINKS.githubRepo.labelKey)}</span>
            </a>

            {/* QQ Group Button */}
            <button
              onClick={() => {
                handleCopyQQNumber();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-xl transition-all duration-200 w-full text-left cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span>{t(NAVIGATION_LINKS.qqGroup.labelKey, { groupNumber: NAVIGATION_LINKS.qqGroup.groupNumber })}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
