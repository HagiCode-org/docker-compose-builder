## 1. Implementation

### 1.1 依赖安装和基础配置
- [x] 1.1.1 安装 `react-i18next` 和 `i18next` 依赖包
- [x] 1.1.2 创建 `src/i18n/config.ts` 配置文件
- [x] 1.1.3 创建 `src/i18n/locales/zh-CN.json` 中文语言资源
- [x] 1.1.4 创建 `src/i18n/locales/en-US.json` 英文语言资源
- [x] 1.1.5 在 `src/main.tsx` 中初始化 i18n 配置

### 1.2 语言检测和持久化
- [x] 1.2.1 实现浏览器语言自动检测逻辑
- [x] 1.2.2 实现 localStorage 语言偏好存储
- [x] 1.2.3 实现语言切换功能（changeLanguage）
- [x] 1.2.4 设置默认语言为 zh-CN

### 1.3 语言切换组件开发
- [x] 1.3.1 创建 `src/components/i18n/LanguageSwitcher.tsx` 组件
- [x] 1.3.2 实现下拉菜单 UI（使用现有 Select 组件）
- [x] 1.3.3 添加语言选项（中文 zh-CN、英文 en-US）
- [x] 1.3.4 集成到 `DockerComposeGenerator.tsx` header 区域

### 1.4 文本提取和迁移
- [x] 1.4.1 提取 `DockerComposeGenerator.tsx` 中的硬编码文本
- [x] 1.4.2 提取 `ConfigForm.tsx` 中的硬编码文本（标签、提示、按钮等）
- [x] 1.4.3 提取 `ConfigPreview.tsx` 中的硬编码文本
- [x] 1.4.4 更新所有组件使用 `useTranslation()` hook
- [x] 1.4.5 验证所有文本已正确迁移

### 1.5 验证和测试
- [x] 1.5.1 测试语言切换功能
- [x] 1.5.2 测试浏览器语言自动检测
- [x] 1.5.3 测试 localStorage 持久化
- [x] 1.5.4 验证响应式布局在不同语言下正常显示
- [x] 1.5.5 检查是否有遗漏的硬编码文本

## 2. Documentation

- [x] 2.1 更新 README.md 说明多语言功能
- [x] 2.2 添加如何添加新语言的文档
