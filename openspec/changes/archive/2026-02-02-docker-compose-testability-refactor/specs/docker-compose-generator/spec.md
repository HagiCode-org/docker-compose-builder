# docker-compose-generator Specification Delta

## MODIFIED Requirements

### Requirement: Docker Compose 配置生成

系统 SHALL 提供 Docker Compose 配置的可视化生成功能，允许用户通过表单界面配置各种参数，并自动生成相应的 YAML 配置文件。生成逻辑 SHALL 通过纯函数实现，确保可测试性和可维护性。

#### Scenario: 基础配置生成 (MODIFIED)
- **WHEN** 用户打开 Docker Compose 生成器页面
- **THEN** 系统显示包含默认配置的表单和配置预览
- **AND** 所有 UI 文本 SHALL 支持多语言显示
- **AND** 用户可以修改配置参数
- **AND** 预览区域实时更新 YAML 内容
- **AND** 生成逻辑 SHALL 通过纯函数实现，无副作用

#### Scenario: 完整配置生成 (MODIFIED)
- **WHEN** 用户填写所有配置项（包括基础设置、数据库配置、API 配置和高级选项）
- **THEN** 系统生成完整的 Docker Compose 配置
- **AND** 配置包含所有服务、网络、卷和环境变量定义
- **AND** 表单标签和提示文本 SHALL 支持多语言
- **AND** 生成的配置 SHALL 通过 Verify 快照测试验证

## ADDED Requirements

### Requirement: 生成逻辑可测试性

系统 SHALL 确保 Docker Compose 生成逻辑具有高度的可测试性，所有核心生成逻辑可独立于 UI 进行单元测试和集成测试。

#### Scenario: 纯函数生成逻辑
- **GIVEN** 一个有效的 Docker Compose 配置对象
- **WHEN** 调用 `generateYAML(config, language, now?)` 函数
- **THEN** 函数 SHALL 返回预测性的 YAML 字符串输出
- **AND** 函数 SHALL 无副作用（不修改输入参数，不依赖外部状态）
- **AND** 相同输入 SHALL 始终产生相同输出（除时间戳外）
- **AND** 时间戳可通过 `now` 参数注入，以支持测试

#### Scenario: 生成函数模块化
- **GIVEN** 需要测试生成逻辑的特定部分
- **WHEN** 调用内部辅助函数（如 `buildServicesSection`, `buildVolumesSection`）
- **THEN** 辅助函数 SHALL 可独立导出和测试
- **AND** 每个辅助函数 SHALL 职责单一
- **AND** 辅助函数 SHALL 接受明确的输入参数，返回可预测的输出

#### Scenario: 输入验证分离
- **GIVEN** 一个可能包含无效数据的配置对象
- **WHEN** 调用 `validateConfig(config, language)` 函数
- **THEN** 系统 SHALL 返回验证结果对象（`ValidationResult`）
- **AND** 验证结果 SHALL 包含错误列表和有效性标志
- **AND** 验证逻辑 SHALL 独立于生成逻辑
- **AND** 验证错误信息 SHALL 支持多语言

### Requirement: BDD 测试覆盖

系统 SHALL 通过行为驱动开发（BDD）方式验证各种生成场景，确保核心逻辑的正确性和稳定性。

#### Scenario: 快速体验模式测试
- **GIVEN** 用户选择"快速体验"模式
- **AND** 仅填写必填字段（工作目录、HTTP 端口、API Token、镜像注册表、API 提供商）
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 包含服务定义
- **AND** YAML SHALL 包含内部 PostgreSQL 服务
- **AND** YAML SHALL NOT 包含 PUID/PGID 配置
- **AND** YAML SHALL NOT 包含容器名称、镜像标签等高级配置
- **AND** 环境变量 SHALL 正确设置（包括 API Token）

#### Scenario: 完整自定义模式 - Windows 测试
- **GIVEN** 用户选择"完整自定义"模式
- **AND** 主机操作系统设置为 Windows
- **AND** 配置内部 PostgreSQL 数据库
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 包含所有服务定义
- **AND** 工作目录路径 SHALL 使用 Windows 格式（如 `C:\\repos`）
- **AND** 卷路径 SHALL 使用 Windows 格式
- **AND** YAML SHALL NOT 包含 PUID/PGID 配置

#### Scenario: 完整自定义模式 - Linux Root 用户测试
- **GIVEN** 用户选择"完整自定义"模式
- **AND** 主机操作系统设置为 Linux
- **AND** 用户勾选"工作目录由 root 创建"
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 包含所有服务定义
- **AND** 工作目录路径 SHALL 使用 Linux 格式（如 `/home/user/repos`）
- **AND** YAML SHALL NOT 包含 PUID/PGID 配置

#### Scenario: 完整自定义模式 - Linux 非Root 用户测试
- **GIVEN** 用户选择"完整自定义"模式
- **AND** 主机操作系统设置为 Linux
- **AND** 用户未勾选"工作目录由 root 创建"
- **AND** 配置 PUID=1000, PGID=1000
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 包含所有服务定义
- **AND** YAML SHALL 包含 `PUID: 1000`
- **AND** YAML SHALL 包含 `PGID: 1000`

#### Scenario: API 提供商切换测试
- **GIVEN** 用户选择不同的 API 提供商
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 正确设置 API 环境变量
- **AND** 对于 Anthropic 官方 API，YAML SHALL 仅包含 `ANTHROPIC_AUTH_TOKEN`
- **AND** 对于 ZAI，YAML SHALL 包含 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_URL`
- **AND** 对于自定义 API，YAML SHALL 包含 `ANTHROPIC_AUTH_TOKEN` 和用户提供的 `ANTHROPIC_URL`

#### Scenario: 镜像源切换测试
- **GIVEN** 用户选择不同的镜像注册表
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 使用正确的镜像前缀
- **AND** 对于 Docker Hub，镜像 SHALL 为 `newbe36524/hagicode:latest`
- **AND** 对于阿里云 ACR，镜像 SHALL 为 `registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:latest`
- **AND** 对于 Azure ACR，镜像 SHALL 为 `hagicode.azurecr.io/hagicode:latest`

#### Scenario: 内部数据库 - Named Volume 测试
- **GIVEN** 用户选择内部 PostgreSQL
- **AND** 卷类型设置为"命名卷"
- **AND** 卷名称设置为 `postgres-data`
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 包含 postgres 服务
- **AND** postgres 服务 SHALL 包含卷挂载 `postgres-data:/bitnami/postgresql`
- **AND** YAML SHALL 包含 volumes 定义 `postgres-data:`

#### Scenario: 内部数据库 - Bind Mount 测试
- **GIVEN** 用户选择内部 PostgreSQL
- **AND** 卷类型设置为"绑定挂载"
- **AND** 卷路径设置为 `/data/postgres`
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL 包含 postgres 服务
- **AND** postgres 服务 SHALL 包含卷挂载 `/data/postgres:/bitnami/postgresql`
- **AND** YAML SHALL NOT 包含 volumes 定义

#### Scenario: 外部数据库测试
- **GIVEN** 用户选择外部数据库
- **AND** 配置外部数据库主机、端口、数据库名、用户名、密码
- **WHEN** 生成 Docker Compose 配置
- **THEN** 生成的 YAML SHALL NOT 包含 postgres 服务
- **AND** 应用服务的连接字符串 SHALL 使用外部数据库配置
- **AND** 应用服务 SHALL NOT 包含 `depends_on` 配置

#### Scenario: 边界条件 - 空字符串处理
- **GIVEN** 配置中包含可选字段的空字符串（如 `volumeName: ""`）
- **WHEN** 生成 Docker Compose 配置
- **THEN** 系统 SHALL 使用默认值替代空字符串
- **AND** 生成的 YAML SHALL 不包含空值

#### Scenario: 边界条件 - 端口号边界测试
- **GIVEN** 用户输入边界端口号（0, 65535, 或超出范围）
- **WHEN** 调用 `validatePortNumbers(config)` 函数
- **THEN** 系统 SHALL 返回相应的验证错误
- **AND** 错误信息 SHALL 明确指出端口的有效范围（1-65535）

### Requirement: Verify 快照验证

系统 SHALL 使用 Verify 快照测试工具确保生成的 YAML 文件在各种配置场景下的正确性和稳定性。

#### Scenario: 快照基线建立
- **GIVEN** 一个已知的稳定配置
- **WHEN** 首次运行 Verify 测试
- **THEN** 系统 SHALL 生成初始快照文件
- **AND** 快照文件 SHALL 包含完整的 YAML 输出
- **AND** 快照文件 SHALL 按配置场景组织（如 `quick-start/default-zh-CN.txt`）

#### Scenario: 快照验证通过
- **GIVEN** 已有快照基线
- **AND** 代码修改未影响生成逻辑
- **WHEN** 运行 Verify 测试
- **THEN** 测试 SHALL 通过（当前输出与快照匹配）
- **AND** 系统 SHALL 报告所有快照验证成功

#### Scenario: 快照差异检测
- **GIVEN** 已有快照基线
- **AND** 代码修改导致生成输出变化
- **WHEN** 运行 Verify 测试
- **THEN** 系统 SHALL 报告快照不匹配
- **AND** 系统 SHALL 显示差异内容（diff）
- **AND** 开发者 SHALL 审查差异，确认是否为预期变更

#### Scenario: 时间戳处理
- **GIVEN** 生成的 YAML 包含时间戳注释
- **WHEN** 运行 Verify 测试
- **THEN** 系统 SHALL 使用固定的测试时间（如 `2024-01-01`）
- **AND** 时间戳 SHALL 不影响快照验证

#### Scenario: 多语言快照
- **GIVEN** 相同配置但语言不同（中文 vs 英文）
- **WHEN** 生成 YAML 配置
- **THEN** 生成的快照 SHALL 分别保存为 `config-zh-CN.txt` 和 `config-en-US.txt`
- **AND** 快照 SHALL 正确反映语言差异（如注释文本、日期格式）

### Requirement: 测试覆盖率

系统 SHALL 确保核心生成逻辑具有充分的测试覆盖率，以保障代码质量和稳定性。

#### Scenario: 单元测试覆盖率
- **GIVEN** 核心生成逻辑模块（generator.ts, validation.ts）
- **WHEN** 运行单元测试覆盖率检查
- **THEN** 语句覆盖率 SHALL ≥ 80%
- **AND** 分支覆盖率 SHALL ≥ 75%
- **AND** 函数覆盖率 SHALL ≥ 90%

#### Scenario: BDD 场景覆盖
- **GIVEN** Docker Compose 生成器的所有主要使用场景
- **WHEN** 运行 BDD 测试套件
- **THEN** 至少 15 个核心场景 SHALL 有对应的 BDD 测试
- **AND** 测试 SHALL 覆盖快速体验模式和完整自定义模式
- **AND** 测试 SHALL 覆盖所有 API 提供商
- **AND** 测试 SHALL 覆盖所有镜像注册表
- **AND** 测试 SHALL 覆盖边界条件和错误处理

#### Scenario: 测试稳定性
- **GIVEN** CI/CD 环境中运行的测试套件
- **WHEN** 多次运行测试（100 次以上）
- **THEN** 测试失败率 SHALL < 2%（Flaky test rate）
- **AND** 所有测试 SHALL 独立运行，无相互依赖
- **AND** 测试 SHALL 不依赖特定时区或系统环境

### Requirement: 配置验证

系统 SHALL 提供独立的配置验证模块，在生成前检查配置的有效性。

#### Scenario: 必填字段验证
- **GIVEN** 一个配置对象
- **WHEN** 调用 `validateConfig(config, language)` 函数
- **THEN** 系统 SHALL 验证所有必填字段
- **AND** 必填字段包括：`httpPort`, `anthropicAuthToken`, `imageRegistry`, `anthropicApiProvider`, `workdirPath`
- **AND** 如果字段缺失，系统 SHALL 返回相应的验证错误
- **AND** 错误信息 SHALL 支持多语言

#### Scenario: 端口号格式验证
- **GIVEN** 一个配置对象，包含 `httpPort` 字段
- **WHEN** 调用 `validatePortNumbers(config)` 函数
- **THEN** 系统 SHALL 验证端口号在有效范围内（1-65535）
- **AND** 如果端口号无效，系统 SHALL 返回格式错误
- **AND** 错误信息 SHALL 包含有效范围提示

#### Scenario: 路径格式验证
- **GIVEN** 一个配置对象，包含 `workdirPath` 和 `volumePath` 字段
- **WHEN** 调用 `validatePaths(config, hostOS)` 函数
- **THEN** 系统 SHALL 根据 `hostOS` 验证路径格式
- **AND** 对于 Windows，系统 SHALL 接受 `C:\\path` 格式
- **AND** 对于 Linux，系统 SHALL 接受 `/path` 格式
- **AND** 如果路径格式不匹配，系统 SHALL 返回格式错误

#### Scenario: API 提供商验证
- **GIVEN** 一个配置对象
- **AND** `anthropicApiProvider` 设置为 `custom`
- **WHEN** 调用 `validateApiProvider(config)` 函数
- **THEN** 系统 SHALL 验证 `anthropicUrl` 字段已填写
- **AND** 如果 URL 缺失或格式无效，系统 SHALL 返回验证错误
- **AND** 错误信息 SHALL 提示用户提供有效的 API 端点 URL
