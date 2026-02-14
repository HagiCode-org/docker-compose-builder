# Implementation Tasks

## 1. 代码实现

- [ ] 1.1 修改 `buildAppService` 函数，在 volumes 部分添加 `/home/hagicode/.claude` 卷挂载
- [ ] 1.2 修改 `buildVolumesSection` 函数，声明 `claude-data` 命名卷
- [ ] 1.3 确保卷挂载路径与容器内 Claude 配置目录匹配

## 2. 测试验证

- [ ] 2.1 运行现有的单元测试，确保没有破坏性变更
- [ ] 2.2 验证生成的 YAML 配置包含正确的卷挂载
- [ ] 2.3 验证生成的 YAML 配置包含正确的命名卷声明
- [ ] 2.4 测试快速体验模式生成的配置
- [ ] 2.5 测试完整自定义模式生成的配置（Windows 和 Linux）

## 3. 规格更新

- [ ] 3.1 在 spec delta 中添加 Claude 配置持久化需求
- [ ] 3.2 添加相应的测试场景

## 4. 文档和验证

- [ ] 4.1 运行 `openspec validate claude-config-persistence-volume --strict` 验证提案
- [ ] 4.2 确认所有任务完成
