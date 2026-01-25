## MODIFIED Requirements

### Requirement: 配置模式选择 (Configuration Profile Selection)

系统 SHALL 提供配置模式选择功能，允许用户在"快速体验"和"完整自定义"两种模式之间切换，以适应不同用户的需求。

#### Scenario: 快速体验模式

- **WHEN** 用户选择"快速体验"模式
- **THEN** 系统显示以下配置项：
  - 工作目录路径 (必填)
  - HTTP 端口 (必填)
  - API Token (必填)
  - 镜像注册表 (必填)
  - API 提供商 (新增，必填)
- **AND** 当用户选择"自定义 API 端点"作为 API 提供商时：
  - 系统额外显示 API 端点 URL 输入框 (必填)
- **AND** 系统隐藏以下高级配置项：
  - 容器名称、镜像标签、主机操作系统
  - 数据库配置（使用默认内部 PostgreSQL）
  - 许可证密钥类型
  - 卷类型、卷名称/路径
  - Linux 用户权限 (PUID/PGID)
- **AND** 所有标签和描述文本 SHALL 支持多语言

#### Scenario: 完整自定义模式 - Windows 部署

- **WHEN** 用户选择"完整自定义"模式
- **AND** 主机操作系统配置为 Windows
- **THEN** 系统显示所有配置项 EXCEPT Linux 用户权限 (PUID/PGID) 配置
- **AND** 用户可以完全控制所有 Windows 相关的 Docker Compose 配置参数
- **AND** 系统隐藏 PUID/PGID 输入字段，避免用户混淆
- **AND** 所有标签和描述文本 SHALL 支持多语言

#### Scenario: 完整自定义模式 - Linux 部署 (Root 用户)

- **WHEN** 用户选择"完整自定义"模式
- **AND** 主机操作系统配置为 Linux
- **AND** 用户选择"工作目录由 root 创建"选项
- **THEN** 系统显示所有配置项 EXCEPT Linux 用户权限 (PUID/PGID) 配置
- **AND** 系统显示信息提示，说明 root 用户不需要配置 PUID/PGID
- **AND** 所有标签和描述文本 SHALL 支持多语言

#### Scenario: 完整自定义模式 - Linux 部署 (非 Root 用户)

- **WHEN** 用户选择"完整自定义"模式
- **AND** 主机操作系统配置为 Linux
- **AND** 用户未选择"工作目录由 root 创建"选项
- **THEN** 系统显示所有配置项 INCLUDING Linux 用户权限 (PUID/PGID) 配置
- **AND** PUID 和 PGID 字段 SHALL 显示默认值 1000
- **AND** 系统显示权限配置的用途说明
- **AND** 所有标签和描述文本 SHALL 支持多语言

#### Scenario: 模式切换

- **WHEN** 用户在两种配置模式之间切换
- **THEN** 系统保留共享字段的用户输入：
  - 工作目录路径
  - HTTP 端口
  - API Token
  - 镜像注册表
  - API 提供商
  - API 端点 URL (如果用户选择了自定义提供商)
- **AND** 隐藏字段使用预定义的默认值
- **AND** 模式选择器 SHALL 支持多语言显示

#### Scenario: 部署模式切换

- **WHEN** 用户在 Windows 和 Linux 部署模式之间切换
- **THEN** 系统动态显示或隐藏 PUID/PGID 配置字段
- **AND** 当切换到 Windows 时隐藏权限配置
- **AND** 当切换到 Linux 时根据用户类型（root/非 root）决定是否显示
- **AND** 系统保留已输入的权限配置值，以便在模式间切换时不丢失用户输入