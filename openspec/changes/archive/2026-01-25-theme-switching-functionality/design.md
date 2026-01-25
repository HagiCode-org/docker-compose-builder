# 主题切换功能设计

## 架构设计

### 整体架构

```
┌───────────────────────────────────────────────────────────┐
│                     Theme Provider                        │
│  (Theme Context + next-themes integration)                │
├───────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐
│  │ useTheme Hook    │  │ Theme Toggle     │  │ LocalStorage│
│  │ (Theme state mgmt)│  │ (UI Component)   │  │ (Persistence)│
│  └──────────────────┘  └──────────────────┘  └────────────┘
├───────────────────────────────────────────────────────────┤
│            CSS Variables (Theme Tokens)                    │
│  ┌──────────────┐  ┌──────────────┐
│  │ Light Theme  │  │ Dark Theme   │
│  └──────────────┘  └──────────────┘
└───────────────────────────────────────────────────────────┘
```

### 核心组件设计

#### 1. Theme Context

**职责**：提供主题状态和切换方法

```typescript
// src/contexts/theme-context.tsx
import { createContext, useContext, type ReactNode } from "react";
import { useTheme as useNextTheme } from "next-themes";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // Implementation using next-themes
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

#### 2. Theme Toggle Component

**职责**：提供主题切换的 UI 控件

```typescript
// src/components/ui/theme-toggle.tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

#### 3. useTheme Hook

**职责**：简化主题状态访问

```typescript
// src/hooks/use-theme.tsx
import { useTheme as useContextTheme } from "@/contexts/theme-context";

export const useTheme = useContextTheme;
```

### 样式系统设计

#### 主题变量结构

```css
/* src/index.css */
:root {
  /* 亮色主题变量 */
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  /* ... 其他变量 */
}

.dark {
  /* 暗色主题变量 */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  /* ... 其他变量 */
}
```

#### 主题切换机制

- 使用 `next-themes` 库管理主题状态
- 通过 `data-theme` 属性或 `.dark` 类切换主题
- 使用 localStorage 持久化主题选择

### 集成设计

#### 应用入口集成

```typescript
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./lib/store";
import { ThemeProvider } from "./contexts/theme-context";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
```

#### 组件使用

```typescript
// 在任何组件中使用
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function Component() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <ThemeToggle />
      <p>当前主题: {theme}</p>
    </div>
  );
}
```

### 性能优化

#### 避免闪烁

- 在 `ThemeProvider` 中使用 `disableTransitionOnChange` 避免主题切换时的闪烁
- 确保主题状态在服务器端和客户端的一致性

#### 样式加载

- 使用 Tailwind 的 `dark:` 类前缀确保样式正确应用
- 避免在主题切换时重新计算大量样式

### 兼容性考虑

#### 浏览器支持

- `next-themes` 支持所有现代浏览器
- CSS 变量支持所有主流浏览器（IE 11 除外）
- `prefers-color-scheme` 媒体查询支持：Chrome 76+, Firefox 67+, Safari 12.1+

#### 降级策略

- 不支持 JavaScript 的浏览器会使用默认主题（暗色）
- 不支持 `prefers-color-scheme` 的浏览器会使用默认主题

## 安全考虑

### 主题注入

- 使用 `next-themes` 库提供的安全主题切换方法
- 避免直接操作 DOM 或 `document.documentElement` 的 classList

### 存储安全

- 使用 localStorage 存储主题偏好，无安全风险
- 主题值会经过验证，确保只接受有效值（light/dark/system）

## 可扩展设计

### 添加新主题

```typescript
// src/contexts/theme-context.tsx
type Theme = "light" | "dark" | "system" | "sepia";

interface ThemeProviderProps {
  // ...
  themes?: Theme[];
}
```

```css
/* src/index.css */
.sepia {
  /* 棕褐色主题变量 */
  --background: oklch(0.95 0.03 85);
  --foreground: oklch(0.25 0.05 45);
  /* ... 其他变量 */
}
```

### 主题配置

```typescript
// src/config/theme.ts
export const themes = {
  light: {
    name: "浅色",
    icon: Sun,
  },
  dark: {
    name: "深色",
    icon: Moon,
  },
  system: {
    name: "跟随系统",
    icon: Monitor,
  },
};
```

## 测试策略

### 单元测试

- 测试 `ThemeProvider` 的正确初始化
- 测试 `useTheme` Hook 的功能
- 测试主题切换组件的交互

### 集成测试

- 测试主题切换过程
- 测试主题持久化
- 测试系统主题跟随

### 视觉测试

- 使用截图测试确保主题切换时 UI 元素的正确性
- 测试所有 UI 组件在两种主题下的显示
