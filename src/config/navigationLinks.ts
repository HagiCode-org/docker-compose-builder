import { Globe, Github, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const NAVIGATION_LINKS = {
  officialSite: {
    url: 'https://hagicode.com',
    labelKey: 'header.navigation.officialSite',
    icon: Globe,
    external: true,
  },
  githubRepo: {
    url: 'https://github.com/HagiCode-org/site',
    labelKey: 'header.navigation.githubRepo',
    icon: Github,
    external: true,
  },
  discord: {
    url: 'https://discord.gg/qY662sJK',
    labelKey: 'header.navigation.discord',
    icon: MessageSquare,
    external: true,
  },
  qqGroup: {
    url: null,
    labelKey: 'header.navigation.qqGroup',
    icon: null,
    groupNumber: '610394020',
    action: 'copy',
  },
} as const;

export interface NavigationLink {
  url: string | null;
  labelKey: string;
  icon: LucideIcon | null;
  external?: boolean;
  groupNumber?: string;
  action?: 'copy' | null;
}
