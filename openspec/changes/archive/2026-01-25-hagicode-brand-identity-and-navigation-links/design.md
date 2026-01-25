# Design: Hagicode 品牌标识和导航链接实现

## 架构概述

本文档描述 Hagicode 品牌标识和官方导航链接的技术实现方案，包括组件架构、状态管理、样式设计和国际化支持。

## 组件架构

### 现有结构
```
src/pages/DockerComposeGenerator.tsx
├── <header>
│   ├── <h1> Title
│   ├── <p> Subtitle
│   └── <div> Controls
│       ├── <ThemeToggle />
│       └── <LanguageSwitcher />
```

### 新结构（推荐）
```
src/pages/DockerComposeGenerator.tsx
├── <header>
│   ├── <div> Brand Section
│   │   ├── <h1> Title (with Hagicode prefix)
│   │   └── <p> Subtitle
│   └── <div> Controls Section
│       ├── <NavigationLinks /> (NEW)
│       ├── <ThemeToggle />
│       └── <LanguageSwitcher />
```

### 组件职责

#### 1. `NavigationLinks` 组件（新增）
**位置**: `src/components/Header/NavigationLinks.tsx`

**职责**:
- 渲染官方资源链接列表
- 处理移动端/桌面端响应式布局
- 管理链接点击事件（新标签页打开）
- 提供工具提示（tooltip）显示完整 URL

**Props**:
```typescript
interface NavigationLinksProps {
  className?: string;
  variant?: 'inline' | 'dropdown';
}
```

**状态**:
- `isMenuOpen`: boolean - 移动端菜单开关状态（仅在 variant='dropdown' 时使用）

## 响应式设计策略

### 断点定义
遵循 Tailwind CSS 默认断点：
- **移动端**: `< 768px` (sm 断点以下)
- **桌面端**: `>= 768px` (sm 断点及以上)

### 布局模式

#### 桌面端（>= 768px）
- 使用内联布局（`flex-row`）
- 所有链接水平排列
- 链接文本完全显示

**样式示例**:
```tsx
<div className="flex items-center gap-4">
  <a href="..." className="flex items-center gap-2 text-sm hover:text-primary">
    <GlobeIcon className="w-4 h-4" />
    <span>官网</span>
  </a>
  <a href="..." className="flex items-center gap-2 text-sm hover:text-primary">
    <GitHubIcon className="w-4 h-4" />
    <span>GitHub</span>
  </a>
  <a href="..." className="flex items-center gap-2 text-sm hover:text-primary">
    <QQIcon className="w-4 h-4" />
    <span>QQ群: 610394020</span>
  </a>
</div>
```

#### 移动端（< 768px）
- 使用汉堡菜单按钮（`HamburgerMenu`）
- 点击后展开下拉菜单显示链接
- 链接垂直排列，带有图标

**样式示例**:
```tsx
<div className="relative">
  <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
    <MenuIcon className="w-5 h-5" />
  </button>
  {isMenuOpen && (
    <div className="absolute right-0 top-8 bg-card border rounded-lg shadow-lg p-2">
      <a href="..." className="flex items-center gap-2 px-3 py-2">
        <GlobeIcon className="w-4 h-4" />
        <span>Hagicode 官网</span>
      </a>
      {/* 其他链接 */}
    </div>
  )}
</div>
```

## 样式设计

### 颜色方案
使用 shadcn/ui 的语义化颜色变量：
- **默认状态**: `text-foreground` 或 `text-muted-foreground`
- **悬停状态**: `text-primary` 或 `hover:text-primary`
- **背景**: `bg-card`（移动端下拉菜单）
- **边框**: `border`（移动端下拉菜单）

### 间距设计
- **链接间距**: `gap-2` 到 `gap-4`（桌面端）
- **内边距**: `px-3 py-2`（移动端菜单项）
- **外边距**: 与现有控件（ThemeToggle、LanguageSwitcher）保持一致，使用 `gap-2`

### 动画效果
- **悬停动画**: `transition-colors duration-200`
- **菜单展开**: `animate-in fade-in slide-in-from-top-2`
- **菜单收起**: `animate-out fade-out slide-out-to-top-2`

## 国际化设计

### 翻译键结构
在现有的 `header` 命名空间下新增 `navigation` 对象：

```json
{
  "header": {
    "title": "Hagicode Docker Compose Builder",
    "subtitle": "Generate Docker Compose configurations for Hagicode",
    "navigation": {
      "officialSite": "Hagicode Official Site",
      "githubRepo": "GitHub Repository",
      "qqGroup": "QQ Group: {groupNumber}",
      "joinQQGroup": "Join QQ Group",
      "copyGroupNumber": "Copy group number",
      "copied": "Copied!"
    }
  }
}
```

### 中文翻译
```json
{
  "header": {
    "title": "Hagicode Docker Compose Builder",
    "subtitle": "为 Hagicode 生成 Docker Compose 配置",
    "navigation": {
      "officialSite": "Hagicode 官网",
      "githubRepo": "GitHub 仓库",
      "qqGroup": "QQ 群：{groupNumber}",
      "joinQQGroup": "加入 QQ 群",
      "copyGroupNumber": "复制群号",
      "copied": "已复制！"
    }
  }
}
```

## 数据流设计

### 链接配置
将链接信息提取为常量，便于维护：

```typescript
// src/config/navigationLinks.ts
export const NAVIGATION_LINKS = {
  officialSite: {
    url: 'https://hagicode-org.github.io/site/',
    labelKey: 'header.navigation.officialSite',
    icon: GlobeIcon,
    external: true,
  },
  githubRepo: {
    url: 'https://github.com/HagiCode-org/site',
    labelKey: 'header.navigation.githubRepo',
    icon: GitHubIcon,
    external: true,
  },
  qqGroup: {
    url: null, // QQ 群无直接链接，显示群号
    labelKey: 'header.navigation.qqGroup',
    icon: QQIcon,
    groupNumber: '610394020',
    action: 'copy', // 特殊动作：复制群号
  },
} as const;
```

### QQ 群复制功能
实现 QQ 群号复制到剪贴板：

```typescript
const handleCopyQQNumber = async () => {
  try {
    await navigator.clipboard.writeText('610394020');
    toast.success(t('header.navigation.copied'));
  } catch (error) {
    toast.error(t('common.error'));
  }
};
```

## 可访问性设计

### ARIA 属性
- 外部链接添加 `aria-label` 和 `rel="noopener noreferrer"`
- 汉堡菜单按钮添加 `aria-expanded` 和 `aria-controls`
- 菜单容器添加 `role="navigation"` 和 `aria-label`

### 键盘导航
- 所有链接支持 Tab 键导航
- 汉堡菜单支持 Enter 键切换
- ESC 键关闭移动端菜单

### 焦点管理
- 菜单打开后焦点移至第一个链接
- 菜单关闭后焦点返回汉堡菜单按钮

## 性能考虑

### 图标优化
- 使用 `lucide-react` 图标库（已在项目中使用）
- 图标组件按需导入，减少包大小

### 代码分割
- `NavigationLinks` 组件可以懒加载（如果需要进一步优化）

### 状态管理
- 移动端菜单状态使用本地 `useState`，无需 Redux
- 避免不必要的重渲染

## 测试策略

### 单元测试
- 测试链接渲染正确性
- 测试响应式布局切换
- 测试 QQ 群号复制功能
- 测试国际化翻译切换

### 视觉回归测试
- 截图测试桌面端布局
- 截图测试移动端布局（展开/收起状态）
- 测试不同语言下的文本长度适配

### 可访问性测试
- 键盘导航测试
- 屏幕阅读器测试
- 颜色对比度测试

## 依赖项

### 新增依赖
- 无需新增外部依赖（使用现有的 `lucide-react` 和 shadcn/ui）

### 现有依赖利用
- `react-i18next`: 国际化
- `lucide-react`: 图标
- `tailwindcss`: 样式
- `sonner`（如果项目中有）: Toast 通知

## 未来扩展性

### 可配置的链接
- 未来可以将链接配置移至配置文件，便于维护
- 支持从环境变量或配置文件读取链接

### 主题化
- 支持自定义链接颜色和样式
- 支持自定义图标

### 分析追踪
- 添加链接点击事件追踪
- 集成 Google Analytics 或其他分析工具

## 风险和缓解措施

### 风险 1: 移动端菜单与页面其他元素重叠
**缓解**: 使用 `z-index` 确保菜单在最上层，添加点击外部关闭功能

### 风险 2: 不同语言下文本长度差异导致布局问题
**缓解**: 使用 `truncate` 类截断过长的文本，使用 tooltip 显示完整文本

### 风险 3: 链接 URL 未来可能变更
**缓解**: 将链接集中配置在 `src/config/navigationLinks.ts`，便于统一修改

### 风险 4: QQ 群功能未来可能变更
**缓解**: 将 QQ 群相关逻辑封装在独立组件中，便于替换实现
