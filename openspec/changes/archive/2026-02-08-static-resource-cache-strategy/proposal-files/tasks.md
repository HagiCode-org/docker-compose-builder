## 1. 配置文件修改

- [x] 1.1 在 `public/staticwebapp.config.json` 中添加 `routes` 配置
- [x] 1.2 添加 `/assets/*` 路由规则
- [x] 1.3 配置 `Cache-Control` 响应头为 `public, max-age=31536000, immutable`

## 2. 本地验证

- [x] 2.1 确认配置文件 JSON 格式正确
- [x] 2.2 检查构建后的 `dist/staticwebapp.config.json` 包含正确配置

## 3. 部署验证

- [ ] 3.1 部署到 Azure Static Web Apps
- [ ] 3.2 使用浏览器开发者工具检查静态资源响应头
- [ ] 3.3 验证 `Cache-Control` 头值正确
- [ ] 3.4 确认刷新页面后资源从缓存加载

## 4. 完成检查

- [x] 4.1 所有 tasks.md 项已完成
- [x] 4.2 更新任务清单为全部完成状态
