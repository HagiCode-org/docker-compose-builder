## ADDED Requirements

### Requirement: Claude 配置数据持久化

系统 SHALL 在生成的 Docker Compose 配置中为 Claude Code 配置数据提供持久化支持，确保用户的配置、会话历史和插件数据在容器重启后得以保留。

#### Scenario: 命名卷声明

- **WHEN** 系统生成 Docker Compose 配置的 volumes 部分
- **THEN** 系统 SHALL 声明名为 `claude-data` 的命名卷
- **AND** 该卷使用本地驱动程序

#### Scenario: Claude 配置目录挂载

- **WHEN** 系统生成 hagicode 服务配置
- **THEN** 系统 SHALL 在服务 volumes 中添加 `claude-data:/home/hagicode/.claude` 挂载配置
- **AND** 该挂载 SHALL 在工作目录和应用数据卷之后
- **AND** 卷路径 SHALL 与容器内 Claude Code 配置目录完全匹配

#### Scenario: 所有部署模式持久化

- **WHEN** 用户使用任何部署模式（快速体验或完整自定义）生成配置
- **THEN** 生成的配置 SHALL 包含 Claude 配置数据持久化卷
- **AND** 快速体验模式和完整自定义模式 SHALL 使用相同的卷名称

#### Scenario: 跨操作系统支持

- **WHEN** 用户选择 Windows 或 Linux 作为主机操作系统
- **THEN** 生成的配置 SHALL 包含相同的 Claude 配置数据持久化卷
- **AND** 卷挂载路径 SHALL 保持 `/home/hagicode/.claude` 不变
