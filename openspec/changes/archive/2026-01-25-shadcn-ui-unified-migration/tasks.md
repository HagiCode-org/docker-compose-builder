# 统一迁移 shadcn/ui 组件库和配置 - 任务列表

## 1. 配置文件迁移
- [x] 复制源项目 `components.json` 到当前项目根目录，覆盖现有配置
- [x] 复制源项目 `tailwind.config.js` 到当前项目根目录，覆盖现有配置
- [x] 更新 `package.json` 依赖，添加缺失的 shadcn/ui 相关依赖
- [x] 安装更新后的依赖

## 2. 组件文件迁移
- [x] 复制源项目 `src/components/ui/` 目录下的所有组件到当前项目对应的目录
- [x] 确保组件文件的结构和命名保持一致
- [x] 检查并更新组件导入路径（使用 `@/` 别名）

## 3. 样式文件迁移
- [x] 复制源项目 `src/globals.css`（对应当前项目 `src/index.css`）
- [x] 更新字体导入和配置（从 Inter 字体更改为 Noto Sans 和 JetBrains Mono）
- [x] 更新颜色变量和主题配置

## 4. 项目结构优化
- [x] 检查并创建缺失的目录结构（如 `src/hooks/`、`src/lib/` 等）
- [x] 复制源项目 `src/lib/utils.ts` 到当前项目
- [x] 确保 TypeScript 配置与源项目一致

## 5. 验证与测试
- [x] 运行项目构建验证迁移是否成功
- [x] 检查是否有 TypeScript 类型错误
- [x] 验证组件是否能够正常导入和使用
- [x] 测试现有功能是否正常运行

## 依赖关系
- 任务 1 必须先完成，为后续任务提供基础配置
- 任务 2、3、4 可以并行执行
- 任务 5 必须在所有迁移任务完成后执行

## 可交付成果
- 更新后的 `components.json`、`tailwind.config.js` 和 `package.json`
- 完整的 shadcn/ui 组件库（40+ 个组件）
- 统一的全局样式和配置
- 可正常构建和运行的项目
