# Docker Compose 构建器

[English](./README.md)

一个为 HagiCode 构建的现代化 Docker Compose 配置生成器，使用 React + TypeScript + Vite + shadcn/ui。

## 功能特性

- **交互式配置表单**：分步配置，实时验证
- **Docker Compose YAML 生成**：根据用户输入自动生成 YAML 文件
- **多种数据库选项**：支持内置 PostgreSQL 或外部数据库连接
- **显式执行器配置**：并行启用 Claude/Codex/OpenCode，无需默认 provider 路由
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

安装前请使用 Node.js `^20.19.0 || >=22.12.0`。这个要求同时适用于 `npm run dev`、`npm run build` 和 `npm test`。

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

### 推荐验证

依赖升级后。或 CI 运行时变更后。建议执行：

```bash
npm run build
npm test
npm run dev
```

预期行为：

- `npm run build` 完成 TypeScript 编译。并输出到 `dist/`
- `npm test` 完成全部 Vitest 用例。包含快照校验
- `npm run dev` 成功启动 Vite 8 开发服务器。并可在 `http://localhost:5174` 访问

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

- **并行启用**：Claude、Codex 与 OpenCode 可以一起启用（非互斥）
- **仅显式选择**：生成的 YAML 仅导出启用的执行器分支；不再写入 `AI__Providers__DefaultProvider`
- **能力 vs 路由**：启用一个执行器不会禁用其他执行器，运行时选择现在必须是显式的

##### 保留的集成执行器矩阵

| 执行器 | 表单字段 | 验证 | 导出行为 |
|----------|-------------|------------|-----------------|
| Claude | Provider 预设、令牌、可选自定义端点 | 需要令牌；自定义预设也需要端点 URL | 为启用的 Claude 分支发出 `ANTHROPIC_*` 变量 |
| Codex | `CODEX_API_KEY`、可选 `CODEX_BASE_URL` | 启用时需要 `CODEX_API_KEY` | 仅发出 `CODEX_*` 变量 |
| OpenCode | 可选托管运行时模型、配置来源切换、宿主机 `opencode.json` 路径，外加可选的 `auth.json` / `models.json` 路径 | `default-managed` 无需额外字段；`host-file` 需要 `opencode.json` 绝对路径，`auth.json` / `models.json` 若填写也必须是与所选宿主机系统匹配的绝对 `.json` 路径 | 发出显式 OpenCode provider 注册加上 `AI__OpenCode__*` 托管运行时密钥，并根据模式挂载三个默认卷，或在 `host-file` 模式下挂载 `opencode.json` 并按需追加 `auth.json` / `models.json` |

##### 其他 CLI 工具

HagiCode 也支持其他 CLI 工具，但它们的容器集成说明文档目前还不完整。

- 容器配置相关 PR 请提交到 `https://github.com/HagiCode-org/docker-compose-builder`
- 发布与运行时契约相关 PR 请提交到 `https://github.com/HagiCode-org/releases`

##### OpenCode 说明

- OpenCode 导出使用统一镜像中已文档化的托管运行时合约。构建器显式发出 `AI__OpenCode__*` 设置，不依赖回退默认执行器。
- 容器内的 OpenCode 运行用户固定为 `hagicode`。因此文档里的容器路径都以 `/home/hagicode/` 为前缀，而不是宿主机上的 `~`。
- OpenCode 在容器内始终使用固定目标路径 `/home/hagicode/.config/opencode/opencode.json`。推荐的 `default-managed` 模式会自动挂载三个命名卷：`opencode-config-data:/home/hagicode/.config/opencode`、`opencode-auth-data:/home/hagicode/.local/share/opencode`、`opencode-models-data:/home/hagicode/.cache/opencode`，让配置、认证状态和模型缓存一起保留。
- 如果切换到 `host-file` 模式，请手动填写宿主机绝对路径，例如 `/srv/opencode/opencode.json` 或 `C:\\opencode\\opencode.json`。浏览器无法替您发现 Docker 可用的宿主机 bind mount 路径，因此导出的 compose 会原样使用手工输入的路径。
- `host-file` 模式现在支持三类宿主机文件映射：`opencode.json`、`auth.json`、`models.json`。其中配置文件路径必填；认证文件和模型缓存路径按需填写，留空时不会输出对应挂载。

##### OpenCode 默认路径映射

下表使用 OpenCode 在 macOS/Linux 上的默认 XDG 目录来说明宿主机路径，并给出统一镜像内 `hagicode` 用户可直接读取的容器目标路径：

| 文件 | 默认宿主机路径（macOS/Linux） | 容器内 `hagicode` 路径 | 说明 |
|------|------------------------------|------------------------|------|
| `opencode.json` | `~/.config/opencode/opencode.json` | `/home/hagicode/.config/opencode/opencode.json` | Builder 会管理；在 `host-file` 模式下也会绑定这个文件 |
| `auth.json` | `~/.local/share/opencode/auth.json` | `/home/hagicode/.local/share/opencode/auth.json` | 可在 `host-file` 模式下显式绑定；否则需要你自行迁移 |
| `models.json` | `~/.cache/opencode/models.json` | `/home/hagicode/.cache/opencode/models.json` | 可在 `host-file` 模式下显式绑定；留空则不挂载 |

##### `auth.json` 手动迁移步骤

`opencode.json` 的持久化成功，并不代表认证状态已经一起进入容器。若你要复用宿主机上已经登录过的 OpenCode，请按下面步骤处理：

1. 在宿主机定位现有的 `auth.json`，默认路径通常是 `~/.local/share/opencode/auth.json`。
2. 如果你使用 Builder 的 `host-file` 模式，请把这个宿主机绝对路径填写到 `auth.json` 映射字段；如果不用该字段，也可以继续通过你自己的 bind mount、预置文件或镜像初始化步骤来准备 `/home/hagicode/.local/share/opencode/auth.json`。
3. 如需复用模型缓存，也可以同样提供 `models.json` 的宿主机绝对路径，让 Builder 额外挂载到 `/home/hagicode/.cache/opencode/models.json`。
4. 确保目标文件与父目录对容器内 `hagicode` 用户可读。
5. 再导出并启动 compose。Builder 只会使用你显式填写的宿主机路径进行绑定，不会自动发现、复制或迁移这些文件。

##### 默认 CLI 持久化卷

所有托管 CLI 卷都只会在对应保留执行器启用时输出；如果某个卷没有出现在服务挂载列表中，它也不会出现在顶层 `volumes:` 段。

| 执行器 | 默认卷名 | 容器内路径 | 覆盖规则 |
|----------|----------|------------|----------|
| Claude | `claude-data` | `/home/hagicode/.claude` | 无；仅在启用 Claude 时输出 |
| Codex | `codex-data` | `/home/hagicode/.codex` | 无 |
| OpenCode Config | `opencode-config-data` | `/home/hagicode/.config/opencode` | `host-file` 模式会将该托管卷替换为 `<configHostPath>:/home/hagicode/.config/opencode/opencode.json` |
| OpenCode Auth | `opencode-auth-data` | `/home/hagicode/.local/share/opencode` | `host-file` 模式下若填写 `auth.json` 路径，则改为文件挂载到 `/home/hagicode/.local/share/opencode/auth.json` |
| OpenCode Models | `opencode-models-data` | `/home/hagicode/.cache/opencode` | `host-file` 模式下若填写 `models.json` 路径，则改为文件挂载到 `/home/hagicode/.cache/opencode/models.json` |

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

##### 嵌入式备份同步

嵌入式备份配置（`src/lib/docker-compose/providerConfigLoader.ts`）与 docs 仓库预设同步。当在 docs 仓库中添加新 provider 或更新现有 provider 时，更新 `EMBEDDED_BACKUP` 常量以包含最新数据。

#### 卷挂载
- **工作目录**：您的代码仓库路径
- **根用户警告**：检测并警告 root 拥有的目录
- **用户权限映射**：Linux 的 PUID/PGID 配置

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
- 当这些能力启用时，显式的 Claude、Codex 和 OpenCode 执行器分支

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

- **React 19.2.0** 配合 TypeScript
- **Vite 8** - 构建工具和开发服务器
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
