# docker-compose-registry Specification

## Purpose
TBD - created by archiving change docker-compose-aliyun-mirror-optimization. Update Purpose after archive.
## Requirements
### Requirement: 支持阿里云 ACR 镜像源选择

项目 SHALL 支持将阿里云 ACR 个人版作为 Docker Compose 部署的镜像源选项。用户 SHALL 能够在配置界面中选择阿里云 ACR，并自动使用对应的镜像地址。

#### Scenario: 用户选择阿里云 ACR 作为镜像源
**Given** 用户正在配置 Docker Compose 部署
**When** 用户在镜像源选择器中选择"阿里云 ACR"选项
**Then** 系统应使用阿里云 ACR 镜像仓库提供的镜像
**And** 应用容器镜像地址应为 `registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:${tag}`
**And** 数据库容器镜像地址应为 `registry.cn-hangzhou.aliyuncs.com/hagicode/bitnami_postgresql:16`

#### Scenario: 显示阿里云 ACR 说明信息
**Given** 用户已选择阿里云 ACR 镜像源
**When** 配置界面加载完成
**Then** 系统应显示该镜像源的说明信息和网络建议
**And** 说明信息应为"阿里云容器镜像服务，国内用户推荐"
**And** 网络建议应为"适合中国大陆用户，提供稳定的镜像加速服务"

### Requirement: 多容器镜像配置支持

项目 SHALL 支持为应用容器和数据库容器配置独立的镜像地址。根据选择的镜像源，系统 SHALL 自动计算并生成对应的容器镜像配置。

#### Scenario: 应用容器镜像配置
**Given** 用户已选择镜像源
**When** 生成 Docker Compose YAML 配置
**Then** 系统应根据镜像源类型生成应用容器的镜像地址
**And** 支持镜像标签配置（如 :latest、:v1.0.0）
**And** 应用容器镜像地址应符合对应镜像源的格式要求

#### Scenario: 数据库容器镜像配置
**Given** 用户已选择镜像源
**When** 生成 Docker Compose YAML 配置
**Then** 系统应根据镜像源类型生成数据库容器的镜像地址
**And** 当使用阿里云 ACR 时，应使用特定的 PostgreSQL 镜像（`registry.cn-hangzhou.aliyuncs.com/hagicode/bitnami_postgresql:16`）
**And** 其他镜像源使用默认的 bitnami/postgresql 镜像

### Requirement: 镜像源选择界面优化

项目 SHALL 优化 Docker Compose 配置界面，提供更清晰的镜像源选择体验，并显示完整的镜像地址预览信息。

#### Scenario: 镜像源选择器更新
**Given** 用户正在配置 Docker Compose 部署
**When** 用户打开镜像源选择器
**Then** 应显示三个镜像源选项：Docker Hub（默认）、Azure Container Registry、阿里云 ACR
**And** Docker Hub 选项应显示"推荐"标识
**And** 每个选项应显示名称和简短描述

#### Scenario: 镜像地址预览
**Given** 用户已选择镜像源
**When** 用户查看配置预览
**Then** 应显示完整的应用容器和数据库容器的镜像地址
**And** 帮助用户确认配置的正确性

### Requirement: 镜像源配置系统扩展

项目 SHALL 扩展现有的镜像源配置系统，添加对阿里云 ACR 的支持，并保持与现有配置的兼容性。

#### Scenario: 类型定义扩展
**Given** 开发环境已准备就绪
**When** 更新类型定义文件
**Then** 应在 `ImageRegistry` 类型中添加 'aliyun-acr' 选项
**And** 应在 `REGISTRIES` 常量中添加阿里云 ACR 配置信息
**And** 保持与现有类型系统的兼容性

### Requirement: YAML 生成器优化

项目 SHALL 优化 Docker Compose YAML 生成器，根据镜像源类型生成对应的多容器镜像配置。

#### Scenario: 镜像地址生成逻辑
**Given** 用户已选择镜像源
**When** 执行 YAML 生成过程
**Then** 系统应根据镜像源类型生成不同的镜像地址
**And** 为应用容器和数据库容器添加独立的镜像地址计算逻辑
**And** 确保向后兼容现有镜像源配置

