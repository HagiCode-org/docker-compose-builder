# Tasks: Hagicode 品牌标识和导航链接实现

## 实施顺序

本任务列表按照逻辑依赖关系排序，确保每一步都建立在前一步的基础上，并提供可验证的用户可见进度。

---

## Phase 1: 基础品牌标识更新

### ✅ Task 1.1: 更新 HTML 页面标题
**文件**: `index.html`

**变更**:
- 将 `<title>` 标签内容从 "vite-app" 更改为 "Hagicode Docker Compose Builder"

**验证**:
- 在浏览器中打开页面，检查浏览器标签页标题是否显示为 "Hagicode Docker Compose Builder"

**依赖**: 无

**预计时间**: 1 分钟

---

### ✅ Task 1.2: 更新国际化文件中的标题
**文件**:
- `src/i18n/locales/en-US.json`
- `src/i18n/locales/zh-CN.json`

**变更**:
- 将 `header.title` 从 "Docker Compose Builder" 更改为 "Hagicode Docker Compose Builder"

**示例**:
```json
{
  "header": {
    "title": "Hagicode Docker Compose Builder",
    ...
  }
}
```

**验证**:
- 刷新页面，检查页面头部标题是否显示为 "Hagicode Docker Compose Builder"
- 切换语言，确认中英文标题均正确显示

**依赖**: Task 1.1

**预计时间**: 2 分钟

---

## Phase 2: 国际化翻译键添加

### ✅ Task 2.1: 添加英文导航链接翻译
**文件**: `src/i18n/locales/en-US.json`

**变更**:
在 `header` 对象中新增 `navigation` 对象：

```json
{
  "header": {
    ...existing keys,
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

**验证**:
- JSON 格式验证通过（无语法错误）
- 翻译键路径正确：`header.navigation.officialSite`

**依赖**: Task 1.2

**预计时间**: 3 分钟

---

### ✅ Task 2.2: 添加中文导航链接翻译
**文件**: `src/i18n/locales/zh-CN.json`

**变更**:
在 `header` 对象中新增 `navigation` 对象：

```json
{
  "header": {
    ...existing keys,
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

**验证**:
- JSON 格式验证通过
- 与英文翻译键保持一致的结构

**依赖**: Task 2.1

**预计时间**: 3 分钟

---

## Phase 3: 导航链接配置

### ✅ Task 3.1: 创建导航链接配置文件
**文件**: `src/config/navigationLinks.ts`（新建）

**变更**:
创建导航链接配置常量：

```typescript
import { Globe, Github } from 'lucide-react';

export const NAVIGATION_LINKS = {
  officialSite: {
    url: 'https://hagicode-org.github.io/site/',
    labelKey: 'header.navigation.officialSite',
    icon: Globe,
    external: true,
  },
  githubRepo: {
    url: 'https://github.com/HagiCode-org/site',
    labelKey: 'header.navigation.githubRepo',
    icon: Github,
    external: true,
  },
  qqGroup: {
    url: null,
    labelKey: 'header.navigation.qqGroup',
    icon: null, // 需要自定义 QQ 图标或使用通用图标
    groupNumber: '610394020',
    action: 'copy',
  },
} as const;
```

**验证**:
- TypeScript 类型检查通过
- 导入语句正确（图标组件存在）

**依赖**: Task 2.2

**预计时间**: 5 分钟

---

## Phase 4: 导航链接组件开发

### ✅ Task 4.1: 创建 NavigationLinks 组件（桌面端）
**文件**: `src/components/Header/NavigationLinks.tsx`（新建）

**变更**:
创建导航链接组件，支持桌面端内联布局：

```typescript
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAVIGATION_LINKS } from '@/config/navigationLinks';

export function NavigationLinks({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  const handleCopyQQNumber = async () => {
    try {
      await navigator.clipboard.writeText(NAVIGATION_LINKS.qqGroup.groupNumber);
      // TODO: 显示 toast 通知（Task 4.3）
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <nav className={`hidden md:flex items-center gap-2 ${className}`}>
      {/* 官网链接 */}
      <a
        href={NAVIGATION_LINKS.officialSite.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        <span>{t(NAVIGATION_LINKS.officialSite.labelKey)}</span>
      </a>

      {/* GitHub 链接 */}
      <a
        href={NAVIGATION_LINKS.githubRepo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        <span>{t(NAVIGATION_LINKS.githubRepo.labelKey)}</span>
      </a>

      {/* QQ 群 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyQQNumber}
        className="text-sm"
      >
        <span>{t(NAVIGATION_LINKS.qqGroup.labelKey, { groupNumber: NAVIGATION_LINKS.qqGroup.groupNumber })}</span>
      </Button>
    </nav>
  );
}
```

**验证**:
- 组件成功渲染，无 TypeScript 错误
- 链接文本正确显示（中英文）
- 链接点击在新标签页打开
- QQ 群按钮点击后群号复制到剪贴板

**依赖**: Task 3.1

**预计时间**: 15 分钟

---

### ✅ Task 4.2: 添加移动端响应式支持
**文件**: `src/components/Header/NavigationLinks.tsx`

**变更**:
添加移动端汉堡菜单和下拉菜单：

```typescript
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 在组件内部添加状态
const [isMenuOpen, setIsMenuOpen] = useState(false);

// 在返回的 JSX 中添加移动端菜单
return (
  <>
    {/* 桌面端导航 */}
    <nav className={`hidden md:flex items-center gap-2 ${className}`}>
      {/* ... 现有链接 ... */}
    </nav>

    {/* 移动端汉堡菜单按钮 */}
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* 移动端下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute right-4 top-16 bg-card border rounded-lg shadow-lg p-2 z-50">
          <a
            href={NAVIGATION_LINKS.officialSite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{t(NAVIGATION_LINKS.officialSite.labelKey)}</span>
          </a>
          {/* 其他链接 */}
        </div>
      )}
    </div>
  </>
);
```

**验证**:
- 在移动端视口（< 768px）下，显示汉堡菜单按钮
- 点击按钮展开/收起菜单
- 菜单链接垂直排列且可点击
- 点击菜单外部或 ESC 键关闭菜单

**依赖**: Task 4.1

**预计时间**: 20 分钟

---

### ✅ Task 4.3: 添加 Toast 通知
**文件**: `src/components/Header/NavigationLinks.tsx`

**变更**:
集成 Toast 通知以提供复制成功的反馈：

```typescript
import { toast } from 'sonner'; // 或项目使用的 toast 库

// 更新 handleCopyQQNumber 函数
const handleCopyQQNumber = async () => {
  try {
    await navigator.clipboard.writeText(NAVIGATION_LINKS.qqGroup.groupNumber);
    toast.success(t('header.navigation.copied'));
  } catch (error) {
    toast.error(t('common.error'));
  }
};
```

**验证**:
- 点击 QQ 群按钮后，显示"已复制！"或"Copied!"提示
- 复制失败时显示错误提示

**依赖**: Task 4.2

**预计时间**: 5 分钟

---

## Phase 5: 集成到主页面

### ✅ Task 5.1: 在 DockerComposeGenerator 中导入并使用 NavigationLinks
**文件**: `src/pages/DockerComposeGenerator.tsx`

**变更**:
在 header 区域添加 NavigationLinks 组件：

```typescript
import { NavigationLinks } from '@/components/Header/NavigationLinks';

// 在 header 中添加组件
<header className="border-b bg-card">
  <div className="container mx-auto px-4 py-4">
    {/* 第一行：标题和导航链接 */}
    <div className="flex justify-between items-center mb-2">
      <div>
        <h1 className="text-2xl font-bold">{t('header.title')}</h1>
      </div>
      <NavigationLinks />
    </div>

    {/* 第二行：副标题和控件 */}
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">
        {t('header.subtitle')}
      </p>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </div>
  </div>
</header>
```

**验证**:
- 导航链接显示在页面右上角
- 布局与标题和控件协调一致
- 响应式布局正常工作（桌面端/移动端）

**依赖**: Task 4.3

**预计时间**: 10 分钟

---

## Phase 6: 样式优化和响应式调整

### ✅ Task 6.1: 优化桌面端布局
**文件**: `src/pages/DockerComposeGenerator.tsx` 和 `src/components/Header/NavigationLinks.tsx`

**变更**:
调整间距、对齐和视觉效果：

- 确保链接与现有控件（ThemeToggle、LanguageSwitcher）对齐
- 调整链接间距（`gap-2` 或 `gap-4`）
- 统一按钮样式和悬停效果
- 添加外部链接图标（`ExternalLink`）

**验证**:
- 视觉上与现有设计保持一致
- 悬停效果流畅
- 间距和大小协调

**依赖**: Task 5.1

**预计时间**: 10 分钟

---

### ✅ Task 6.2: 优化移动端体验
**文件**: `src/components/Header/NavigationLinks.tsx`

**变更**:
改进移动端交互：

- 添加点击外部关闭菜单功能
- 添加 ESC 键关闭菜单功能
- 优化菜单动画（展开/收起）
- 调整菜单位置避免遮挡内容

**验证**:
- 在真实移动设备或移动模拟器中测试
- 菜单交互流畅
- 无遮挡或滚动问题

**依赖**: Task 6.1

**预计时间**: 15 分钟

---

## Phase 7: 测试和验证

### ✅ Task 7.1: 跨浏览器测试
**测试内容**:
- Chrome
- Firefox
- Safari
- Edge

**验证项**:
- 链接可点击且正确跳转
- QQ 群号复制功能正常
- 响应式布局在各浏览器中一致
- Toast 通知正常显示

**依赖**: Task 6.2

**预计时间**: 20 分钟

---

### ✅ Task 7.2: 国际化测试
**测试内容**:
- 切换到英文，验证所有翻译正确显示
- 切换到中文，验证所有翻译正确显示
- 验证不同语言下布局未破坏

**验证项**:
- 标题翻译正确
- 链接文本翻译正确
- QQ 群号插值（`{groupNumber}`）正确显示
- Toast 消息翻译正确

**依赖**: Task 7.1

**预计时间**: 10 分钟

---

### ✅ Task 7.3: 可访问性测试
**测试内容**:
- 键盘导航（Tab 键）
- 屏幕阅读器兼容性
- 颜色对比度

**验证项**:
- 所有链接可通过 Tab 键访问
- 焦点指示器清晰可见
- ARIA 标签正确
- 颜色对比度符合 WCAG AA 标准

**依赖**: Task 7.2

**预计时间**: 15 分钟

---

## Phase 8: 文档和清理

### ✅ Task 8.1: 更新项目文档（如需要）
**文件**: 项目 README 或相关文档

**变更**:
如果项目文档中有关于界面或功能的说明，更新以反映新增的导航链接。

**验证**:
- 文档描述准确
- 包含新增的导航链接说明

**依赖**: Task 7.3

**预计时间**: 10 分钟

---

### ✅ Task 8.2: 代码审查和清理
**任务内容**:
- 移除未使用的导入
- 移除调试代码和 console.log
- 确保代码风格一致
- 添加必要的注释

**验证**:
- ESLint 检查通过（如有）
- TypeScript 编译无警告
- 代码整洁易读

**依赖**: Task 8.1

**预计时间**: 10 分钟

---

## 总结

**总预计时间**: 约 2.5-3 小时

**关键里程碑**:
1. ✅ Phase 1 完成：基础品牌标识更新完成
2. ✅ Phase 2 完成：国际化翻译键就绪
3. ✅ Phase 3 完成：导航链接配置完成
4. ✅ Phase 4 完成：NavigationLinks 组件开发完成
5. ✅ Phase 5 完成：组件集成到主页面
6. ✅ Phase 6 完成：样式和响应式优化完成
7. ✅ Phase 7 完成：全面测试通过
8. ✅ Phase 8 完成：文档更新和代码清理完成

**并行化机会**:
- Task 1.1 和 Task 1.2 可以并行进行（如果有多人协作）
- Task 2.1 和 Task 2.2 可以并行进行（如果有多人协作）

**风险点**:
- Task 4.2（移动端响应式）可能需要额外的样式调整
- Task 7.3（可访问性测试）可能需要额外的 ARIA 标签或样式修改
