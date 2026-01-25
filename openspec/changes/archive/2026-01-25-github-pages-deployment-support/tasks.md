## 1. 配置 Vite 构建选项
- [x] 1.1 修改 `vite.config.ts`，添加 `base` 配置选项，支持自定义基础路径
- [x] 1.2 确保构建产物目录结构符合 GitHub Pages 要求

## 2. 添加部署脚本
- [x] 2.1 在 `package.json` 中添加 `deploy` 脚本，使用 `gh-pages` 库
- [x] 2.2 安装 `gh-pages` 依赖包
- [x] 2.3 添加 `predeploy` 脚本，自动在部署前执行构建

## 3. 配置 GitHub Actions 工作流
- [x] 3.1 创建 `.github/workflows/deploy.yml` 文件
- [x] 3.2 配置工作流触发器（push 到 main 分支）
- [x] 3.3 配置构建和部署步骤
- [x] 3.4 添加必要的权限配置

## 4. 更新文档
- [x] 4.1 更新 `README.md`，添加 GitHub Pages 部署说明
- [x] 4.2 提供配置步骤和注意事项
- [x] 4.3 添加部署故障排除指南

## 5. 验证和测试
- [x] 5.1 测试本地构建和部署流程
- [ ] 5.2 测试 GitHub Actions 自动部署
- [ ] 5.3 验证部署后的应用功能正常
