## ADDED Requirements

### Requirement: Azure Static Web Apps 自动部署

系统 SHALL 支持通过 GitHub Actions 实现代码推送后的自动构建和部署到 Azure Static Web Apps。

#### Scenario: 代码推送触发自动部署
- **WHEN** 用户将代码推送到 main 分支或创建 Pull Request
- **THEN** GitHub Actions 自动触发构建流程
- **AND** 执行显式的 Node.js 环境设置和依赖安装
- **AND** 执行 Vite 生产构建生成 `dist/` 目录
- **AND** 构建成功后自动部署到 Azure Static Web Apps
- **AND** 提供部署状态反馈

#### Scenario: Pull Request 预览部署
- **WHEN** 用户创建或更新 Pull Request
- **THEN** GitHub Actions 触发预览环境构建和部署
- **AND** 生成唯一的预览环境 URL
- **AND** 在 PR 中显示部署状态和预览链接

#### Scenario: 部署失败通知
- **WHEN** 部署过程中发生错误
- **THEN** GitHub Actions 显示失败状态
- **AND** 启用详细日志模式 (`verbose: true`) 提供错误详情
- **AND** 提供错误日志和调试信息

#### Scenario: 手动构建流程
- **WHEN** Azure Static Web Apps 工作流执行
- **THEN** 使用 `skip_app_build: true` 跳过 Azure 平台自动构建
- **AND** 工作流显式执行 `npm ci` 和 `npm run build`
- **AND** 将 `app_location` 指向构建输出目录 `dist/`
- **AND** 确保部署的是最新构建产物

#### Scenario: SPA 客户端路由支持
- **WHEN** 应用部署到 Azure Static Web Apps
- **THEN** 系统包含 `public/staticwebapp.config.json` 配置文件
- **AND** 配置文件设置 `navigationFallback.rewrite` 为 `"index.html"`
- **AND** 构建流程将配置文件复制到 `dist/staticwebapp.config.json`
- **AND** 用户直接访问任何路径（如 `/generator`）时返回 `index.html`
- **AND** React Router 正确处理客户端路由导航

## MODIFIED Requirements

### Requirement: 构建配置优化

系统 SHALL 优化生产环境构建配置，确保构建产物符合多平台部署要求（GitHub Pages 和 Azure Static Web Apps）。

#### Scenario: 构建输出目录统一
- **WHEN** 执行生产构建（`npm run build`）
- **THEN** Vite 配置将输出目录设置为 `dist/`
- **AND** GitHub Pages 工作流从 `dist/` 读取构建产物
- **AND** Azure Static Web Apps 工作流从 `dist/` 读取构建产物
- **AND** 两个平台使用相同的构建配置

#### Scenario: GitHub Actions 版本统一
- **WHEN** 任何 GitHub Actions 工作流执行
- **THEN** 所有工作流使用 `actions/checkout@v4`
- **AND** 所有工作流使用 `actions/setup-node@v4`
- **AND** Node.js 版本统一配置为 `20`
- **AND** 依赖缓存策略一致使用 `cache: "npm"`

#### Scenario: 构建产物结构
- **WHEN** 执行生产构建
- **THEN** 生成符合部署平台要求的目录结构
- **AND** 构建产物可直接部署到 GitHub Pages 或 Azure Static Web Apps
- **AND** 包含所有必需的静态资源（HTML、CSS、JS、字体等）
- **AND** 包含 Azure Static Web Apps 配置文件 `staticwebapp.config.json`
