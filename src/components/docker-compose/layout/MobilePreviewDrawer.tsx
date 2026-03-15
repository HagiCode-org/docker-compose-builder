import type { ReactNode } from 'react';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface MobilePreviewDrawerProps {
  preview: ReactNode;
}

export function MobilePreviewDrawer({ preview }: MobilePreviewDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button type="button" className="w-full justify-between lg:hidden">
          <span>{t('workspace.mobilePreviewTrigger')}</span>
          <Eye className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="border-b border-border/60">
          <DrawerTitle>{t('workspace.mobilePreviewTitle')}</DrawerTitle>
          <DrawerDescription>{t('workspace.mobilePreviewDescription')}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">{preview}</div>
      </DrawerContent>
    </Drawer>
  );
}
