# Change: 集成 Microsoft Clarity 用户行为分析

## Why

当前项目缺乏用户行为分析和用户体验监控能力，无法获取用户使用模式的洞察、页面交互和用户体验数据、用户行为路径分析以及潜在的用户体验问题。为了更好地了解用户使用情况并优化产品，需要集成用户行为分析工具。

## What Changes

- **添加 Microsoft Clarity 集成**：参考 pcode 项目的实现方式，在当前项目中集成 Microsoft Clarity 用户行为分析
- **固定项目 ID**：使用固定的 Clarity 项目 ID `v6zgmrg1q7`
- **始终启用**：Clarity 始终保持启用状态，无需环境变量配置
- **服务类实现**：创建 `clarityService.ts` 服务类，提供初始化、用户标识、事件跟踪、同意管理等功能
- **钩子函数**：创建 `useClarityConsent.ts` 自定义钩子，简化组件中使用 Clarity 的同意管理
- **初始化组件**：在应用初始化时自动初始化 Clarity
- **GDPR 合规性**：实现 granular consent control（完整同意、仅分析、不同意），并支持暂停/恢复录制

## Impact

- **受影响的代码**：
  - `package.json` - 添加 `@microsoft/clarity` 依赖
  - `src/services/clarityService.ts` - 新增服务类
  - `src/hooks/useClarityConsent.ts` - 新增自定义钩子
  - `src/main.tsx` 或 `src/App.tsx` - 添加初始化逻辑
- **功能影响**：获得用户行为分析能力，提供用户体验优化数据支持，帮助识别用户使用痛点
- **用户体验影响**：对终端用户透明，无感知集成，符合隐私保护要求