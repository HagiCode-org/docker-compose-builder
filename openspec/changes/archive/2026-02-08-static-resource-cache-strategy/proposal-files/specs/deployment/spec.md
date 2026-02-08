## ADDED Requirements

### Requirement: Azure Static Web Apps 静态资源缓存策略

系统 SHALL 在 Azure Static Web Apps 的 `staticwebapp.config.json` 配置中为静态资源设置客户端缓存策略。

#### Scenario: 静态资源缓存配置生效
- **WHEN** 静态资源请求路径匹配 `/assets/*` 模式
- **THEN** 响应包含 `Cache-Control: public, max-age=31536000, immutable` 头
- **AND** 客户端和 CDN 可以缓存该资源一年
- **AND** 浏览器不会重新验证该资源

#### Scenario: 内容哈希确保缓存一致性
- **WHEN** Vite 构建应用时
- **THEN** 静态资源文件名包含内容哈希（如 `app.abc123.js`）
- **AND** 文件内容变化后文件名自动变化
- **AND** 用户始终获取正确的资源版本

#### Scenario: 缓存策略配置验证
- **WHEN** 部署应用到 Azure Static Web Apps
- **THEN** `staticwebapp.config.json` 中的缓存规则生效
- **AND** 浏览器开发者工具显示静态资源带有正确的缓存头
- **AND** 返回访问时资源从缓存加载（状态码 200 或 304）
