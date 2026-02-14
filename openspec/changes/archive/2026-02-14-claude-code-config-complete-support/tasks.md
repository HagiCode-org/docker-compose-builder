# Implementation Tasks

## 1. 类型定义扩展

- [ ] 1.1 在 `DockerComposeConfig` 接口中添加 Claude 模型配置字段：
  - `anthropicSonnetModel?: string;`
  - `anthropicOpusModel?: string;`
  - `anthropicHaikuModel?: string;`

- [ ] 1.2 在 `DockerComposeConfig` 接口中添加主机配置挂载字段：
  - `claudeConfigMountPath?: string;`
  - `claudeHostConfigEnabled?: boolean;`

- [ ] 1.3 在 `DockerComposeConfig` 接口中添加实验性功能字段：
  - `claudeCodeExperimentalAgentTeams?: string;`

## 2. 生成器逻辑更新

- [ ] 2.1 修改 `buildAppService` 函数，在 Claude API 配置部分之后添加新环境变量输出逻辑

- [ ] 2.2 实现模型配置环境变量条件输出：
  - 当 `anthropicSonnetModel` 有值时，输出 `ANTHROPIC_SONNET_MODEL`
  - 当 `anthropicOpusModel` 有值时，输出 `ANTHROPIC_OPUS_MODEL`
  - 当 `anthropicHaikuModel` 有值时，输出 `ANTHROPIC_HAIKU_MODEL`

- [ ] 2.3 实现主机配置挂载环境变量条件输出：
  - 当 `claudeConfigMountPath` 有值时，输出 `CLAUDE_CONFIG_MOUNT_PATH`
  - 当 `claudeHostConfigEnabled` 设置时，输出 `CLAUDE_HOST_CONFIG_ENABLED`

- [ ] 2.4 实现 Agent Teams 功能环境变量条件输出：
  - 当 `claudeCodeExperimentalAgentTeams` 有值时，输出 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

## 3. 测试验证

- [ ] 3.1 添加 Sonnet 模型配置的单元测试
- [ ] 3.2 添加 Opus 模型配置的单元测试
- [ ] 3.3 添加 Haiku 模型配置的单元测试
- [ ] 3.4 添加主机配置挂载路径的单元测试
- [ ] 3.5 添加主机配置开关的单元测试
- [ ] 3.6 添加 Agent Teams 开关的单元测试
- [ ] 3.7 运行所有单元测试，确保没有破坏性变更
- [ ] 3.8 更新快照测试以反映新的环境变量输出

## 4. 规格更新

- [ ] 4.1 创建 spec delta 文件 `specs/docker-compose-generator/spec.md`
- [ ] 4.2 在 spec delta 中添加 Claude Code 完整配置支持的需求说明
- [ ] 4.3 添加相应的测试场景到规格中

## 5. 文档和验证

- [ ] 5.1 运行 `openspec validate claude-code-config-complete-support --strict` 验证提案
- [ ] 5.2 确认所有任务完成
- [ ] 5.3 确保所有新增功能都有对应的测试覆盖
