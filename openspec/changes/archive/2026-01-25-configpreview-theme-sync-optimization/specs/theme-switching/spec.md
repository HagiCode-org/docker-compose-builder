# 主题切换功能规范 - ConfigPreview主题同步优化

## ADDED Requirements

### Requirement: ConfigPreview组件主题感知
The application SHALL ensure that the ConfigPreview component's YAML code preview area automatically adapts its syntax highlighting theme to match the application's global theme setting.
- **Purpose**: 确保ConfigPreview组件的代码预览区域能够响应应用的全局主题设置
- **Scope**: ConfigPreview组件和SyntaxHighlighter组件的集成

#### Scenario: 亮色主题下代码预览显示
- **WHEN** 用户的系统主题设置为"light"
- **THEN** ConfigPreview组件SHALL传递`darkMode = false`给SyntaxHighlighter组件
- **AND** SyntaxHighlighter组件SHALL使用`oneLight`语法高亮样式
- **AND** 代码预览区域显示亮色背景和深色文本的YAML配置

#### Scenario: 暗色主题下代码预览显示
- **WHEN** 用户的系统主题设置为"dark"
- **THEN** ConfigPreview组件SHALL传递`darkMode = true`给SyntaxHighlighter组件
- **AND** SyntaxHighlighter组件SHALL使用`oneDark`语法高亮样式
- **AND** 代码预览区域显示暗色背景和浅色文本的YAML配置

#### Scenario: 主题切换时代码预览同步更新
- **WHEN** 用户在应用运行时切换主题（从亮色切换到暗色，或反之）
- **THEN** ConfigPreview组件SHALL立即响应主题变化
- **AND** SyntaxHighlighter组件SHALL动态切换语法高亮样式
- **AND** 代码预览区域的视觉效果SHALL平滑过渡到新主题
- **AND** 用户体验SHALL保持连贯，无视觉闪烁或延迟

#### Scenario: 页面刷新后主题状态持久化
- **WHEN** 用户刷新页面或重新打开应用
- **THEN** 应用SHALL从localStorage恢复用户的主题选择
- **AND** ConfigPreview组件SHALL根据恢复的主题值显示相应的代码预览样式
- **AND** 代码预览区域的主题SHALL与应用全局主题保持一致

## MODIFIED Requirements

无

## REMOVED Requirements

无
