## 1. Implementation

- [x] 1.1 更新类型定义 (`src/lib/docker-compose/types.ts`)
  - [x] 验证 `AnthropicApiProvider` 和 `REGISTRIES` 类型已正确定义
  - [x] 确认 `DockerComposeConfig` 接口包含 `anthropicApiProvider` 字段

- [x] 1.2 更新默认配置 (`src/lib/docker-compose/defaultConfig.ts`)
  - [x] 验证 `anthropicApiProvider` 默认值设置为 `'zai'`

- [x] 1.3 更新 ConfigForm 组件 (`src/components/docker-compose/ConfigForm.tsx`)
  - [x] 将 API Provider 选择器从仅 `full-custom` 模式可见改为两种模式均可见
  - [x] 移除 API Provider 选择器的条件渲染限制 `{config.profile === 'full-custom' && ...}`
  - [x] 确保选择器在快速配置模式和完整自定义模式中都能正常工作
  - [x] 优化布局，使 API Provider 选择器在两种模式下位置一致
  - [x] 当选择 Custom API Endpoint 时，确保 API Endpoint URL 输入框在两种模式下均可见
  - [x] 移除 API Endpoint URL 输入框的模式限制条件

- [x] 1.4 更新 i18n 翻译文件
  - [x] 验证 `src/i18n/locales/en-US.json` 包含所有必要的翻译键
  - [x] 验证 `src/i18n/locales/zh-CN.json` 包含所有必要的翻译键
  - [x] 确认以下键存在：
    - `configForm.apiProvider`
    - `configForm.selectApiProvider`
    - `configForm.zhipuAI`
    - `configForm.anthropicOfficialApi`
    - `configForm.customApiEndpoint`

- [x] 1.5 验证配置生成器 (`src/lib/docker-compose/generator.ts`)
  - [x] 确认 `generateYAML` 函数正确处理 `anthropicApiProvider` 字段
  - [x] 验证为不同提供商生成正确的环境变量：
    - `anthropic`: 仅 `ANTHROPIC_AUTH_TOKEN`
    - `zai`: `ANTHROPIC_AUTH_TOKEN` + `ANTHROPIC_URL`
    - `custom`: `ANTHROPIC_AUTH_TOKEN` + `ANTHROPIC_URL`

- [x] 1.6 更新验证逻辑 (`src/lib/docker-compose/validation.ts`)
  - [x] 验证 API Token 字段在所有模式下都是必填的
  - [x] 当选择自定义提供商时，验证 API Endpoint URL 字段是必填的
  - [x] 确保验证错误消息支持多语言

## 2. Testing

- [x] 2.1 功能测试
  - [x] 测试快速配置模式下可以选择 API 提供商
  - [x] 测试完整自定义模式下可以选择 API 提供商
  - [x] 测试快速配置模式下，选择自定义提供商时 API Endpoint URL 字段正确显示
  - [x] 测试完整自定义模式下，选择自定义提供商时 API Endpoint URL 字段正确显示
  - [x] 测试模式切换时保留用户选择的 API 提供商和 API 端点 URL
  - [x] 测试选择不同提供商时，生成的 YAML 配置正确
  - [x] 测试自定义提供商模式下，API URL 字段正确显示和验证

- [x] 2.2 UI 测试
  - [x] 测试 API 提供商选择器在桌面端的显示
  - [x] 测试 API 提供商选择器在移动端的显示
  - [x] 测试选择器样式与其他表单元素一致
  - [x] 测试默认值（ZAI）正确标记为推荐选项

- [x] 2.3 多语言测试
  - [x] 测试英文翻译正确显示
  - [x] 测试中文翻译正确显示
  - [x] 测试语言切换时所有文本正确更新

- [x] 2.4 边界情况测试
  - [x] 测试未选择 API Token 时的验证错误
  - [x] 测试选择自定义提供商但未填写 URL 时的验证错误
  - [x] 测试快速配置模式和完整自定义模式之间的数据保留

## 3. Documentation

- [x] 3.1 更新用户文档（如适用）
  - [x] 说明新的 API 提供商选择功能
  - [x] 提供不同提供商的使用示例

## 4. Code Quality

- [x] 4.1 代码审查
  - [x] 确保代码遵循项目编码规范
  - [x] 确保类型定义正确
  - [x] 确保 TypeScript 编译无错误

- [x] 4.2 构建和部署
  - [x] 运行 `npm run build` 确保构建成功
  - [x] 运行 `npm run lint` 确保无 lint 错误
  - [x] 在本地环境验证生成的应用功能正常
