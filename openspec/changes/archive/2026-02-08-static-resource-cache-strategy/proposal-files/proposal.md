# Change: 配置静态资源缓存策略

## Why

当前 Azure Static Web Apps 部署缺少客户端缓存配置，导致用户每次访问都需要重新获取静态资源（JS、CSS、图片等），增加了带宽消耗和加载时间，降低了用户体验。

## What Changes

- 在 `staticwebapp.config.json` 中添加 `/assets/*` 路径的缓存规则
- 配置 `Cache-Control: public, max-age=31536000, immutable` 响应头
- 利用 Vite 构建时的内容哈希机制确保缓存安全

## Impact

- Affected specs: `deployment` (添加 Azure Static Web Apps 静态资源缓存需求)
- Affected code: `public/staticwebapp.config.json`

## Benefits

- 减少重复资源请求，提升页面加载速度
- 降低 CDN 流量成本
- 改善用户体验，特别是移动端用户
