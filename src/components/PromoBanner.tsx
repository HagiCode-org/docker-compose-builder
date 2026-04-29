import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAliyunPromoUrl } from '@/lib/links';

interface PromoBannerProps {
  className?: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const handleClick = () => {
    window.open(getAliyunPromoUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={`overflow-hidden ${className}`} style={{
      background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)',
      border: '1px solid #FF6B00'
    }}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">
              {t('common:promoBanner.title')}
            </h3>
            <p className="text-white/90">
              {t('common:promoBanner.description')}
            </p>
          </div>
          <Button
            onClick={handleClick}
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-2 rounded-full"
            aria-label={t('common:promoBanner.ariaLabel')}
          >
            {t('common:promoBanner.cta')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoBanner;
