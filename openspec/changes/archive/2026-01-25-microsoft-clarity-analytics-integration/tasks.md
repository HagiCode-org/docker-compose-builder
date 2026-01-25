## 1. 依赖安装
- [x] 1.1 在 `package.json` 中添加 `@microsoft/clarity` 依赖（版本 1.0.2）

## 2. 服务类实现
- [x] 2.1 创建 `src/services/clarityService.ts` 文件
- [x] 2.2 实现 `ClarityService` 类，包含单例模式
- [x] 2.3 实现 `initialize()` 方法，初始化 Clarity SDK
- [x] 2.4 实现 `isActive()` 方法，检查 Clarity 是否激活
- [x] 2.5 实现 `getConfig()` 方法，获取配置信息
- [x] 2.6 实现 `identifyUser()` 方法，标识用户
- [x] 2.7 实现 `setTag()` 方法，设置自定义标签
- [x] 2.8 实现 `trackEvent()` 方法，跟踪自定义事件 - Note: Clarity v1.0.2 does not support trackEvent
- [x] 2.9 实现 `setConsent()` 方法，设置用户同意（简单模式）
- [x] 2.10 实现 `setConsentV2()` 方法，设置用户同意（GDPR 模式）
- [x] 2.11 实现 `pauseRecording()` 和 `resumeRecording()` 方法，暂停/恢复录制 - Note: Clarity v1.0.2 does not support these methods
- [x] 2.12 实现 `upgrade()` 方法，升级会话 - Note: Clarity v1.0.2 upgrade method signature differs
- [x] 2.13 实现 `initializeClarity()` 辅助函数，使用固定项目 ID `v6zgmrg1q7` 初始化

## 3. 自定义钩子实现
- [x] 3.1 创建 `src/hooks/useClarityConsent.ts` 文件
- [x] 3.2 实现 `useClarityConsent()` 钩子，管理用户同意状态
- [x] 3.3 实现 `useClarityStatus()` 钩子，获取 Clarity 状态

## 4. 应用初始化
- [x] 4.1 在 `src/main.tsx` 中添加 Clarity 初始化逻辑
- [x] 4.2 确保在应用启动时正确初始化 Clarity

## 5. 验证与测试
- [x] 5.1 确保所有代码通过 TypeScript 编译
- [x] 5.2 运行 `npm run build` 确保构建成功
- [x] 5.3 验证 Clarity 使用固定的项目 ID `v6zgmrg1q7` 正确初始化
- [x] 5.4 验证 Clarity 始终保持启用状态