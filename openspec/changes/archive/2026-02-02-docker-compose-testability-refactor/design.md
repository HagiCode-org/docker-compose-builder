# Docker Compose 生成逻辑可测试性重构 - 设计文档

## 架构概述 (Architecture Overview)

### 当前架构

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
├─────────────────────────────────────────────────────────────┤
│  DockerComposeGenerator.tsx                                  │
│       ├── ConfigForm.tsx (Redux State Management)            │
│       └── ConfigPreview.tsx (Calls generateYAML)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
├─────────────────────────────────────────────────────────────┤
│  generator.ts                                                │
│    ├── generateYAML(config, language)                       │
│    └── (Already separated, but needs improvement)            │
│                                                              │
│  types.ts                                                    │
│    ├── DockerComposeConfig interface                        │
│    └── Registry constants                                   │
└─────────────────────────────────────────────────────────────┘
```

### 目标架构

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
├─────────────────────────────────────────────────────────────┤
│  DockerComposeGenerator.tsx                                  │
│       ├── ConfigForm.tsx (Redux State Management)            │
│       └── ConfigPreview.tsx                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (NEW)                        │
├─────────────────────────────────────────────────────────────┤
│  services/DockerComposeService.ts                           │
│    ├── validateConfig(config): ValidationResult             │
│    ├── generateComposeFile(config): GenerateResult          │
│    └── parseYAML(yaml): ComposeConfigObject                 │
│                                                              │
│  generator.ts (REFACTORED)                                  │
│    ├── buildServicesSection(config)                         │
│    ├── buildVolumesSection(config)                          │
│    ├── buildNetworksSection(config)                         │
│    └── buildHeader(config, language)                        │
│                                                              │
│  validation.ts (NEW)                                        │
│    ├── validateRequiredFields(config)                       │
│    ├── validatePortNumbers(config)                          │
│    └── validatePaths(config)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Testing Layer (NEW)                      │
├─────────────────────────────────────────────────────────────┤
│  __tests__/                                                  │
│    ├── unit/                                                 │
│    │   ├── generator.test.ts                                │
│    │   └── validation.test.ts                               │
│    ├── bdd/                                                 │
│    │   ├── quick-start-scenarios.test.ts                    │
│    │   ├── full-custom-scenarios.test.ts                    │
│    │   └── edge-cases.test.ts                               │
│    └── __verify__/                                           │
│        ├── quick-start-snapshots/                           │
│        ├── full-custom-snapshots/                            │
│        └── api-provider-snapshots/                          │
└─────────────────────────────────────────────────────────────┘
```

## 设计决策 (Design Decisions)

### 决策 1：保持纯函数特性

**问题**：当前的 `generateYAML` 函数是否为纯函数？

**分析**：
- ✅ 函数的输出仅依赖于输入参数（`config`, `language`）
- ✅ 函数没有修改外部状态
- ⚠️ 函数内部使用 `new Date()` 生成时间戳，导致每次调用输出不同

**决策**：
- 将 `new Date()` 作为可选参数注入，默认值为当前时间
- 在测试中可以注入固定时间，确保输出可预测

**实现示例**：
```typescript
export function generateYAML(
  config: DockerComposeConfig,
  language: string = 'zh-CN',
  now: Date = new Date() // 可注入，用于测试
): string {
  const lines: string[] = [];
  lines.push(`# Generated at: ${now.toLocaleString(language === 'zh-CN' ? 'zh-CN' : 'en-US')}`);
  // ...
}
```

### 决策 2：服务层抽象

**问题**：是否需要创建服务层（`DockerComposeService`）？

**选项**：
- **选项 A**：保持当前结构，仅优化 `generator.ts`
- **选项 B**：创建服务层，封装生成和验证逻辑

**决策**：选择 **选项 A**（最小化重构）

**理由**：
1. 当前 `generateYAML` 已经是独立函数，无需额外封装
2. 服务层会增加间接层，但带来的收益有限
3. 保持简单，仅添加必要的 `validation.ts` 模块

**未来扩展**：
- 如果未来需要支持多种编排格式（K8s, Helm 等），再考虑引入服务层

### 决策 3：测试框架选择

**需求**：
- BDD 风格的场景测试
- 快照测试（Verify）
- 与 Vitest 集成

**技术选型**：

| 工具 | 用途 | 理由 |
|------|------|------|
| Vitest | 单元测试框架 | 项目已配置，与 Vite 深度集成 |
| `vitest-when` | BDD 语法糖 | 提供 Given-When-Then 语法 |
| Verify | 快照测试 | 专门用于验证生成文件的内容 |
| `js-yaml` | YAML 验证 | 确保生成的 YAML 语法正确 |

**BDD 测试结构示例**：
```typescript
describe('Docker Compose Generation: Quick Start Profile', () => {
  const when = whenFor(cases);

  when('quick start profile with minimal config', async () => {
    const config = createQuickStartConfig();
    const result = generateYAML(config, 'zh-CN');

    then('output should contain required sections', () => {
      expect(result).toContain('services:');
      expect(result).toContain('hagicode:');
      expect(result).toContain('postgres:');
    });

    then('output should hide advanced configurations', () => {
      expect(result).not.toContain('PUID:');
      expect(result).not.toContain('PGID:');
    });
  });
});
```

### 决策 4：验证模块设计

**问题**：如何设计输入验证模块？

**需求**：
- 验证必填字段
- 验证端口号范围
- 验证路径格式
- 提供清晰的错误信息

**设计**：

```typescript
// src/lib/docker-compose/validation.ts
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: keyof DockerComposeConfig;
  message: string;
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'OUT_OF_RANGE';
}

export function validateConfig(config: DockerComposeConfig): ValidationResult {
  const errors: ValidationError[] = [];

  // 验证必填字段
  validateRequiredFields(config, errors);

  // 验证端口号
  validatePortNumbers(config, errors);

  // 验证路径
  validatePaths(config, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}
```

## 模块拆分 (Module Breakdown)

### generator.ts 重构

**当前问题**：
- 单个函数过长（186 行）
- 难以针对不同部分进行独立测试

**拆分方案**：

```typescript
// 原始函数
export function generateYAML(config: DockerComposeConfig, language: string): string

// 拆分后的函数
export function generateYAML(config: DockerComposeConfig, language: string, now?: Date): string

// 内部辅助函数（可独立测试）
function buildHeader(config: DockerComposeConfig, language: string, now: Date): string[]
function buildServicesSection(config: DockerComposeConfig): string[]
function buildAppService(config: DockerComposeConfig): string[]
function buildPostgresService(config: DockerComposeConfig): string[]
function buildVolumesSection(config: DockerComposeConfig): string[]
function buildNetworksSection(config: DockerComposeConfig): string[]
```

**好处**：
- 每个函数职责单一，易于测试
- 可针对每个部分编写独立的单元测试
- 便于后续扩展（如添加新的服务类型）

### validation.ts 新模块

**职责**：
- 验证配置的完整性和正确性
- 提供清晰的错误信息
- 支持多语言错误提示

**导出函数**：
```typescript
export function validateConfig(config: DockerComposeConfig, language: string): ValidationResult
export function validateRequiredFields(config: DockerComposeConfig): ValidationError[]
export function validatePortNumbers(config: DockerComposeConfig): ValidationError[]
export function validatePaths(config: DockerComposeConfig, hostOS: HostOS): ValidationError[]
export function validateApiProvider(config: DockerComposeConfig): ValidationError[]
```

## 测试策略 (Testing Strategy)

### 测试金字塔

```
                    ┌─────────────┐
                    │   E2E Tests │  (UI 集成测试，不在本次范围)
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │    BDD Scenario Tests   │  (15+ 场景)
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │      Verify Snapshot Tests        │  (20+ 快照)
         └─────────────────┬─────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │           Unit Tests (80%+ coverage)         │
    │  - generator.test.ts                         │
    │  - validation.test.ts                        │
    │  - types.test.ts                             │
    └──────────────────────────────────────────────┘
```

### BDD 场景覆盖

#### 核心场景（必须覆盖）

1. **快速体验模式**
   - 最小配置生成
   - 默认值处理
   - API 提供商切换（Anthropic / ZAI / Custom）

2. **完整自定义模式**
   - Windows 部署配置
   - Linux 部署配置（Root 用户）
   - Linux 部署配置（非 Root 用户，含 PUID/PGID）

3. **数据库配置**
   - 内部 PostgreSQL（Named Volume）
   - 内部 PostgreSQL（Bind Mount）
   - 外部数据库连接

4. **镜像源切换**
   - Docker Hub
   - Azure Container Registry
   - 阿里云 ACR

5. **边界条件**
   - 空字符串处理
   - 端口号边界（0, 65535, 超出范围）
   - 路径格式验证（Windows vs Linux）

### Verify 快照测试（核心验证策略）

**设计原则**：
- **完整文件验证**：Verify 工具用于验证整个生成的 YAML 文件，而非部分片段
- **整体验证**：通过快照对比确保文件级别的输出一致性和正确性
- **快速反馈**：任何生成逻辑的变更都会立即反映在快照 diff 中
- **易于审查**：快照差异清晰展示，便于代码 review 和回归检测

**快照目录结构**：
```
__verify__/
├── quick-start/
│   ├── default-zh-CN.txt          # 完整的 YAML 文件快照
│   ├── default-en-US.txt          # 完整的 YAML 文件快照
│   ├── zai-provider-zh-CN.txt     # 完整的 YAML 文件快照
│   └── anthropic-provider-zh-CN.txt  # 完整的 YAML 文件快照
├── full-custom/
│   ├── windows-internal-db-zh-CN.txt
│   ├── linux-internal-db-puid-zh-CN.txt
│   └── linux-external-db-zh-CN.txt
└── edge-cases/
    ├── empty-port.txt
    ├── special-characters.txt
    └── max-length-values.txt
```

**快照文件内容**：
- 每个快照文件包含**完整的 YAML 输出**
- 从注释头到 volumes/networks 定义的完整内容
- 便于直观验证整个文件的正确性

**快照更新策略**：
- 初始建立基线快照（完整文件）
- 代码变更时，Review 快照差异（文件级别 diff）
- 仅在有意的格式变更时更新快照
- **使用 Verify 的 diff 工具快速定位变更位置**

## 技术实现细节 (Implementation Details)

### Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
});
```

### Verify 配置

**配置说明**：
- `extension: "txt"`：快照文件使用 `.txt` 扩展名，存储完整的 YAML 内容
- `scrubbers`：移除动态内容（如时间戳），确保快照可重复验证
- **完整文件存储**：每个快照包含从 `generateYAML()` 返回的完整字符串

```json
// verify.config.json
{
  "traitParameters": [
    { "name": "config", "extension": "txt" }
  ],
  "scrubbers": [
    {
      "name": "timestamps",
      "regex": "# Generated at: .*",
      "replacement": "# Generated at: [FIXED_TIMESTAMP]"
    }
  ]
}
```

**Verify 测试示例**（完整文件验证）：
```typescript
// src/lib/docker-compose/__tests__/__verify__/quick-start.test.ts
import { verify } from 'verifyjs';
import { generateYAML } from '../../generator';
import { createQuickStartConfig } from '../helpers';

describe('Quick Start Profiles - Complete File Verification', () => {
  it('should generate valid YAML for default quick start config', async () => {
    const config = createQuickStartConfig();
    const yaml = generateYAML(config, 'zh-CN', new Date('2024-01-01'));

    // Verify 整个文件内容
    await verify('quick-start/default-zh-CN', yaml);
  });

  it('should generate valid YAML for ZAI provider', async () => {
    const config = createQuickStartConfig({ apiProvider: 'zai' });
    const yaml = generateYAML(config, 'zh-CN', new Date('2024-01-01'));

    // Verify 整个文件内容
    await verify('quick-start/zai-provider-zh-CN', yaml);
  });
});
```

### 测试文件模板

```typescript
// src/lib/docker-compose/__tests__/unit/generator.test.ts
import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import { createMockConfig } from '../helpers';

describe('generateYAML', () => {
  it('should generate valid YAML for quick start config', () => {
    const config = createMockConfig({ profile: 'quick-start' });
    const result = generateYAML(config, 'zh-CN', new Date('2024-01-01'));

    expect(result).toContain('services:');
    expect(result).toContain('hagicode:');
    expect(result).toContain('# Generated at: 2024-01-01');
  });

  it('should include PUID/PGID for non-root Linux users', () => {
    const config = createMockConfig({
      profile: 'full-custom',
      hostOS: 'linux',
      workdirCreatedByRoot: false,
      puid: '1000',
      pgid: '1000'
    });
    const result = generateYAML(config);

    expect(result).toContain('PUID: 1000');
    expect(result).toContain('PGID: 1000');
  });
});
```

## 迁移策略 (Migration Strategy)

### 阶段 1：建立基线（完整文件快照）

1. **为当前实现创建 Verify 快照**
   - 针对所有主要配置场景生成完整的 YAML 文件快照
   - 使用 Verify 工具的 `verify()` 函数存储整个文件内容
   - 确保快照覆盖所有配置组合

2. **验证快照完整性**
   - 手动审查每个快照文件的内容
   - 确认快照包含完整的 YAML 输出（从注释到 volumes/networks）
   - 检查快照文件命名和组织结构

3. **保存基线快照到版本控制**
   - 将快照文件提交到 Git 仓库
   - 确保快照文件作为代码审查的一部分

### 阶段 2：重构 generator.ts

1. **提取辅助函数，保持输出不变**
   - 在重构过程中，每次修改后运行 Verify 测试
   - 对比当前输出与基线快照，确保整个文件完全一致
   - 使用 Verify 的 diff 工具快速定位任何差异

2. **运行 Verify 测试，确保快照匹配**
   - 每次重构迭代后，运行 `npm run test:verify`
   - 确保所有快照测试通过（文件级别匹配）
   - 如有差异，审查是否为预期变更

3. **逐步重构，每次提交后验证快照**
   - 小步提交，每次提交都通过 Verify 测试
   - 保持快照验证作为 CI/CD 的必经步骤

### 阶段 3：添加测试

1. 编写单元测试（目标覆盖率 80%）
2. 编写 BDD 场景测试（至少 15 个场景）
3. 集成到 CI 流程

### 阶段 4：文档和培训

1. 编写测试贡献指南
2. 更新项目 README
3. 为团队成员提供培训

## 未来扩展 (Future Extensions)

### 短期（1-3 个月）

- 支持更多 Docker Compose 配置选项（如 healthcheck, deploy）
- 添加配置预设模板（Production, Development, Staging）
- 提供 CLI 工具生成配置

### 中期（3-6 个月）

- 支持生成 Kubernetes YAML
- 支持生成 Helm Chart
- 添加配置迁移工具（从旧版本升级）

### 长期（6-12 个月）

- 提供可视化配置编辑器（拖拽式）
- 支持多容器编排（微服务架构）
- 集成到 CI/CD 流程
