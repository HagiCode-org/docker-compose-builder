# Docker Compose 生成逻辑可测试性重构 - 实施任务清单

本文档列出实现可测试性重构的有序任务清单。任务按逻辑顺序组织，明确依赖关系和可交付成果。

## 任务概览

- **总任务数**：36（新增 T3.13：配置 Verify 工具的 diff 输出）
- **预计阶段**：4 个（分析、重构、测试、验证）
- **并行化机会**：标注为 🔀 的任务可并行执行

---

## 阶段 1：分析与准备 (Analysis & Preparation)

### 1.1 分析现有实现

- [ ] **T1.1** 阅读并分析 `src/lib/docker-compose/generator.ts` 的当前实现
  - 识别函数的输入输出
  - 分析依赖关系（如 `REGISTRIES`, `ZAI_API_URL`）
  - 识别潜在的副作用（如 `new Date()`）
  - **输出**：分析文档（注释或文档字符串）

- [ ] **T1.2** 阅读 `src/lib/docker-compose/types.ts` 类型定义
  - 确认 `DockerComposeConfig` 接口的完整性
  - 识别可选字段和必填字段
  - **输出**：类型清单文档

- [ ] **T1.3** 检查项目现有测试配置
  - 确认是否已配置 Vitest
  - 检查 `vitest.config.ts` 或相关配置文件
  - 检查 `package.json` 中的测试脚本
  - **输出**：测试配置状态报告

- [ ] **T1.4** 检查现有的 `validation.ts` 文件
  - 确认是否存在（当前已存在）
  - 分析现有验证逻辑的覆盖范围
  - **输出**：验证模块现状分析

### 1.2 建立测试基础设施

- [ ] **T1.5** 安装必要的测试依赖
  ```bash
  npm install -D vitest @vitest/ui js-yaml
  ```
  - **验证**：检查 `package.json` 中的 devDependencies

- [ ] **T1.6** 配置 Vitest（如果未配置）
  - 创建或更新 `vitest.config.ts`
  - 启用 coverage 报告
  - 配置测试环境（jsdom 或 node）
  - **输出**：可运行的 Vitest 配置

- [ ] **T1.7** 配置 Verify 快照测试工具
  ```bash
  npm install -D verifyjs
  ```
  - 创建 `verify.config.json`
  - 配置快照文件扩展名和输出目录
  - 配置时间戳 scrubbers
  - **输出**：Verify 配置文件

- [ ] **T1.8** 创建测试目录结构
  ```
  src/lib/docker-compose/__tests__/
  ├── unit/
  ├── bdd/
  ├── __verify__/
  └── helpers/
  ```
  - **输出**：完整的测试目录结构

---

## 阶段 2：重构与优化 (Refactoring & Optimization)

### 2.1 重构 generator.ts

- [ ] **T2.1** 提取 `buildHeader` 函数
  - 从 `generateYAML` 中提取头部注释生成逻辑
  - 函数签名：`buildHeader(config, language, now): string[]`
  - 添加单元测试
  - **依赖**：T1.1
  - **输出**：独立可测试的 `buildHeader` 函数

- [ ] **T2.2** 提取 `buildServicesSection` 函数
  - 提取服务部分的生成逻辑
  - 函数签名：`buildServicesSection(config): string[]`
  - 添加单元测试
  - **依赖**：T2.1
  - **输出**：独立可测试的 `buildServicesSection` 函数

- [ ] **T2.3** 提取 `buildAppService` 函数
  - 提取应用服务（hagicode）的生成逻辑
  - 函数签名：`buildAppService(config): string[]`
  - 添加单元测试
  - **依赖**：T2.2
  - **输出**：独立可测试的 `buildAppService` 函数

- [ ] **T2.4** 提取 `buildPostgresService` 函数
  - 提取 PostgreSQL 服务的生成逻辑
  - 函数签名：`buildPostgresService(config): string[]`
  - 添加单元测试
  - **依赖**：T2.2
  - **输出**：独立可测试的 `buildPostgresService` 函数

- [ ] **T2.5** 提取 `buildVolumesSection` 函数
  - 提取 volumes 部分的生成逻辑
  - 函数签名：`buildVolumesSection(config): string[]`
  - 添加单元测试
  - **依赖**：T2.4
  - **输出**：独立可测试的 `buildVolumesSection` 函数

- [ ] **T2.6** 提取 `buildNetworksSection` 函数
  - 提取 networks 部分的生成逻辑
  - 函数签名：`buildNetworksSection(config): string[]`
  - 添加单元测试
  - **依赖**：T2.2
  - **输出**：独立可测试的 `buildNetworksSection` 函数

- [ ] **T2.7** 重构 `generateYAML` 主函数
  - 修改函数签名，添加可选的 `now` 参数
  - 重构函数体，调用提取的辅助函数
  - 确保输出与原始实现完全一致
  - **依赖**：T2.1, T2.2, T2.5, T2.6
  - **输出**：重构后的 `generateYAML` 函数

- [ ] **T2.8** 导出辅助函数（用于测试）
  - 在 `generator.ts` 中导出所有辅助函数
  - 添加 JSDoc 注释说明函数用途
  - **依赖**：T2.7
  - **输出**：可测试的模块导出

### 2.2 创建 validation.ts 模块

- [ ] **T2.9** 定义验证类型
  - 定义 `ValidationResult` 接口
  - 定义 `ValidationError` 接口
  - 定义错误码类型
  - **输出**：完整的验证类型定义

- [ ] **T2.10** 实现 `validateConfig` 主函数
  - 函数签名：`validateConfig(config, language): ValidationResult`
  - 调用子验证函数
  - 聚合所有验证错误
  - **依赖**：T2.9
  - **输出**：主验证函数

- [ ] **T2.11** 实现 `validateRequiredFields` 函数
  - 验证所有必填字段
  - 返回 `ValidationError[]`
  - 添加单元测试
  - **依赖**：T2.9
  - **输出**：必填字段验证函数

- [ ] **T2.12** 实现 `validatePortNumbers` 函数
  - 验证端口号范围（1-65535）
  - 返回 `ValidationError[]`
  - 添加单元测试
  - **依赖**：T2.9
  - **输出**：端口号验证函数

- [ ] **T2.13** 实现 `validatePaths` 函数
  - 根据 `hostOS` 验证路径格式
  - 返回 `ValidationError[]`
  - 添加单元测试
  - **依赖**：T2.9
  - **输出**：路径验证函数

- [ ] **T2.14** 实现 `validateApiProvider` 函数
  - 验证自定义 API 提供商的 URL
  - 返回 `ValidationError[]`
  - 添加单元测试
  - **依赖**：T2.9
  - **输出**：API 提供商验证函数

---

## 阶段 3：测试实现 (Test Implementation)

### 3.1 单元测试（Unit Tests）

- [ ] **T3.1** 🔀 创建 `generator.test.ts`
  - 测试 `buildHeader` 函数
  - 测试 `buildServicesSection` 函数
  - 测试 `buildVolumesSection` 函数
  - 测试 `buildNetworksSection` 函数
  - **依赖**：T2.8
  - **输出**：完整的生成器单元测试套件

- [ ] **T3.2** 🔀 创建 `validation.test.ts`
  - 测试所有验证函数
  - 覆盖有效和无效输入
  - 测试错误信息格式
  - **依赖**：T2.14
  - **输出**：完整的验证单元测试套件

- [ ] **T3.3** 🔀 创建 `types.test.ts`
  - 测试类型辅助函数（如存在）
  - 测试常量（`REGISTRIES`, `ZAI_API_URL`）
  - **输出**：类型测试套件

### 3.2 BDD 场景测试

- [ ] **T3.4** 创建 `quick-start-scenarios.test.ts`
  - 场景 1：最小配置生成
  - 场景 2：默认值处理
  - 场景 3：ZAI 提供商
  - 场景 4：Anthropic 提供商
  - 场景 5：自定义 API 提供商
  - **依赖**：T2.8, T3.1
  - **输出**：快速体验模式 BDD 测试套件

- [ ] **T3.5** 创建 `full-custom-scenarios.test.ts`
  - 场景 1：Windows 部署配置
  - 场景 2：Linux Root 用户配置
  - 场景 3：Linux 非Root 用户配置（含 PUID/PGID）
  - 场景 4：内部数据库（Named Volume）
  - 场景 5：内部数据库（Bind Mount）
  - 场景 6：外部数据库配置
  - **依赖**：T2.8, T3.1
  - **输出**：完整自定义模式 BDD 测试套件

- [ ] **T3.6** 创建 `api-provider-scenarios.test.ts`
  - 场景 1：Anthropic 官方 API
  - 场景 2：Zhipu AI (ZAI)
  - 场景 3：自定义 API 端点
  - 场景 4：API 端点 URL 验证
  - **依赖**：T2.8, T3.1
  - **输出**：API 提供商 BDD 测试套件

- [ ] **T3.7** 创建 `image-registry-scenarios.test.ts`
  - 场景 1：Docker Hub
  - 场景 2：阿里云 ACR
  - 场景 3：Azure Container Registry
  - **依赖**：T2.8, T3.1
  - **输出**：镜像注册表 BDD 测试套件

- [ ] **T3.8** 创建 `edge-cases.test.ts`
  - 场景 1：空字符串处理
  - 场景 2：端口号边界（0, 65535, 超出范围）
  - 场景 3：路径格式验证
  - 场景 4：特殊字符处理
  - **依赖**：T2.8, T3.1
  - **输出**：边界条件 BDD 测试套件

### 3.3 Verify 快照测试（完整文件验证）

- [ ] **T3.9** 建立基线快照（完整文件）
  - 针对所有配置场景生成完整的 YAML 文件
  - 使用 Verify 的 `verify()` 函数存储整个文件内容
  - 手动审查每个快照文件的完整性
  - 确认快照包含从注释头到 volumes/networks 的完整内容
  - **依赖**：T1.7, T2.8
  - **输出**：基线快照文件集（完整文件）

- [ ] **T3.10** 创建 `quick-start-snapshots.test.ts`
  - 快照：默认配置（中文）- 完整 YAML 文件
  - 快照：默认配置（英文）- 完整 YAML 文件
  - 快照：ZAI 提供商 - 完整 YAML 文件
  - 快照：Anthropic 提供商 - 完整 YAML 文件
  - 快照：自定义 API 提供商 - 完整 YAML 文件
  - 每个测试使用 `await verify()` 存储完整文件内容
  - **依赖**：T3.9
  - **输出**：快速体验模式快照测试

- [ ] **T3.11** 创建 `full-custom-snapshots.test.ts`
  - 快照：Windows + 内部数据库 - 完整 YAML 文件
  - 快照：Linux Root + 内部数据库 - 完整 YAML 文件
  - 快照：Linux 非Root + 内部数据库 - 完整 YAML 文件
  - 快照：外部数据库配置 - 完整 YAML 文件
  - 每个测试使用 `await verify()` 存储完整文件内容
  - **依赖**：T3.9
  - **输出**：完整自定义模式快照测试

- [ ] **T3.12** 创建 `api-provider-snapshots.test.ts`
  - 快照：Anthropic 官方 API - 完整 YAML 文件
  - 快照：Zhipu AI (ZAI) - 完整 YAML 文件
  - 快照：自定义 API 端点 - 完整 YAML 文件
  - 每个测试使用 `await verify()` 存储完整文件内容
  - **依赖**：T3.9
  - **输出**：API 提供商快照测试

- [ ] **T3.13** 配置 Verify 工具的 diff 输出
  - 配置 Verify 的 diff 格式，确保清晰展示文件级别差异
  - 配置 scrubbers 移除时间戳等动态内容
  - 测试 diff 输出在 CI/CD 中的可读性
  - **依赖**：T1.7
  - **输出**：优化的 Verify 配置

---

## 阶段 4：验证与文档 (Validation & Documentation)

### 4.1 集成验证

- [ ] **T4.1** 运行完整测试套件
  ```bash
  npm run test
  npm run test:coverage
  ```
  - 确保所有测试通过
  - 检查测试覆盖率 ≥ 80%
  - **依赖**：所有阶段 3 任务
  - **输出**：测试运行报告

- [ ] **T4.2** 验证 Verify 快照（完整文件匹配）
  ```bash
  npm run test:verify
  ```
  - 确认所有快照匹配（文件级别）
  - 审查任何 diff 输出，确保整个文件内容一致
  - 如有差异，使用 Verify 的 diff 工具定位变更位置
  - **依赖**：T3.13
  - **输出**：快照验证报告

- [ ] **T4.3** 手动测试 UI 功能
  - 打开 Docker Compose 生成器页面
  - 测试所有配置选项
  - 验证生成的 YAML 符合预期
  - **依赖**：T2.8
  - **输出**：手动测试报告

- [ ] **T4.4** 🔀 运行 ESLint 和 TypeScript 检查
  ```bash
  npm run lint
  npm run build
  ```
  - 确保无 ESLint 错误
  - 确保无 TypeScript 编译错误
  - **输出**：代码质量报告

### 4.2 文档编写

- [ ] **T4.5** 编写测试贡献指南
  - 文件路径：`docs/testing-guide.md`
  - 内容：
    - 如何运行测试
    - 如何编写单元测试
    - 如何编写 BDD 场景测试
    - **如何使用 Verify 进行完整文件验证**
    - **如何更新和审查 Verify 快照**
    - **如何解读 Verify 的 diff 输出**
  - **输出**：完整的测试指南文档

- [ ] **T4.6** 更新项目 README
  - 添加测试章节
  - 说明测试策略（单元 + BDD + Verify）
  - 提供测试命令参考
  - **输出**：更新的 README.md

- [ ] **T4.7** 更新 `CLAUDE.md`（如需要）
  - 添加测试相关说明
  - 说明可测试性要求
  - **输出**：更新的 CLAUDE.md

- [ ] **T4.8** 编写代码注释和 JSDoc
  - 为所有导出函数添加 JSDoc
  - 为复杂逻辑添加行内注释
  - **依赖**：T2.8, T2.14
  - **输出**：带注释的代码

### 4.3 CI/CD 集成

- [ ] **T4.9** 配置 GitHub Actions（如果使用）
  - 添加测试运行步骤
  - 添加覆盖率报告上传
  - 添加快照验证步骤
  - **输出**：CI 工作流配置

- [ ] **T4.10** 创建测试报告徽章
  - 添加覆盖率徽章到 README
  - 添加构建状态徽章
  - **输出**：更新的 README.md

---

## 任务并行化建议

以下任务组可以并行执行以提高效率：

### 并行组 1：测试基础设施准备
- **T1.5**（安装测试依赖）
- **T1.6**（配置 Vitest）
- **T1.7**（配置 Verify）
- **T1.8**（创建测试目录结构）

### 并行组 2：单元测试编写
- **T3.1**（generator.test.ts）
- **T3.2**（validation.test.ts）
- **T3.3**（types.test.ts）

### 并行组 3：BDD 场景测试编写
- **T3.4**（快速体验场景）
- **T3.5**（完整自定义场景）
- **T3.6**（API 提供商场景）
- **T3.7**（镜像注册表场景）
- **T3.8**（边界条件场景）

### 并行组 4：代码质量检查
- **T4.4**（ESLint 和 TypeScript）
- **T4.5**（测试指南编写）
- **T4.6**（README 更新）

---

## 验收标准

每个阶段的完成标准：

### 阶段 1 完成标准
- [ ] 所有 T1.x 任务已完成
- [ ] `npm run test` 可正常运行（即使测试为空）
- [ ] Verify 配置文件已创建

### 阶段 2 完成标准
- [ ] 所有 T2.x 任务已完成
- [ ] `generator.ts` 重构完成，所有辅助函数已导出
- [ ] `validation.ts` 模块已创建，所有函数已实现
- [ ] TypeScript 编译无错误

### 阶段 3 完成标准
- [ ] 所有 T3.x 任务已完成（包括 T3.13：Verify diff 配置）
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] BDD 场景测试至少 15 个
- [ ] Verify 快照至少 20 个（每个都是完整文件）
- [ ] Verify diff 输出清晰易读

### 阶段 4 完成标准
- [ ] 所有 T4.x 任务已完成
- [ ] 所有测试通过
- [ ] 文档完整
- [ ] CI/CD 已集成

---

## 风险缓解任务

以下任务用于缓解已知风险：

- [ ] **RT1** 在 T2.7 之前创建重构前的基线快照（完整文件）
  - 目的：防止重构导致意外变更
  - 执行：使用当前实现运行 Verify 测试，生成完整文件快照
  - **输出**：重构前基线快照（完整 YAML 文件）

- [ ] **RT2** 在 T3.13 之后进行快照差异审查（文件级别）
  - 目的：确保所有变更都是预期的
  - 执行：使用 Verify 的 diff 工具逐个审查快照文件差异
  - **输出**：差异审查报告

- [ ] **RT3** 在 T4.2 之后进行 Verify 快照完整性验证
  - 目的：确保所有快照都是完整文件
  - 执行：检查每个快照文件包含完整的 YAML 内容
  - **输出**：快照完整性报告
