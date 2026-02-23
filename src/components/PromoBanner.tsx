import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAliyunPromoUrl } from '@/lib/links';

interface PromoBannerProps {
  className?: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ className = '' }) => {
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
              🚀 阿里云千问 Coding Plan 上线
            </h3>
            <p className="text-white/90">
              阿里云千问 Coding Plan 已上线，满足开发日常需求。推荐 + Hagicode，完美实现开发过程中的各项需求。
            </p>
          </div>
          <Button
            onClick={handleClick}
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-2 rounded-full"
            aria-label="访问阿里云千问 Coding Plan 页面"
          >
            立即订阅 →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoBanner;