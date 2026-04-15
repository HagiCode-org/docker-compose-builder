/**
 * 推广链接配置
 * 用于 Docker Compose Builder 站点的推广链接管理
 */

export const PROMO_LINKS = {
  aliyun: {
    url: 'https://www.aliyun.com/benefit/ai/aistar?userCode=vmx5szbq&clubBiz=subTask..12384055..10263..',
    label: '立即订阅',
    title: '阿里云千问 Coding Plan 上线',
    description: '阿里云千问 Coding Plan 已上线，满足开发日常需求。推荐 + Hagicode，完美实现开发过程中的各项需求。',
  },
};

export const DOCS_LINKS = {
  eula: {
    'zh-CN': 'https://docs.hagicode.com/legal/eula/',
    'en-US': 'https://docs.hagicode.com/en/legal/eula/',
  },
} as const;

/**
 * 获取阿里云千问 Coding Plan 推广链接
 * @returns 阿里云千问 Coding Plan 推广链接 URL
 */
export function getAliyunPromoUrl(): string {
  return PROMO_LINKS.aliyun.url;
}

export function getDocsEulaUrl(language?: string): string {
  return language === 'zh-CN' ? DOCS_LINKS.eula['zh-CN'] : DOCS_LINKS.eula['en-US'];
}

export default PROMO_LINKS;
