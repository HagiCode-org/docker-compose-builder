# 任务清单

## 1. 镜像源类型扩展

### 1.1 类型定义更新
- [x] 在 `src/lib/docker-compose/types.ts` 中添加 `aliyun-acr` 到 `ImageRegistry` 类型
- [x] 扩展 `REGISTRIES` 常量，添加阿里云 ACR 配置
- [x] 配置属性：`id: 'aliyun-acr'`、`name: '阿里云 ACR'`、`description: '阿里云容器镜像服务，国内用户推荐'`
- [x] 镜像前缀：`registry.cn-hangzhou.aliyuncs.com/hagicode`
- [x] 网络建议：`适合中国大陆用户，提供稳定的镜像加速服务`

### 1.2 默认配置更新
- [x] 在 `src/lib/docker-compose/defaultConfig.ts` 中确保新镜像源兼容性

## 2. 多容器镜像配置

### 2.1 生成器逻辑优化
- [x] 修改 `src/lib/docker-compose/generator.ts` 中的镜像生成逻辑
- [x] 为应用容器和数据库容器添加独立的镜像前缀支持
- [x] 应用容器镜像：`${imagePrefix}:${config.imageTag}`
- [x] 数据库容器镜像：`${imagePrefix}/bitnami_postgresql:16`（当使用阿里云 ACR 时）
- [x] 保持对其他镜像源的向后兼容（使用默认的 bitnami/postgresql 镜像）

## 3. 配置界面优化

### 3.1 表单组件更新
- [x] 更新 `src/components/docker-compose/ConfigForm.tsx` 中的镜像源选择器
- [x] 添加阿里云 ACR 选项到 Select 组件
- [x] 为阿里云 ACR 添加说明信息和网络建议展示
- [x] 更新镜像预览逻辑，显示完整镜像地址

### 3.2 验证逻辑增强
- [x] 在 `src/lib/docker-compose/validation.ts` 中添加镜像地址格式验证
- [x] 确保配置验证支持新的镜像源类型

## 4. 国际化支持

### 4.1 中文翻译添加
- [x] 在 `src/i18n/locales/zh-CN.json` 中添加阿里云 ACR 相关翻译
- [x] 添加 `configForm.aliyunAcr`、`configForm.aliyunAcrDescription`、`configForm.aliyunAcrNetworkAdvice` 等字段

### 4.2 英文翻译添加
- [x] 在 `src/i18n/locales/en-US.json` 中添加对应的英文翻译

## 5. 用户支持组件

### 5.1 帮助组件设计
- [x] 创建用户支持帮助组件（可选，根据需求复杂度决定）
- [x] 组件位置：镜像选择器旁边
- [x] 内容：包含"遇到问题？"提示、用户群引导、常见问题入口

## 6. 验证与测试

### 6.1 功能验证
- [x] 验证 Docker Compose YAML 生成
- [x] 测试不同镜像源配置的输出
- [x] 确保多容器镜像配置正确
- [x] 验证向后兼容性

### 6.2 界面测试
- [x] 测试配置表单的交互
- [x] 验证镜像源切换功能
- [x] 检查响应式布局