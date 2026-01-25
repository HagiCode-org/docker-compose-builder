# Change: Add GitHub Pages deployment support

## Why
该项目是一个 Docker Compose 配置构建工具，帮助用户通过可视化界面生成和管理 Docker Compose 文件。当前项目采用现代前端技术栈开发，但尚未提供便捷的部署方案，用户需要手动配置部署流程。缺乏直接将应用部署到 GitHub Pages 的能力限制了工具的易用性和普及性。

## What Changes
- 配置 GitHub Actions 工作流，实现代码推送后自动构建和部署
- 优化 Vite 构建配置，确保构建产物符合 GitHub Pages 部署要求
- 添加部署相关的 npm 脚本，支持本地一键部署
- 更新 README.md 文档，添加部署相关说明

## Impact
- Affected specs: deployment (新增)
- Affected code:
  - `vite.config.ts` - 配置 base 路径
  - `package.json` - 添加部署脚本
  - `.github/workflows/` - 新增 GitHub Actions 工作流
  - `README.md` - 更新文档
