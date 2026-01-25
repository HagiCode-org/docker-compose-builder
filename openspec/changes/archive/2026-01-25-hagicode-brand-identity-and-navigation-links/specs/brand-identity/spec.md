# Spec: Brand Identity

## Overview

本规范定义 Hagicode Docker Compose Builder 站点的品牌标识和官方导航链接功能，确保站点品牌一致性，并为用户提供清晰的官方资源访问路径。

## ADDED Requirements

### Requirement: 站点品牌标题

The site MUST display "Hagicode Docker Compose Builder" as its HTML page title and main header title to reinforce the Hagicode organization brand identity.

#### Scenario: 用户在浏览器中打开站点

**Given** 用户访问 Docker Compose Builder 站点
**When** 页面加载完成
**Then** 浏览器标签页显示标题为 "Hagicode Docker Compose Builder"
**And** 页面头部主标题显示为 "Hagicode Docker Compose Builder"

#### Scenario: 用户切换语言

**Given** 用户在站点中切换语言（中英文）
**When** 语言切换完成
**Then** 标题在两种语言下均显示 "Hagicode Docker Compose Builder"（品牌名称保持一致）

---

### Requirement: 官方资源导航链接

The site MUST provide clear official resource navigation links in the page header, including Hagicode official website, GitHub repository, and QQ group.

#### Scenario: 用户访问 Hagicode 官网

**Given** 用户在页面头部看到导航链接
**When** 用户点击 "Hagicode Official Site" 或 "Hagicode 官网" 链接
**Then** 在新标签页中打开 https://hagicode-org.github.io/site/
**And** 链接带有外部链接图标（↗）指示

#### Scenario: 用户访问 GitHub 仓库

**Given** 用户在页面头部看到导航链接
**When** 用户点击 "GitHub Repository" 或 "GitHub 仓库" 链接
**Then** 在新标签页中打开 https://github.com/HagiCode-org/site
**And** 链接带有外部链接图标（↗）指示

#### Scenario: 用户加入 QQ 群

**Given** 用户在页面头部看到导航链接
**When** 用户点击 "QQ Group: 610394020" 或 "QQ 群：610394020" 按钮
**Then** QQ 群号 "610394020" 复制到剪贴板
**And** 显示复制成功提示（"已复制！" 或 "Copied!"）

---

### Requirement: 响应式导航布局

Navigation links MUST remain usable and accessible across different screen sizes, displaying inline links on desktop and providing a hamburger menu on mobile devices.

#### Scenario: 桌面端用户查看导航链接

**Given** 用户使用桌面设备（屏幕宽度 >= 768px）
**When** 页面加载完成
**Then** 所有导航链接水平排列在页面头部右侧
**And** 链接完全可见，无需额外交互

#### Scenario: 移动端用户查看导航链接

**Given** 用户使用移动设备（屏幕宽度 < 768px）
**When** 页面加载完成
**Then** 显示汉堡菜单按钮（三条横线图标）
**And** 导航链接默认隐藏

#### Scenario: 移动端用户打开导航菜单

**Given** 用户在移动设备上，导航菜单处于关闭状态
**When** 用户点击汉堡菜单按钮
**Then** 显示下拉菜单，包含所有导航链接
**And** 链接垂直排列
**And** 汉堡菜单图标变为关闭图标（×）

#### Scenario: 移动端用户关闭导航菜单

**Given** 用户在移动设备上，导航菜单处于打开状态
**When** 用户执行以下任一操作：
  - 点击关闭图标（×）
  - 点击菜单外部区域
  - 按 ESC 键
**Then** 导航菜单关闭
**And** 恢复显示汉堡菜单按钮

---

### Requirement: 国际化支持

All brand identity and navigation link text MUST support bilingual (Chinese and English) and integrate with the existing internationalization system.

#### Scenario: 英文用户查看导航链接

**Given** 用户将语言设置为 English
**When** 页面加载完成
**Then** 导航链接显示为：
  - "Hagicode Official Site"
  - "GitHub Repository"
  - "QQ Group: 610394020"

#### Scenario: 中文用户查看导航链接

**Given** 用户将语言设置为 中文
**When** 页面加载完成
**Then** 导航链接显示为：
  - "Hagicode 官网"
  - "GitHub 仓库"
  - "QQ 群：610394020"

#### Scenario: 用户切换语言时导航链接更新

**Given** 用户正在查看导航链接
**When** 用户切换语言
**Then** 所有导航链接文本立即更新为新语言
**And** 链接功能和 URL 保持不变

---

### Requirement: 可访问性

Navigation links MUST comply with Web accessibility standards to ensure all users, including those using assistive technologies, can access and use the navigation features.

#### Scenario: 键盘用户导航链接

**Given** 用户使用键盘（Tab 键）导航
**When** 用户按 Tab 键
**Then** 焦点按顺序移动到每个导航链接
**And** 焦点指示器清晰可见
**And** 用户可以按 Enter 键激活链接

#### Scenario: 屏幕阅读器用户访问导航

**Given** 用户使用屏幕阅读器
**When** 焦点移动到导航链接
**Then** 屏幕阅读器朗读链接文本和用途（通过 aria-label）
**And** 外部链接被标识为"在新窗口打开"

#### Scenario: 移动端菜单的可访问性

**Given** 用户使用屏幕阅读器或键盘在移动设备上
**When** 焦点移动到汉堡菜单按钮
**Then** 屏幕阅读器朗读"Toggle navigation menu"（通过 aria-label）
**And** 朗读菜单的当前状态（展开或收起，通过 aria-expanded）

---

### Requirement: 视觉一致性

Navigation link styles and layout MUST remain consistent with the existing page design, using unified project colors, spacing, and interaction effects.

#### Scenario: 用户悬停在导航链接上

**Given** 用户将鼠标悬停在导航链接上
**When** 鼠标悬停状态激活
**Then** 链接颜色变为主题色（`text-primary`）
**And** 颜色过渡平滑（transition duration 200ms）

#### Scenario: 用户查看导航链接布局

**Given** 用户在桌面端查看页面
**When** 页面加载完成
**Then** 导航链接与现有控件（主题切换器、语言切换器）对齐
**And** 间距一致（使用统一的 gap 值）
**And** 字体大小协调（text-sm）

---

## MODIFIED Requirements

### Requirement: Docker Compose Generator 页面头部

The **Docker Compose Generator** page header MUST include the brand title, subtitle, official resource navigation links, and user controls (theme toggle, language switcher).

#### Scenario: 用户查看页面头部

**Given** 用户访问 Docker Compose Builder 站点
**When** 页面加载完成
**Then** 页面头部包含以下元素（从上到下或从左到右）：
  - **品牌标题**："Hagicode Docker Compose Builder"
  - **副标题**：Generate Docker Compose configurations for Hagicode / 为 Hagicode 生成 Docker Compose 配置
  - **导航链接**：Hagicode 官网、GitHub 仓库、QQ 群
  - **用户控件**：主题切换器、语言切换器

#### Scenario: 用户在不同设备上查看头部

**Given** 用户在不同屏幕尺寸的设备上访问站点
**When** 页面加载完成
**Then** 头部布局根据屏幕尺寸自动调整：
  - **桌面端**（>= 768px）：所有元素水平排列或分层显示
  - **移动端**（< 768px）：导航链接折叠到汉堡菜单，其他元素保持可见

---

## Implementation Notes

### 相关文件

- **配置文件**:
  - `src/config/navigationLinks.ts`（新增）：导航链接配置

- **组件**:
  - `src/components/Header/NavigationLinks.tsx`（新增）：导航链接组件
  - `src/pages/DockerComposeGenerator.tsx`（修改）：集成导航链接

- **国际化**:
  - `src/i18n/locales/en-US.json`（修改）：添加英文翻译
  - `src/i18n/locales/zh-CN.json`（修改）：添加中文翻译

- **HTML**:
  - `index.html`（修改）：更新页面标题

### 技术依赖

- `react-i18next`: 国际化
- `lucide-react`: 图标（ExternalLink, Menu, X, Globe, Github）
- `tailwindcss`: 样式
- `sonner`（或项目使用的 toast 库）：Toast 通知

### 样式约定

- **颜色**:
  - 默认: `text-muted-foreground`
  - 悬停: `text-primary` 或 `hover:text-primary`

- **间距**:
  - 桌面端链接间距: `gap-2` 或 `gap-4`
  - 与现有控件间距: `gap-2`

- **响应式断点**:
  - 移动端: `< 768px` (hidden md:)
  - 桌面端: `>= 768px` (md:flex)

### 可访问性要求

- 外部链接必须添加 `rel="noopener noreferrer"` 和 `target="_blank"`
- 汉堡菜单按钮必须添加 `aria-label`、`aria-expanded` 和 `aria-controls`
- 菜单容器必须添加 `role="navigation"` 和 `aria-label`
- 所有交互元素必须支持键盘导航

### 测试策略

- **单元测试**: 测试组件渲染和交互逻辑
- **视觉回归测试**: 测试桌面端和移动端布局
- **可访问性测试**: 键盘导航、屏幕阅读器、颜色对比度
- **国际化测试**: 验证所有语言下的翻译和布局

---

## Cross-References

### Related Capabilities

- **i18n** (国际化): 导航链接翻译依赖于国际化框架
- **theme-switching** (主题切换): 导航链接样式需要适配亮色/暗色主题
- **docker-compose-generator** (Docker Compose 生成器): 导航链接集成到此页面

### Dependencies

- **i18n** 国际化功能必须先实现，以便为导航链接提供翻译支持
- **theme-switching** 主题切换功能确保导航链接在不同主题下的可见性

---

## Version History

- **2026-01-25**: 初始版本，定义品牌标识和导航链接规范
