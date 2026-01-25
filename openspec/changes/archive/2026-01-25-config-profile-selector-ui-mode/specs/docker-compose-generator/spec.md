# docker-compose-generator Specification Delta

## ADDED Requirements

### Requirement: 配置模式选择

系统 SHALL 提供配置模式（Profile）选择功能，允许用户在"本地快速体验"和"完整自定义"两种模式之间切换，以降低新用户的学习门槛同时保持高级用户的完整控制能力。

#### Scenario: 默认快速体验模式

- **WHEN** 用户首次打开 Docker Compose 生成器页面
- **THEN** 系统默认选择"本地快速体验"模式
- **AND** 仅显示最小必需配置项：
  - 工作目录路径（workdirPath）
  - HTTP 端口（httpPort）
  - API Token（anthropicAuthToken）
  - 镜像源选择（imageRegistry）
- **AND** 隐藏以下配置项并使用默认值：
  - 容器名称、镜像标签、主机系统类型
  - 数据库配置（使用内部 PostgreSQL）
  - 许可证密钥类型
  - API 提供商（使用 ZAI）
  - 卷类型、卷名称/路径
  - Linux 用户权限（PUID/PGID）
- **AND** Profile 选择器标签和提示文本 SHALL 支持多语言

#### Scenario: 快速体验模式配置生成

- **WHEN** 用户在"本地快速体验"模式下填写最小必填项
- **THEN** 系统生成包含完整服务定义的 Docker Compose 配置
- **AND** 隐藏的配置项使用预定义的合理默认值
- **AND** 生成的配置 SHALL 可直接用于容器启动
- **AND** 所有 UI 文本 SHALL 支持多语言显示

#### Scenario: 切换到完整自定义模式

- **WHEN** 用户在"本地快速体验"模式下点击"完整自定义"模式选项
- **THEN** 系统显示所有配置项（基础设置、数据库配置、许可证配置、API 配置、卷挂载、高级选项）
- **AND** 保留已填写的共享字段的值（工作目录路径、HTTP 端口、API Token、镜像源）
- **AND** 隐藏字段的默认值自动填充到对应的表单输入框
- **AND** 模式切换标签和提示 SHALL 支持多语言

#### Scenario: 完整自定义模式配置生成

- **WHEN** 用户在"完整自定义"模式下填写或修改所有配置项
- **THEN** 系统生成包含所有自定义参数的 Docker Compose 配置
- **AND** 配置 SHALL 反映用户输入的所有参数值
- **AND** 配置生成逻辑 SHALL 与现有实现保持一致
- **AND** 所有表单标签和验证提示 SHALL 支持多语言

#### Scenario: 模式切换时状态保持

- **WHEN** 用户在任意模式下填写配置后切换到另一种模式
- **THEN** 共享字段的值 SHALL 保持不变（工作目录路径、HTTP 端口、API Token、镜像源）
- **AND** 从快速体验切换到完整自定义时，隐藏字段的默认值自动填充
- **AND** 从完整自定义切换回快速体验时，已修改的隐藏字段值保留在后台
- **AND** 切换过程中不丢失任何用户输入

#### Scenario: Profile 选择器 UI 交互

- **WHEN** 用户查看配置表单顶部
- **THEN** 系统显示 Profile 单选按钮组（位于表单最顶部、标题下方）
- **AND** 提供两个选项：
  - "本地快速体验（推荐新用户）"带描述文本
  - "完整自定义"带描述文本
- **AND** 选中模式有明确的视觉指示
- **AND** 选择器组件 SHALL 支持响应式设计（移动端和桌面端）
- **AND** 所有 Profile 相关文本 SHALL 支持中英文双语

## MODIFIED Requirements

### Requirement: Docker Compose 配置生成

系统 SHALL 提供 Docker Compose 配置的可视化生成功能，允许用户通过表单界面配置各种参数，并自动生成相应的 YAML 配置文件。系统 SHALL 支持配置模式（Profile）选择，根据所选模式显示不同级别的配置选项。

#### Scenario: 基础配置生成

- **WHEN** 用户打开 Docker Compose 生成器页面
- **THEN** 系统显示包含默认配置的表单和配置预览
- **AND** 表单顶部显示 Profile 模式选择器，默认为"本地快速体验"模式
- **AND** 根据 Profile 模式显示相应的配置字段
- **AND** 所有 UI 文本 SHALL 支持多语言显示
- **AND** 用户可以修改配置参数
- **AND** 预览区域实时更新 YAML 内容

## Implementation Notes

- Profile 字段类型定义：`profile: 'quick-start' | 'full-custom'`
- 默认值：`'quick-start'`
- 快速体验模式下的默认值：
  - `containerName`: `'hagicode-app'`
  - `imageTag`: `'latest'`
  - `hostOS`: `'linux'`
  - `databaseType`: `'internal'`
  - `licenseKeyType`: `'public'`
  - `anthropicApiProvider`: `'zai'`
  - `anthropicUrl`: `'https://open.bigmodel.cn/api/anthropic'`
  - `volumeType`: `'named'`
  - `puid`: `'1000'`
  - `pgid`: `'1000'`
