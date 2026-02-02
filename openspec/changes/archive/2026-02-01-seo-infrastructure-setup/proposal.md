# Change: 添加基础 SEO 基础设施

## Why

当前站点缺乏基础的搜索引擎优化（SEO）配置，导致搜索引擎爬虫无法有效抓取和索引网站内容。这会影响站点的可见性，使得目标用户难以通过搜索引擎发现和使用本 Docker Compose Builder 工具。

## What Changes

- 为所有页面添加完整的 HTML meta 标签（title, description, keywords, viewport）
- 实现 Open Graph 协议标签（og:title, og:description, og:image, og:url）
- 配置 Twitter Card 标签以增强社交媒体分享体验
- 创建 `robots.txt` 文件，明确爬虫访问规则
- 生成 `sitemap.xml`，列出所有可索引页面
- 添加 JSON-LD 格式的 Schema.org 结构化数据标记
- 将 SEO 配置参数化，支持站点级和页面级覆盖

## Impact

- Affected specs: seo (新增)
- Affected code:
  - `index.html` - 添加基础 meta 标签
  - `public/` - 新增 robots.txt 和 sitemap.xml
  - `src/main.tsx` - 动态更新页面 meta 标签
  - `src/config/seo.ts` - SEO 配置文件（新建）
  - `src/lib/seo/` - SEO 工具函数（新建）
  - `vite.config.ts` - 构建时生成 sitemap
