# i18n Specification

## Purpose
TBD - created by archiving change i18n-internationalization-support. Update Purpose after archive.
## Requirements
### Requirement: 国际化框架集成

系统 SHALL 集成 `react-i18next` 国际化框架，支持多语言文本管理和动态语言切换。

#### Scenario: 框架初始化
- **WHEN** 应用启动时
- **THEN** 系统 SHALL 初始化 i18next 配置
- **AND** 加载默认语言资源文件（zh-CN）
- **AND** 提供全局 i18n 实例供所有组件使用

#### Scenario: 语言资源加载
- **WHEN** 用户切换语言或首次访问
- **THEN** 系统 SHALL 从 `src/i18n/locales/` 目录加载对应语言的 JSON 资源文件
- **AND** 支持按命名空间组织翻译内容

### Requirement: 语言切换功能

系统 SHALL 提供语言切换组件，允许用户在不同语言之间动态切换。

#### Scenario: 语言选择器显示
- **WHEN** 用户访问页面
- **THEN** 系统 SHALL 在 header 右上角显示语言选择器
- **AND** 显示当前激活的语言（如"中文"或"English"）
- **AND** 点击后展开下拉菜单显示可用语言列表

#### Scenario: 动态语言切换
- **WHEN** 用户从下拉菜单选择不同语言
- **THEN** 系统 SHALL 调用 `i18n.changeLanguage()` 切换语言
- **AND** 所有使用 `useTranslation()` hook 的组件 SHALL 自动更新显示
- **AND** 无需刷新页面

#### Scenario: 语言切换持久化
- **WHEN** 用户选择新语言
- **THEN** 系统 SHALL 将语言偏好保存到 localStorage（键名: `language`）
- **AND** 下次访问时自动加载保存的语言偏好

### Requirement: 浏览器语言自动检测

系统 SHALL 在首次访问时根据浏览器语言设置自动选择合适的界面语言。

#### Scenario: 首次访问语言检测
- **WHEN** 用户首次访问且无 localStorage 语言偏好
- **THEN** 系统 SHALL 检测 `navigator.language` 值
- **AND** 如果浏览器语言为 `zh-CN`、`zh` 或 `zh-*`，则加载中文资源
- **AND** 否则加载英文资源（en-US）

#### Scenario: 语言检测优先级
- **WHEN** 应用初始化时
- **THEN** 系统 SHALL 按以下优先级选择语言：
  1. localStorage 中存储的用户语言偏好
  2. 浏览器语言设置（navigator.language）
  3. 默认语言（zh-CN）

### Requirement: 多语言资源管理

系统 SHALL 提供结构化的语言资源文件，支持按命名空间组织翻译内容。

#### Scenario: 语言资源文件结构
- **WHEN** 开发者管理翻译内容
- **THEN** 系统 SHALL 使用 JSON 格式存储语言资源
- **AND** 支持嵌套的命名空间结构（如 `configForm.httpPort.label`）
- **AND** 支持插值变量（如 `Welcome, {{name}}!`）
- **AND** 至少包含中文（zh-CN）和英文（en-US）两种语言

#### Scenario: 组件使用翻译
- **WHEN** 组件需要显示多语言文本
- **THEN** 组件 SHALL 使用 `useTranslation()` hook 获取翻译函数
- **AND** 通过翻译 key 获取对应语言的文本
- **EXAMPLE**: `t('configForm.httpPort.label')` 返回"HTTP Port"或"HTTP 端口"

### Requirement: 默认语言配置

系统 SHALL 设置中文（zh-CN）为默认语言。

#### Scenario: 无语言偏好时使用默认
- **WHEN** 用户首次访问且浏览器语言不是中文
- **THEN** 系统 SHALL 使用中文（zh-CN）作为默认显示语言
- **AND** 所有未翻译的 key SHALL 回退到中文资源

#### Scenario: 缺失翻译处理
- **WHEN** 当前语言的资源文件中缺少某个翻译 key
- **THEN** 系统 SHALL 回退到默认语言（zh-CN）的对应翻译
- **AND** 如果默认语言也缺失，则显示翻译 key 本身

