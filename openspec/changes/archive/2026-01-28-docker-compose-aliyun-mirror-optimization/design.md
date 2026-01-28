# 设计文档

## 1. 架构设计

### 1.1 镜像源配置系统

#### 当前架构
```typescript
// src/lib/docker-compose/types.ts
export type ImageRegistry = 'docker-hub' | 'azure-acr';

export const REGISTRIES: Record<ImageRegistry, RegistryConfig> = {
  'docker-hub': {
    id: 'docker-hub',
    name: 'Docker Hub',
    description: 'Docker official image registry, recommended',
    imagePrefix: 'newbe36524/hagicode',
    recommended: true,
    networkAdvice: 'Suitable for users with Docker Hub mirror acceleration support'
  },
  'azure-acr': {
    id: 'azure-acr',
    name: 'Azure Container Registry',
    description: 'Alternative image registry, synced with Docker Hub',
    imagePrefix: 'hagicode.azurecr.io/hagicode',
    recommended: false,
    networkAdvice: 'Suitable for users who cannot access Docker Hub locally'
  }
};
```

#### 扩展后架构
```typescript
export type ImageRegistry = 'docker-hub' | 'azure-acr' | 'aliyun-acr';

export const REGISTRIES: Record<ImageRegistry, RegistryConfig> = {
  // 保持现有配置...
  'aliyun-acr': {
    id: 'aliyun-acr',
    name: '阿里云 ACR',
    description: '阿里云容器镜像服务，国内用户推荐',
    imagePrefix: 'registry.cn-hangzhou.aliyuncs.com/hagicode',
    recommended: false,
    networkAdvice: '适合中国大陆用户，提供稳定的镜像加速服务'
  }
};
```

### 1.2 多容器镜像生成策略

#### 应用容器镜像
- **Docker Hub**: `newbe36524/hagicode:${tag}`
- **Azure ACR**: `hagicode.azurecr.io/hagicode:${tag}`
- **阿里云 ACR**: `registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:${tag}`

#### 数据库容器镜像
- **Docker Hub/Azure ACR**: `bitnami/postgresql:latest`
- **阿里云 ACR**: `registry.cn-hangzhou.aliyuncs.com/hagicode/bitnami_postgresql:16`

## 2. 实现策略

### 2.1 YAML 生成器优化

修改 `src/lib/docker-compose/generator.ts` 中的镜像生成逻辑：

```typescript
// 应用容器镜像
const imagePrefix = REGISTRIES[config.imageRegistry].imagePrefix;
let appImage: string;
let dbImage: string;

if (config.imageRegistry === 'aliyun-acr') {
  appImage = `${imagePrefix}/hagicode:${config.imageTag}`;
  dbImage = `${imagePrefix}/bitnami_postgresql:16`;
} else {
  appImage = `${imagePrefix}:${config.imageTag}`;
  dbImage = 'bitnami/postgresql:latest';
}

// 生成 services.hagicode.image
lines.push(`    image: ${appImage}`);

// 生成 services.postgres.image
lines.push(`    image: ${dbImage}`);
```

### 2.2 配置表单更新

在 `src/components/docker-compose/ConfigForm.tsx` 中：

1. 更新 Select 组件的选项值数组
2. 添加阿里云 ACR 的说明信息展示
3. 更新镜像地址预览逻辑

## 3. 用户体验设计

### 3.1 镜像源选择界面

- **选项展示**：Docker Hub（默认）、Azure Container Registry、阿里云 ACR
- **说明信息**：
  - Docker Hub：Docker 官方镜像仓库，推荐使用
  - Azure ACR：备选镜像仓库，与 Docker Hub 同步
  - 阿里云 ACR：阿里云容器镜像服务，国内用户推荐，提供稳定的镜像加速服务

### 3.2 网络建议

根据用户选择的镜像源显示对应的网络建议，帮助用户做出最佳选择。

## 4. 兼容性考虑

### 4.1 向后兼容

- 保持对现有配置的完全支持
- 新镜像源配置为可选功能
- 现有部署流程不受影响

### 4.2 配置迁移

- 无需迁移现有配置文件
- 新配置会在用户选择阿里云 ACR 时自动应用

## 5. 验证与测试

### 5.1 功能测试

- 测试不同镜像源配置的 YAML 输出
- 验证多容器镜像地址的正确性
- 测试配置表单的交互逻辑

### 5.2 边界条件

- 处理配置文件中未定义 `imageRegistry` 字段的情况
- 验证无效镜像源值的处理
- 测试镜像标签为空或无效的情况