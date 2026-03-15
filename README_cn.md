# Docker Compose 构建器

[English](./README.md)

一个为 HagiCode 构建的现代化 Docker Compose 配置生成器，使用 React + TypeScript + Vite + shadcn/ui。

## 功能特性

- **交互式配置表单**：分步配置，实时验证
- **Docker Compose YAML 生成**：根据用户输入自动生成 YAML 文件
- **多种数据库选项**：支持内置 PostgreSQL 或外部数据库连接
- **显式执行器配置**：并行启用 Claude/Codex/Copilot CLI/CodeBuddy/IFlow/OpenCode，无需默认 provider 路由
- **Copilot CLI 支持**：可选的 `copilot-cli` 执行器支持，标准 HagiCode 镜像标签固定为 `0`
- **局域网 HTTPS 支持**：可选的 Caddy 反向代理，使用 `tls internal`
- **卷管理**：配置数据持久化的卷挂载
- **用户权限**：Linux 用户权限映射（PUID/PGID）支持
- **响应式设计**：在桌面和移动设备上都能正常工作
- **本地存储持久化**：配置保存到 localStorage，方便使用
- **一键复制/下载**：将生成的 YAML 复制到剪贴板或下载为文件
- **Caddyfile 复制工作流**：预览和复制 Caddyfile（无需文件下载）
- **SEO 优化**：完整的搜索引擎优化，包括 meta 标签、Open Graph、Twitter Cards 和结构化数据
- **多语言支持**：国际化（i18n），支持英文和中文

## 快速开始

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

应用程序可在 `http://localhost:5174` 访问

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

### 部署到 GitHub Pages

#### 自动部署（GitHub Actions）

项目配置了 GitHub Actions，当代码推送到 `main` 分支时自动部署到 GitHub Pages。

#### 手动部署

```bash
npm run deploy
```

这将构建应用程序并部署到 `gh-pages` 分支。

### GitHub Pages 配置

1. 确保您的仓库已启用 GitHub Pages：
   - 转到仓库设置
   - 导航到 "Pages" 部分
   - 在 "Build and deployment" 下，选择 "Deploy from a branch"
   - 选择 "gh-pages" 分支和 "/ (root)" 文件夹
   - 点击 "Save"

2. 应用程序将在以下地址可用：
   `https://<your-username>.github.io/docker-compose-builder/`

### 部署故障排除

- **404 错误**：确保 GitHub Pages 正确配置且 `gh-pages` 分支存在
- **资源未加载**：检查 `vite.config.ts` 是否有正确的 `base` 配置
- **构建失败**：使用 `npm ci` 验证依赖是否正确安装
- **权限**：确保 GitHub Actions 工作流具有必要的权限

### 配置选项

#### 基本设置
- **HTTP 端口**：应用程序监听的端口
- **容器名称**：Docker 容器名称
- **镜像标签**：要使用的 Docker 镜像标签
- **主机操作系统**：目标操作系统（Windows/Linux）
- **镜像 Registry**：Docker 镜像 Registry（Docker Hub/Azure ACR）

#### 数据库
- **内置 PostgreSQL**：内置 PostgreSQL 服务
- **外部数据库**：连接到外部 PostgreSQL 实例
- **卷类型**：命名卷或绑定挂载用于数据存储

#### 许可证
- **公共测试密钥**：默认公共测试许可证
- **自定义许可证密钥**：使用您自己的许可证密钥

#### 执行器 & API 配置

- **并行启用**：Claude、Codex、Copilot CLI、CodeBuddy、IFlow CLI 和 OpenCode 可以一起启用（非互斥）
- **仅显式选择**：生成的 YAML 仅导出启用的执行器分支；不再写入 `AI__Providers__DefaultProvider`
- **能力 vs 路由**：启用一个执行器不会禁用其他执行器，运行时选择现在必须是显式的

##### 显式执行器矩阵

| 执行器 | 表单字段 | 验证 | 导出行为 |
|----------|-------------|------------|-----------------|
| Claude | Provider 预设、令牌、可选自定义端点 | 需要令牌；自定义预设也需要端点 URL | 为启用的 Claude 分支发出 `ANTHROPIC_*` 变量 |
| Codex | `CODEX_API_KEY`、可选 `CODEX_BASE_URL` | 启用时需要 `CODEX_API_KEY` | 仅发出 `CODEX_*` 变量 |
| Copilot CLI | `COPILOT_API_KEY`、可选 `COPILOT_BASE_URL`、标准镜像标签 `0`、工作区切换 | 启用时需要 API 密钥 | 发出 `COPILOT_*` 变量和可选边车服务，不更改标准 HagiCode 镜像标签 |
| CodeBuddy | `CODEBUDDY_API_KEY`、`CODEBUDDY_INTERNET_ENVIRONMENT` | 启用时需要 API 密钥；网络环境默认为 `ioa` 但仍可编辑 | 发出显式 CodeBuddy provider/platform 密钥加上 `CODEBUDDY_*` 变量 |
| IFlow CLI | 仅信息分支 | 不需要发明的私有 `IFLOW_*` 字段 | 发出显式 IFlow provider/platform 引导密钥，并期望先前的 CLI 登录或挂载的运行时状态 |
| OpenCode | 可选托管运行时模型 | 除了正常部署验证外不需要额外必填字段 | 发出显式 OpenCode provider 注册加上 `AI__OpenCode__*` 托管运行时密钥 |

##### Copilot CLI 运行时说明

- **模板 ID**：`copilot-cli`（为显式模板流程保留）
- **必需环境**：`COPILOT_API_KEY`
- **标准标签合约**：标准 HagiCode 镜像标签保持固定在 `0`
- **可选环境**：`COPILOT_BASE_URL`
- **工作区挂载**：可选的绑定挂载到 `/workspace`

发布索引元数据仍可用于兼容性检查和未来显式 Copilot 模板流程。标准构建器默认值和刷新路径将 `imageTag` 保持在 `0`。

##### CodeBuddy、IFlow 和 OpenCode 说明

- CodeBuddy 导出现在依赖于显式 provider/platform 注册，而不是已移除的默认 provider 路由。提供 `CODEBUDDY_API_KEY`，并使 `CODEBUDDY_INTERNET_ENVIRONMENT` 与您的 CLI 登录上下文保持一致。
- IFlow 导出保持为文档化的引导合约 `iflow --experimental-acp --port {port}`。构建器故意不发明的额外 `IFLOW_*` 变量；您仍然需要先前的 `iflow` 登录或等效的挂载运行时状态。
- OpenCode 导出使用统一镜像中已文档化的托管运行时合约。构建器显式发出 `AI__OpenCode__*` 设置，不依赖回退默认执行器。

应用程序从 docs 仓库 `https://docs.hagicode.com/presets/claude-code/providers/` 动态加载 provider 配置。可用的 provider 包括：

- **Anthropic Official**：官方 Anthropic API
- **Zhipu AI (ZAI)**：具有 Anthropic 兼容 API 的中国 AI provider
- **阿里云 DashScope**：阿里云的 AI 服务，具有 Anthropic 兼容 API
- **MiniMax**：具有 Anthropic 兼容 API 的 MiniMax AI 服务
- **Custom**：具有 Anthropic 兼容接口的自定义 API 端点

##### Provider 配置回退

应用程序使用三层回退策略获取 provider 配置：

1. **主要**：从 docs 仓库获取（`https://docs.hagicode.com/presets/claude-code/providers/`）
2. **回退**：使用嵌入式备份配置（包含在代码中）
3. **遗留**：使用硬编码常量（为向后兼容）

这确保应用程序始终可用，即使 docs 仓库暂时不可用。

##### 环境变量覆盖

对于本地开发，您可以覆盖 docs 仓库 URL：

```bash
# 覆盖以使用本地 docs 仓库
VITE_PRESETS_BASE_URL=http://localhost:3000 npm run dev

# 或指定不同的远程 URL
VITE_PRESETS_BASE_URL=https://your-custom-docs-url.com npm run dev
```

默认值为 `https://docs.hagicode.com`。

您还可以覆盖用于 Copilot 模板默认值的发布索引 URL：

```bash
VITE_RELEASE_INDEX_URL=https://your-release-index-url/index.json npm run dev
```

##### 嵌入式备份同步

嵌入式备份配置（`src/lib/docker-compose/providerConfigLoader.ts`）与 docs 仓库预设同步。当在 docs 仓库中添加新 provider 或更新现有 provider 时，更新 `EMBEDDED_BACKUP` 常量以包含最新数据。

#### 卷挂载
- **工作目录**：您的代码仓库路径
- **根用户警告**：检测并警告 root 拥有的目录
- **用户权限映射**：Linux 的 PUID/PGID 配置
- **Copilot 工作区切换**：Copilot CLI 服务块的可选 `/workspace` 挂载

#### HTTPS（仅完整自定义模式）
- **启用 HTTPS 代理**：切换 Caddy 反向代理生成
- **HTTPS 端口**：默认 `443`，支持自定义端口
- **局域网 IP 地址**：用于生成的 Caddy 监听器
- **Caddyfile 预览 + 复制**：复制内容并保存为 `Caddyfile`，与 `docker-compose.yml` 并列
- **指南**：参见 `docs/https-certificate-guide.md`

## 生成的 Docker Compose 文件

生成器创建完整的 `docker-compose.yml` 文件，包括：
- HagiCode 应用程序服务
- PostgreSQL 服务（如果选择内置数据库）
- 网络配置
- 卷定义
- 健康检查配置
- 环境变量
- Copilot CLI 服务块（当启用 `copilot-cli` 执行器时）
- 当这些能力启用时，显式的 CodeBuddy、IFlow 和 OpenCode 执行器分支

## 分析配置

应用程序集成了两个分析平台，用于全面的用户行为追踪：

### Microsoft Clarity

- **用途**：用户行为分析，包括热图、会话录制和用户旅程
- **项目 ID**：`v6zgmrg1q7`
- **环境**：仅生产环境
- **实现**：通过 `src/services/clarityService.ts` 的单例服务模式

### 百度统计

- **用途**：针对中国用户的网络分析，跟踪页面浏览量、流量来源和用户行为
- **分析 ID**：`26c9739b2f3cddbe36c649e0823ee2de`（默认）
- **环境**：仅生产环境
- **实现**：直接在 `index.html` 中嵌入脚本

### 配置

分析 ID 可以通过环境变量配置：

```bash
# 用于本地构建
VITE_BAIDU_ANALYTICS_ID=your_analytics_id npm run build

# 用于 GitHub Actions（在仓库 secrets 中配置）
BAIDU_ANALYTICS_ID=26c9739b2f3cddbe36c649e0823ee2de
```

**默认分析 ID**：
- builder.hagicode.com: `26c9739b2f3cddbe36c649e0823ee2de`
- docs.hagicode.com: `04ac03637b01a1f4cc0bdfa376387fe5`
- hagicode.com: `43081dabdf7dd7249f20795e76c2f017`

### 验证

在生产环境中验证分析集成：

1. 打开浏览器 DevTools（F12）
2. 转到 Network 面板
3. 检查以下请求：
   - `https://hm.baidu.com/hm.js?`（百度统计）
4. 验证 Clarity 正在 Clarity Dashboard 中记录会话

## 技术栈

- **React 18** 配合 TypeScript
- **Vite** - 构建工具和开发服务器
- **shadcn/ui** - 组件库
- **Tailwind CSS** - 样式
- **Radix UI** - 无头 UI 原语
- **Redux Toolkit** - 状态管理
- **Sonner** - Toast 通知
- **React Syntax Highlighter** - 代码高亮

## 项目结构

```
src/
├── components/
│   ├── ui/              # shadcn/ui 组件
│   └── docker-compose/  # Docker Compose 特定组件
├── lib/
│   ├── docker-compose/  # 类型定义、工具和状态管理
│   └── store.ts         # Redux store 配置
├── pages/               # 主页面组件
└── hooks/               # 自定义 React hooks
```

## 浏览器支持

- Chrome/Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）

## SEO 配置

## Copilot 故障排除

有关常见 Copilot 模板问题（元数据获取失败、无效镜像标签、缺少环境变量），请参阅：

- `docs/copilot-cli-troubleshooting.md`

应用程序包含全面的 SEO（搜索引擎优化）功能：

### 功能特性

- **Meta 标签**：完整的 HTML meta 标签，包括标题、描述、关键词
- **Open Graph**：在 Facebook、LinkedIn 等平台上增强的社交媒体分享
- **Twitter Cards**：在 Twitter 上分享时优化的卡片显示
- **结构化数据**：WebApplication、SoftwareApplication 和 Organization 的 JSON-LD Schema.org 标记
- **站点地图**：用于搜索引擎爬虫的 XML 站点地图（`/sitemap.xml`）
- **Robots.txt**：搜索引擎爬虫配置（`/robots.txt`）
- **规范 URL**：防止重复内容问题
- **Hreflang 标签**：多语言 SEO 支持

### 自定义

SEO 配置集中在 `src/config/seo.ts`。您可以自定义：

- 网站标题和描述
- 关键词
- 社交媒体图片
- 默认语言环境和替代语言
- 组织信息

### 动态 SEO 更新

可以使用 `src/lib/seo/utils.ts` 中的工具函数动态更新 SEO 标签：

```typescript
import { updateSEO } from './lib/seo/utils';

// 更新特定页面的 SEO
updateSEO({
  title: '自定义页面标题',
  description: '自定义描述',
  image: '/custom-image.png'
});
```

### 验证工具

使用这些在线工具测试您的 SEO 实现：

- **Google Lighthouse**：内置于 Chrome DevTools - 测试 SEO 性能
- **Facebook Sharing Debugger**：https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**：https://cards-dev.twitter.com/validator
- **Google Rich Results Test**：https://search.google.com/test/rich-results
- **Schema Markup Validator**：https://validator.schema.org/

### 添加自定义 Open Graph 图片

添加自定义 OG 图片：

1. 在 `public/og-image.png` 创建图片（推荐尺寸：1200x630px）
2. 更新 `src/config/seo.ts` 中的 `image` 属性

## 许可证

MIT
