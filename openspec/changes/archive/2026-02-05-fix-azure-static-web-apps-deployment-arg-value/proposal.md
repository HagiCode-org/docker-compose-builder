# Change: 修复 Azure Static Web Apps 部署配置

## Why

当前 Azure Static Web Apps 部署工作流配置存在多个问题导致部署失败：
1. `output_location` 设置为 `"build"`，但项目实际构建输出目录为 `"dist"`（与 Vite 配置一致）
2. 使用过时的 `actions/checkout@v3`，而项目其他工作流已使用 `v4`
3. OIDC 认证依赖使用了旧版本的 `@actions/core@1.6.0`
4. 缺少明确的 Node.js 版本配置和构建步骤
5. 未使用 `skip_app_build: true` 导致 Azure 尝试重复构建

参考项目 `pcode-docs` 已有经过验证的 Azure Static Web Apps 部署配置，采用明确的手动构建流程和正确的路径配置。

## What Changes

- **修复 output_location 配置**：从 `"build"` 更改为 `"dist"`，并设置 `app_location: "dist"` + `skip_app_build: true`
- **统一 GitHub Actions 版本**：将 `actions/checkout` 升级到 `@v4`
- **添加显式构建步骤**：在工作流中明确添加 Node.js 设置、依赖安装和构建步骤
- **添加 Azure Static Web Apps 配置文件**：创建 `public/staticwebapp.config.json` 以支持 React Router 客户端路由
- **优化工作流结构**：参考 `pcode-docs` 项目，添加环境变量和更清晰的配置
- **改进错误处理**：添加 `verbose: true` 以便调试部署问题

**注意**：此修复不影响现有的 GitHub Pages 部署流程（`deploy.yml`）。

## Impact

- **Affected specs**: `deployment`
- **Affected code**:
  - `.github/workflows/azure-static-web-apps-ambitious-moss-03f17d600.yml` (完全重构)
  - `public/staticwebapp.config.json` (新建，用于 SPA 路由支持)
- **Benefits**:
  - Azure Static Web Apps 部署将成功完成
  - 应用将在 Azure Static Web Apps 环境中可访问
  - React Router 客户端路由正常工作（通过 staticwebapp.config.json）
  - 工作流配置更加健壮、安全和易于调试
  - 与项目其他工作流的依赖版本保持一致
- **Risks**: 低风险 - 主要是配置修复，不涉及应用代码变更
- **Testing**: 通过 PR 部署预览验证修复效果，确认后在 main 分支生效

## Status

**Status**: ExecutionCompleted
**Executed By**: Claude Sonnet 4.5
**Execution Date**: 2025-02-05
**Branch**: fix/azure-static-web-apps-deployment
**Commit**: 950f55c
