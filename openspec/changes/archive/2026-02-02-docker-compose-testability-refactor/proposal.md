# Docker Compose 生成逻辑可测试性重构

## 概述 (Overview)

将 Docker Compose 文件生成逻辑从页面组件中抽取为独立的服务层，建立完善的测试体系（BDD + Verify 测试），提升代码的可测试性、可维护性和质量保障能力。

## 动机 (Motivation)

### 当前问题

1. **逻辑耦合严重**：`generateYAML` 函数（`src/lib/docker-compose/generator.ts`）虽然已经独立，但与页面组件的业务逻辑紧密关联，无法独立测试各种生成场景
2. **测试覆盖不足**：缺乏对生成逻辑的系统性验证，无法确保各种配置组合的正确性
3. **回归风险高**：修改生成逻辑时缺乏自动化测试保护，容易引入意外变更
4. **开发效率低**：无法在界面开发前验证核心逻辑，增加调试和修复成本

### 预期收益

- **可测试性提升**：核心生成逻辑可独立于 UI 进行单元测试和集成测试
- **质量保障**：通过 BDD 场景测试和 Verify 快照测试确保生成逻辑的正确性
- **开发效率**：在界面开发前即可验证和迭代生成逻辑，减少后期调试成本
- **维护性增强**：职责分离清晰，降低代码耦合度，便于后续功能扩展

## 范围 (Scope)

### 包含内容

1. **服务层抽象**
   - 重构 `src/lib/docker-compose/generator.ts`，确保其为纯函数服务
   - 明确输入输出接口，消除对 UI 状态的隐式依赖
   - 优化类型定义，增强类型安全性

2. **BDD 测试体系**
   - 建立行为驱动开发测试套件
   - 定义清晰的 Given-When-Then 场景
   - 覆盖常见用例和边界条件

3. **Verify 测试集成（核心验证策略）**
   - **使用 Verify 工具进行完整的生成文件验证**（快照测试）
   - 验证整个 YAML 文件的内容正确性（而非部分片段）
   - 确保文件级别的输出稳定性，防止意外变更
   - 通过快照对比快速发现生成逻辑的任何变更
   - 验证 YAML 语法正确性
   - 检查关键配置项的完整性

4. **测试工具配置**
   - 配置测试框架（Vitest + Testing Library）
   - 集成 Verify 快照测试工具
   - 配置 BDD 测试运行器

### 排除内容

1. UI 组件的重构（`ConfigForm.tsx`, `ConfigPreview.tsx` 保持不变）
2. Redux 状态管理的重构
3. 表单验证逻辑的修改
4. 国际化（i18n）逻辑的变更

## 影响范围 (Impact)

### 受影响的组件

| 组件/模块 | 影响类型 | 说明 |
|-----------|----------|------|
| `src/lib/docker-compose/generator.ts` | 重构 | 优化函数签名，确保纯函数特性 |
| `src/lib/docker-compose/types.ts` | 修改 | 增强类型定义的完整性 |
| `src/lib/docker-compose/validation.ts` | 新增 | 新建输入验证模块 |
| `src/components/docker-compose/ConfigPreview.tsx` | 微调 | 调用方式保持不变，仅确保兼容性 |
| `src/components/docker-compose/ConfigForm.tsx` | 无影响 | 仅作为调用方，不修改 |

### 新增内容

- `src/lib/docker-compose/__tests__/` - BDD 场景测试目录
- `src/lib/docker-compose/__tests__/__verify__/` - Verify 快照测试目录
- `src/lib/docker-compose/validation.ts` - 输入验证模块
- `vitest.config.ts` - Vitest 配置文件（如果不存在）
- `verify.config.json` - Verify 配置文件

## 依赖关系 (Dependencies)

### 前置依赖

1. 现有的 `generator.ts` 模块已存在，需要分析其当前实现
2. 项目已配置 Vitest 测试框架
3. 项目已使用 TypeScript 进行类型检查

### 技术依赖

- **Vitest**：单元测试和集成测试框架
- **Vitest Testing Library**：BDD 风格测试工具
- **Verify**：快照测试工具（用于验证生成的 YAML 文件）
- **js-yaml**：YAML 语法验证库

### 后续影响

此重构为后续功能扩展奠定基础：
- 支持更多 Docker Compose 配置选项
- 生成其他编排格式（如 Kubernetes YAML）
- 提供命令行工具（CLI）

## 风险与缓解 (Risks & Mitigations)

### 风险 1：现有功能回归

**描述**：重构 `generateYAML` 函数可能意外改变生成的输出格式，导致现有用户配置失效。

**缓解措施**：
- **在重构前建立现有输出的 Verify 快照作为基线**（完整文件快照）
- **重构后对比快照，确保整个文件输出完全一致**
- 使用 Verify 工具的 diff 功能快速定位任何差异
- 逐步迁移，保持向后兼容

### 风险 2：测试覆盖率不足

**描述**：BDD 场景可能无法覆盖所有实际使用情况。

**缓解措施**：
- 优先覆盖核心路径和常见配置
- 建立场景优先级列表，逐步完善
- 在实际使用中持续补充测试用例

### 风险 3：工具学习曲线

**描述**：团队可能不熟悉 Verify 或 BDD 测试工具。

**缓解措施**：
- 提供清晰的测试编写示例和文档
- 在提案中包含测试模板
- 建立简单的贡献指南

## 成功标准 (Success Criteria)

1. **功能完整性**
   - [ ] 所有现有生成场景通过 BDD 测试
   - [ ] **Verify 快照测试覆盖所有生成场景的完整文件输出**
   - [ ] **每个配置场景都有对应的完整 YAML 文件快照**
   - [ ] 生成的 YAML 文件通过语法验证
   - [ ] **Verify 快照 diff 报告清晰易读**

2. **代码质量**
   - [ ] `generator.ts` 为纯函数，无副作用
   - [ ] 类型定义覆盖率 100%（TypeScript strict mode）
   - [ ] ESLint 和 TypeScript 编译无警告

3. **测试指标**
   - [ ] 核心生成逻辑的单元测试覆盖率 ≥ 80%
   - [ ] BDD 场景测试至少覆盖 15 个关键场景
   - [ ] 所有测试在 CI 环境中稳定运行（flaky rate < 2%）

4. **文档完整性**
   - [ ] 提供测试编写指南
   - [ ] 更新项目文档，说明测试策略
   - [ ] 包含贡献者指南中的测试部分

## 实施计划 (Implementation Plan)

详见 `tasks.md` 文件，包含以下主要阶段：

1. **分析阶段**：分析现有实现，建立基线快照
2. **重构阶段**：优化 `generator.ts`，建立服务层
3. **测试阶段**：编写 BDD 场景测试和 Verify 快照测试
4. **验证阶段**：运行所有测试，确保功能正确性
5. **文档阶段**：编写测试指南和更新项目文档

## 相关规范 (Related Specifications)

此提案影响以下规范：

- **docker-compose-generator**：修改现有规范，添加可测试性相关要求
  - 新增 Requirement: 生成逻辑可测试性
  - 新增 Requirement: BDD 测试覆盖
  - 新增 Requirement: 快照验证

详见 `specs/docker-compose-generator/spec.md` 中的变更说明。
