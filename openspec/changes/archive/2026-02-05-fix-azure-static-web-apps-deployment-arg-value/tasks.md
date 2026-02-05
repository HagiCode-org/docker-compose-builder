# 修复 Azure Static Web Apps 部署配置 - 任务列表

## 1. 分析参考配置
- [ ] 1.1 阅读 `pcode-docs` 项目的 Azure Static Web Apps 工作流配置
- [ ] 1.2 对比两个项目的构建配置差异（`vite.config.ts` 输出目录）
- [ ] 1.3 确认当前项目的构建输出目录为 `dist/` 而非 `build/`
- [ ] 1.4 验证 GitHub Pages 工作流使用的路径配置

## 2. 创建 Azure Static Web Apps 配置文件
- [ ] 2.1 在 `public/` 目录下创建 `staticwebapp.config.json` 文件
- [ ] 2.2 配置 `navigationFallback.rewrite` 为 `"index.html"` 以支持 React Router 客户端路由
- [ ] 2.3 验证配置文件 JSON 格式正确性
- [ ] 2.4 确认构建流程会将 `public/staticwebapp.config.json` 复制到 `dist/` 目录

## 3. 修复 Azure 工作流配置
- [ ] 3.1 更新 `actions/checkout@v3` → `actions/checkout@v4`
- [ ] 3.2 添加显式 Node.js 设置步骤（使用 `actions/setup-node@v4`）
- [ ] 3.3 配置 Node.js 版本为 `20`（与 GitHub Pages 工作流一致）
- [ ] 3.4 添加 `npm ci` 依赖安装步骤
- [ ] 3.5 添加 `npm run build` 构建步骤
- [ ] 3.6 修改 `app_location` 从 `"/"` → `"dist"`
- [ ] 3.7 修改 `output_location` 从 `"build"` → 预留（使用 `skip_app_build: true` 后此参数被忽略）
- [ ] 3.8 添加 `skip_app_build: true` 配置（跳过 Azure 自动构建）
- [ ] 3.9 添加 `verbose: true` 启用详细日志用于调试
- [ ] 3.10 添加环境变量 `NODE_VERSION: '20'`（可选，用于文档说明）

## 4. 优化工作流结构
- [ ] 4.1 为构建步骤添加清晰的注释说明
- [ ] 4.2 保留 OIDC 认证步骤（维持现有安全机制）
- [ ] 4.3 确认 Close Pull Request Job 步骤保持不变
- [ ] 4.4 验证 permissions 配置完整性（`id-token: write`, `contents: read`）

## 5. 验证配置正确性
- [ ] 5.1 确认构建输出目录 `dist/` 与 `vite.config.ts` 中的 `outDir` 配置一致
- [ ] 5.2 确认 `public/staticwebapp.config.json` 被复制到 `dist/` 目录
- [ ] 5.3 确认 GitHub Pages 工作流不受影响（仍使用 `dist/` 路径）
- [ ] 5.4 检查工作流 YAML 语法正确性
- [ ] 5.5 验证所有必需的 secrets 配置（`AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_MOSS_03F17D600`）

## 6. 测试和部署
- [ ] 6.1 创建功能分支提交工作流配置修改和 staticwebapp.config.json
- [ ] 6.2 通过 Pull Request 触发 Azure Static Web Apps 预览部署
- [ ] 6.3 验证预览环境构建和部署成功
- [ ] 6.4 检查 Azure 部署日志确认无错误
- [ ] 6.5 测试预览环境应用功能正常运行
- [ ] 6.6 **测试 React Router 客户端路由**：直接访问非根路径（如 `/generator`），确认返回 `index.html` 而非 404
- [ ] 6.7 合并到 main 分支触发生产环境部署
- [ ] 6.8 验证生产环境部署成功
- [ ] 6.9 验证生产环境客户端路由正常工作

## 依赖关系
- 任务 1 必须首先完成，为后续修改提供依据
- 任务 2 和 3 可以并行执行（配置文件创建和工作流配置修改）
- 任务 4 必须在任务 2、3 完成后执行
- 任务 5 必须在任务 4 完成后执行
- 任务 6 必须在任务 5 完成后执行

## 可交付成果
- 新建的 `public/staticwebapp.config.json` 配置文件
- 更新后的 `.github/workflows/azure-static-web-apps-ambitious-moss-03f17d600.yml`
- 成功部署到 Azure Static Web Apps 的应用
- 验证通过的部署测试记录（包括客户端路由测试）

## 回滚计划
如果修复后部署失败：
1. 检查 Azure 部署日志中的具体错误信息
2. 验证 `dist/` 目录是否正确生成
3. 验证 `dist/staticwebapp.config.json` 是否存在
4. 确认 Node.js 版本和依赖安装是否成功
5. 如需回滚，删除 `public/staticwebapp.config.json` 并恢复原始工作流配置文件

## staticwebapp.config.json 配置说明
此文件是 Azure Static Web Apps 的必需配置，用于处理单页应用（SPA）的客户端路由：

```json
{
  "navigationFallback": {
    "rewrite": "index.html"
  }
}
```

**作用**：
- 当用户访问任何路径（如 `/generator`、`/about`）时
- 如果该路径不是实际文件（如 .js、.css、图片等）
- Azure Static Web Apps 将返回 `index.html`
- React Router 接管后渲染正确的组件

**重要性**：
- 没有此配置，直接访问非根路径将返回 404
- 刷新页面时客户端路由会失效
- 与 GitHub Pages 的 404 重定向机制类似
