# shadcn/ui 组件库统一迁移 - 规范

## ADDED Requirements

### Requirement: 组件库迁移
项目 SHALL 从源项目 PCode.Client 迁移完整的 shadcn/ui 组件库到当前项目。组件库 SHALL 包含所有必要的 TypeScript 组件文件，并确保组件行为和样式的一致性。

#### Scenario: 从源项目复制组件
**Given** 源项目 PCode.Client 包含完整的 shadcn/ui 组件库
**When** 执行迁移脚本
**Then** 所有组件（40+ 个）应该被复制到当前项目的 `src/components/ui/` 目录
**And** 组件的导入路径应该正确（使用 `@/components/ui/...` 别名）

#### Scenario: 验证组件可用性
**Given** 组件库已经迁移完成
**When** 在应用中导入任意 shadcn/ui 组件
**Then** 导入应该成功，没有类型错误
**And** 组件应该能够正常渲染

### Requirement: 配置文件迁移
项目 SHALL 同步复制 shadcn/ui 相关的配置文件，包括 `components.json`、`tailwind.config.js` 和 `src/index.css`。配置文件 SHALL 与源项目保持一致。

#### Scenario: 更新 components.json
**Given** 源项目 PCode.Client 的 components.json 配置
**When** 复制配置到当前项目并覆盖
**Then** style 应该从 "radix-vega" 更改为 "radix-nova"
**And** 所有路径别名应该正确配置
**And** 图标库应该设置为 "lucide"

#### Scenario: 更新 Tailwind 配置
**Given** 源项目 PCode.Client 的 tailwind.config.js
**When** 复制配置到当前项目并覆盖
**Then** 中文字体（Microsoft YaHei、PingFang SC 等）应该正确配置
**And** JetBrains Mono 代码字体应该正确配置
**And** 游戏化风格的颜色和动画变量应该包含在内

#### Scenario: 更新全局样式
**Given** 源项目 PCode.Client 的 globals.css
**When** 复制样式到当前项目的 src/index.css
**Then** 颜色系统应该使用 oklch 颜色空间
**And** 字体导入应该从 Inter 更改为 Noto Sans 和 JetBrains Mono
**And** 游戏化风格的颜色变量应该包含在 :root 选择器中

### Requirement: 依赖包更新
项目 SHALL 基于源项目 PCode.Client 的 package.json，更新当前项目的依赖配置。依赖包版本 SHALL 与源项目保持一致，以确保组件库的正常运行。

#### Scenario: 同步依赖版本
**Given** 源项目 PCode.Client 的 package.json 依赖列表
**When** 更新当前项目的 package.json
**Then** 所有 @radix-ui/react-* 依赖应该正确安装
**And** shadcn 相关依赖（class-variance-authority、clsx、tailwind-merge）应该正确安装
**And** 字体包（@fontsource-variable/noto-sans、@fontsource/jetbrains-mono）应该正确安装

#### Scenario: 安装依赖
**Given** 更新后的 package.json
**When** 执行 npm install
**Then** 所有依赖应该成功安装，没有冲突
**And** node_modules 目录应该包含所有必要的包

### Requirement: 项目构建验证
项目 SHALL 确保迁移后的组件库能够正常构建和运行。构建过程 SHALL 不产生错误，且应用功能 SHALL 保持完整。

#### Scenario: 验证项目构建
**Given** 组件库、配置和依赖已经迁移完成
**When** 执行 npm run build
**Then** 构建应该成功完成，没有错误
**And** 输出目录应该包含正确的 bundle 文件

#### Scenario: 验证开发服务器
**Given** 组件库、配置和依赖已经迁移完成
**When** 执行 npm run dev
**Then** 开发服务器应该成功启动
**And** 应用应该在浏览器中正常渲染
**And** 控制台不应该有错误信息

## MODIFIED Requirements

### Requirement: 现有组件适配
项目 SHALL 调整现有的组件使用方式，以适配新的 shadcn/ui 组件 API。组件导入路径和使用方式 SHALL 符合 shadcn/ui 的最佳实践。

#### Scenario: 更新组件导入路径
**Given** 现有代码中使用了自定义组件
**When** 迁移到 shadcn/ui 组件后
**Then** 组件导入路径应该更新为 `@/components/ui/...`
**And** 组件的使用方式应该符合 shadcn/ui 的 API 规范

#### Scenario: 更新组件样式
**Given** 现有代码中使用了自定义样式类
**When** 迁移到 shadcn/ui 组件后
**Then** 样式类应该更新为使用 shadcn/ui 的变体 API
**And** 组件应该使用统一的样式系统

## 相关能力
- `shadcn-ui-migration` (本规范)
- `package.json-management` (依赖管理)
- `tailwind-configuration` (样式配置)
