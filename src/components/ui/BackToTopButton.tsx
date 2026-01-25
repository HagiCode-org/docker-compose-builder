import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

/**
 * Props for the BackToTopButton component
 */
export interface BackToTopButtonProps {
  /**
   * The scrollable container element to monitor for scroll events.
   * The button will be positioned relative to this container.
   */
  containerRef: React.RefObject<HTMLElement>;

  /**
   * Offset from top (in pixels) before showing the button.
   * When scrollTop > showThreshold, the button becomes visible.
   * @default 100
   */
  showThreshold?: number;

  /**
   * Button position preference - left or right side of container.
   * @default 'right'
   */
  position?: 'left' | 'right';

  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
}

/**
 * BackToTopButton Component
 *
 * A floating button that appears when users scroll down in a scrollable container,
 * providing a quick way to return to the top with smooth scrolling animation.
 *
 * Features:
 * - Context-aware: Only shows when scrolled beyond threshold
 * - Smooth animations: Fade in/out with CSS transitions
 * - Configurable position: Can be positioned at left or right bottom
 * - Accessible: Proper ARIA labels and keyboard navigation
 * - Responsive: Adapts to different screen sizes
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={containerRef} className="relative overflow-y-auto h-96">
 *   {/* Long content *\/}
 *   <BackToTopButton containerRef={containerRef} position="right" />
 * </div>
 * ```
 */
export const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  containerRef,
  showThreshold = 100,
  position = 'right',
  className,
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check scroll position and update visibility
    const handleScroll = () => {
      const shouldShow = container.scrollTop > showThreshold;
      setIsVisible(shouldShow);
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, showThreshold]);

  const scrollToTop = () => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Don't render button if container ref is not available
  if (!containerRef.current) {
    return null;
  }

  return (
    <Button
      size="icon"
      onClick={scrollToTop}
      aria-label={t('backToTop.ariaLabel')}
      className={cn(
        // Position classes - absolute position relative to scrollable container
        'absolute bottom-8 z-10',
        // Size and shadow
        'h-10 w-10 shadow-md',
        // Transitions
        'transition-opacity duration-200 ease-in-out',
        // Visibility - use opacity and pointer-events for smooth fade
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
        // Position based on prop - this must come last to override any conflicts
        position === 'left' ? 'left-8' : 'right-8',
        // Mobile responsive - adjust offset on smaller screens
        'lg:bottom-8',
        // Custom classes
        className
      )}
      title={t('backToTop.backToTop')}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};

export default BackToTopButton;
