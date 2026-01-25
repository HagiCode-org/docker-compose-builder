## MODIFIED Requirements

### Requirement: Docker Compose 配置生成

系统 SHALL 提供 Docker Compose 配置的可视化生成功能，允许用户通过表单界面配置各种参数，并自动生成相应的 YAML 配置文件。

#### Scenario: 基础配置生成
- **WHEN** 用户打开 Docker Compose 生成器页面
- **THEN** 系统显示包含默认配置的表单和配置预览
- **AND** 所有 UI 文本 SHALL 支持多语言显示
- **AND** 用户可以修改配置参数
- **AND** 预览区域实时更新 YAML 内容

#### Scenario: 完整配置生成
- **WHEN** 用户填写所有配置项（包括基础设置、数据库配置、API 配置和高级选项）
- **THEN** 系统生成完整的 Docker Compose 配置
- **AND** 配置包含所有服务、网络、卷和环境变量定义
- **AND** 表单标签和提示文本 SHALL 支持多语言

### Requirement: 多镜像源支持

系统 SHALL 支持多种 Docker 镜像源，允许用户选择 Docker Hub 或 Azure Container Registry (ACR)。

#### Scenario: 镜像源切换
- **WHEN** 用户在配置表单中选择不同的镜像源
- **THEN** 生成的 Docker Compose 配置中的镜像前缀会相应更新
- **AND** 系统显示所选镜像源的描述和网络建议（多语言）

#### Scenario: 镜像源信息显示
- **WHEN** 用户查看镜像源选项
- **THEN** 系统显示每个镜像源的名称、描述、推荐标志和网络建议
- **AND** 所有文本 SHALL 支持多语言显示

### Requirement: 多 API 提供商支持

系统 SHALL 支持多种 Anthropic API 提供商，包括 Anthropic 官方 API、智谱 AI (ZAI) 和自定义 API。

#### Scenario: API 提供商选择
- **WHEN** 用户选择不同的 API 提供商
- **THEN** 生成的 Docker Compose 配置中会相应设置 API 相关的环境变量
- **AND** 系统根据选择显示相应的 API 配置字段
- **AND** 所有标签和描述文本 SHALL 支持多语言

#### Scenario: API 配置验证
- **WHEN** 用户配置 API 参数
- **THEN** 系统验证必填字段（如 API Token）的完整性
- **AND** 提供实时的错误提示和验证信息（多语言）

### Requirement: 配置预览和导出

系统 SHALL 提供配置预览和导出功能，允许用户查看生成的 YAML 配置并进行导出操作。

#### Scenario: YAML 预览
- **WHEN** 用户修改配置参数
- **THEN** 系统实时更新 YAML 预览内容
- **AND** 预览区域支持代码高亮显示
- **AND** 预览标题和操作按钮 SHALL 支持多语言

#### Scenario: 配置复制
- **WHEN** 用户点击复制按钮
- **THEN** 系统将生成的 YAML 配置复制到剪贴板
- **AND** 显示复制成功的反馈（多语言）

#### Scenario: 配置下载
- **WHEN** 用户点击下载按钮
- **THEN** 系统将生成的配置保存为 docker-compose.yml 文件
- **AND** 文件下载到用户设备
- **AND** 下载按钮文本 SHALL 支持多语言

### Requirement: 表单验证和错误提示

系统 SHALL 对用户输入的配置进行验证，并提供实时的错误提示和反馈。

#### Scenario: 必填字段验证
- **WHEN** 用户未填写必填字段
- **THEN** 系统显示相应的错误提示（多语言）
- **AND** 表单提交按钮被禁用

#### Scenario: 格式验证
- **WHEN** 用户输入格式不正确的字段（如无效的端口号）
- **THEN** 系统显示格式错误提示（多语言）
- **AND** 指示用户正确输入

### Requirement: 响应式设计

系统 SHALL 提供响应式的用户界面，确保在不同设备上都能正常使用。

#### Scenario: 桌面端布局
- **WHEN** 用户在桌面端设备上访问
- **THEN** 系统显示两栏布局（表单 + 预览）
- **AND** 语言选择器位于 header 右上角
- **AND** 充分利用屏幕空间

#### Scenario: 移动端布局
- **WHEN** 用户在移动端设备上访问
- **THEN** 系统显示单栏布局（表单在上，预览在下）
- **AND** 语言选择器自适应移动设备屏幕宽度
- **AND** 表单字段自适应屏幕宽度