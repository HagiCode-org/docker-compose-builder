# docker-compose-generator Specification Delta

## ADDED Requirements

### Requirement: SQLite Database Support

系统 SHALL 支持 SQLite 作为数据库选项，为用户提供轻量级的快速启动部署方式。

#### Scenario: 快速启动模式使用 SQLite

- **WHEN** 用户选择"快速体验"模式
- **THEN** 系统默认使用 SQLite 数据库
- **AND** 生成的 Docker Compose 配置 SHALL NOT 包含 PostgreSQL 服务
- **AND** 应用服务环境变量 SHALL 设置:
  - `Database__Provider=sqlite`
  - SQLite 连接字符串: `ConnectionStrings__Default=Data Source=/app/data/hagicode.db`
- **AND** 系统配置 `/app/data` 目录的卷挂载以确保持久化

#### Scenario: 完整自定义模式选择 SQLite

- **WHEN** 用户在"完整自定义"模式中选择 SQLite 数据库
- **THEN** 系统生成不包含 PostgreSQL 服务的配置
- **AND** 系统使用命名卷 `hagicode_data` 挂载到 `/app/data`
- **AND** 容器内路径 `/app/data` 是固定的，用户不可配置
- **AND** 系统 SHALL NOT 显示 SQLite 数据目录配置选项（简化用户体验）

#### Scenario: SQLite 数据持久化

- **WHEN** 用户使用 SQLite 数据库配置
- **THEN** 系统创建命名卷 `hagicode_data` 并挂载到容器的 `/app/data` 路径
- **AND** SQLite 数据库文件 `hagicode.db` 存储在挂载的目录中
- **AND** 容器重启后数据得以保留
- **AND** 挂载路径始终为命名卷模式: `hagicode_data:/app/data`
- **AND** 容器内路径 `/app/data` 是固定的，不由用户配置
- **AND** `hagicode_data:/app/data` 卷在所有配置中始终存在（SQLite 存储 DB 文件，PostgreSQL 配置存储其他应用数据）

### Requirement: 镜像标签策略更新

系统 SHALL 使用 `0` 作为默认镜像标签，替代过时的 `latest` 标签。

#### Scenario: 默认镜像标签

- **WHEN** 用户生成新的 Docker Compose 配置
- **THEN** 系统使用 `0` 作为镜像标签
- **AND** 镜像引用格式为 `[registry]/[image]:0`
- **AND** 标签 `0` 代表最新稳定版本（与 pcode 部署实践对齐）

#### Scenario: 所有配置模式使用新标签

- **WHEN** 用户使用快速启动或完整自定义模式
- **THEN** 生成的配置均使用 `0` 标签
- **AND** 所有镜像注册表 (Docker Hub, ACR, Aliyun ACR) 均使用相同标签

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
  - 数据库配置（**MODIFIED: 默认使用 SQLite 而非内部 PostgreSQL**）
  - 许可证密钥类型
  - 卷类型、卷名称/路径
  - Linux 用户权限 (PUID/PGID)
- **AND** 所有标签和描述文本 SHALL 支持多语言

### Requirement: Docker Compose 配置生成

系统 SHALL 提供 Docker Compose 配置的可视化生成功能，允许用户通过表单界面配置各种参数，并自动生成相应的 YAML 配置文件。

#### Scenario: SQLite 配置生成

- **WHEN** 用户选择 SQLite 作为数据库类型并生成配置
- **THEN** 系统生成包含以下内容的 Docker Compose 配置：
  - hagicode 应用服务环境变量设置:
    - `Database__Provider=sqlite`
    - `ConnectionStrings__Default=Data Source=/app/data/hagicode.db`
  - 命名卷 `hagicode_data` 挂载到 `/app/data` 的配置
  - volumes 部分定义 `hagicode_data` 命名卷
  - 网络配置
- **AND** 配置 SHALL NOT 包含 PostgreSQL 服务
- **AND** 应用服务的 `depends_on` 配置 SHALL 不包含数据库依赖
- **AND** 容器内挂载路径 `/app/data` 是固定的，不由用户配置

#### Scenario: PostgreSQL 配置生成（保留原有功能）

- **WHEN** 用户选择内部或外部 PostgreSQL 并生成配置
- **THEN** 系统生成包含以下内容的 Docker Compose 配置：
  - hagicode 应用服务环境变量设置:
    - `Database__Provider=postgresql` (或 `PostgreSQL`)
    - `ConnectionStrings__Default=Host=postgres;Port=5432;Database=hagicode;Username=postgres;Password=postgres`
  - **命名卷 `hagicode_data` 挂载到 `/app/data`**（用于存储 Orleans grain storage、日志等非数据库数据）
  - PostgreSQL 服务（仅限内部数据库）
  - PostgreSQL 数据卷 `postgres-data`（如使用命名卷）
  - 网络、健康检查和依赖配置
- **AND** `hagicode_data:/app/data` 卷 SHALL 始终存在（无论使用何种数据库类型）
- **AND** volumes 部分 SHALL 始终定义 `hagicode_data:` 命名卷
