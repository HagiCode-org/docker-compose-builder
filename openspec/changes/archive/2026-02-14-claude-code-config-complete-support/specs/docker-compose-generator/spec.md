## ADDED Requirements

### Requirement: Claude Code 完整配置支持

系统 SHALL 在 full-custom 配置模式中支持完整的 Claude Code 配置选项，允许用户配置模型版本、主机配置挂载和实验性功能。

#### Scenario: Claude 模型版本配置

- **WHEN** 用户在 full-custom 模式下配置 Claude Code 模型
- **AND** 用户提供了 Sonnet 模型版本
- **THEN** 系统 SHALL 在生成的 Docker Compose 配置中添加 `ANTHROPIC_SONNET_MODEL` 环境变量
- **AND** 环境变量值 SHALL 使用用户提供的模型版本

- **WHEN** 用户在 full-custom 模式下配置 Claude Code 模型
- **AND** 用户提供了 Opus 模型版本
- **THEN** 系统 SHALL 在生成的 Docker Compose 配置中添加 `ANTHROPIC_OPUS_MODEL` 环境变量
- **AND** 环境变量值 SHALL 使用用户提供的模型版本

- **WHEN** 用户在 full-custom 模式下配置 Claude Code 模型
- **AND** 用户提供了 Haiku 模型版本
- **THEN** 系统 SHALL 在生成的 Docker Compose 配置中添加 `ANTHROPIC_HAIKU_MODEL` 环境变量
- **AND** 环境变量值 SHALL 使用用户提供的模型版本

- **WHEN** 用户未提供任何模型版本配置
- **THEN** 系统 SHALL 不输出任何模型版本环境变量
- **AND** 容器 SHALL 使用默认模型版本

#### Scenario: 主机配置挂载

- **WHEN** 用户在 full-custom 模式下配置主机配置挂载
- **AND** 用户提供了配置挂载路径
- **THEN** 系统 SHALL 在生成的 Docker Compose 配置中添加 `CLAUDE_CONFIG_MOUNT_PATH` 环境变量
- **AND** 环境变量值 SHALL 使用用户提供的路径

- **WHEN** 用户在 full-custom 模式下启用主机配置
- **AND** 用户启用了主机配置功能
- **THEN** 系统 SHALL 在生成的 Docker Compose 配置中添加 `CLAUDE_HOST_CONFIG_ENABLED` 环境变量
- **AND** 环境变量值 SHALL 设置为 "true" 或相应的启用值

- **WHEN** 用户未配置主机挂载相关选项
- **THEN** 系统 SHALL 不输出 `CLAUDE_CONFIG_MOUNT_PATH` 或 `CLAUDE_HOST_CONFIG_ENABLED` 环境变量

#### Scenario: Agent Teams 实验性功能

- **WHEN** 用户在 full-custom 模式下配置 Agent Teams 功能
- **AND** 用户提供了 Agent Teams 配置值
- **THEN** 系统 SHALL 在生成的 Docker Compose 配置中添加 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 环境变量
- **AND** 环境变量值 SHALL 使用用户提供的配置值

- **WHEN** 用户未配置 Agent Teams 功能
- **THEN** 系统 SHALL 不输出 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 环境变量

#### Scenario: 环境变量输出顺序

- **WHEN** 系统生成 hagicode 服务的环境变量部分
- **THEN** Claude Code 环境变量 SHALL 按以下顺序输出：
  1. `ANTHROPIC_AUTH_TOKEN`（现有）
  2. `ANTHROPIC_URL`（现有，如适用）
  3. `ANTHROPIC_SONNET_MODEL`（新增，如配置）
  4. `ANTHROPIC_OPUS_MODEL`（新增，如配置）
  5. `ANTHROPIC_HAIKU_MODEL`（新增，如配置）
  6. `CLAUDE_CONFIG_MOUNT_PATH`（新增，如配置）
  7. `CLAUDE_HOST_CONFIG_ENABLED`（新增，如配置）
  8. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`（新增，如配置）

#### Scenario: quick-start 模式不受影响

- **WHEN** 用户使用 quick-start 模式生成配置
- **THEN** 系统 SHALL 保持现有的简化配置行为
- **AND** 不显示任何新增的 Claude Code 配置字段
- **AND** 生成的配置 SHALL 与现有行为完全一致

#### Scenario: 向后兼容性

- **WHEN** 现有用户使用已有的配置生成 Docker Compose 文件
- **THEN** 所有新增字段 SHALL 为可选类型
- **AND** 未提供新字段值时 SHALL 不影响现有功能
- **AND** 现有配置 SHALL 继续正常工作
