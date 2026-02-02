import yaml from 'js-yaml';

/**
 * 解析 Docker Compose YAML 字符串
 * @param yamlString YAML 字符串
 * @returns 解析后的对象
 */
export function parseDockerComposeYAML(yamlString: string) {
  try {
    return yaml.load(yamlString) as any;
  } catch (error) {
    throw new Error(`Invalid YAML: ${error}`);
  }
}

/**
 * 验证 Docker Compose 配置的结构
 * @param yamlString YAML 字符串
 * @returns 验证结果
 */
export function validateDockerComposeStructure(yamlString: string): {
  valid: boolean;
  errors: string[];
  parsed?: any;
} {
  const errors: string[] = [];

  try {
    const parsed = parseDockerComposeYAML(yamlString);

    // 验证必需的顶级键
    if (!parsed.services) {
      errors.push('Missing required top-level key: services');
    }

    if (!parsed.networks) {
      errors.push('Missing required top-level key: networks');
    }

    // 验证 hagicode 服务存在
    if (parsed.services && !parsed.services.hagicode) {
      errors.push('Missing required service: hagicode');
    }

    // 验证 hagicode 服务的必需字段
    if (parsed.services?.hagicode) {
      const hagicode = parsed.services.hagicode;

      if (!hagicode.image) {
        errors.push('hagicode service missing required field: image');
      }

      if (!hagicode.container_name) {
        errors.push('hagicode service missing required field: container_name');
      }

      if (!hagicode.ports) {
        errors.push('hagicode service missing required field: ports');
      }

      if (!hagicode.environment) {
        errors.push('hagicode service missing required field: environment');
      }

      if (!hagicode.volumes) {
        errors.push('hagicode service missing required field: volumes');
      }

      if (!hagicode.networks) {
        errors.push('hagicode service missing required field: networks');
      }
    }

    // 验证网络配置
    if (parsed.networks && !parsed.networks['pcode-network']) {
      errors.push('Missing required network: pcode-network');
    }

    // 如果有 postgres 服务，验证其结构
    if (parsed.services?.postgres) {
      const postgres = parsed.services.postgres;

      if (!postgres.image) {
        errors.push('postgres service missing required field: image');
      }

      if (!postgres.environment) {
        errors.push('postgres service missing required field: environment');
      }

      if (!postgres.volumes) {
        errors.push('postgres service missing required field: volumes');
      }

      if (!postgres.healthcheck) {
        errors.push('postgres service missing required field: healthcheck');
      }
    }

    // 验证 volumes（如果存在）
    if (parsed.volumes) {
      const volumeKeys = Object.keys(parsed.volumes);
      if (volumeKeys.length === 0) {
        errors.push('volumes section is empty');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      parsed
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse YAML: ${error}`]
    };
  }
}

/**
 * 获取服务特定的环境变量值
 * @param yamlString YAML 字符串
 * @param serviceName 服务名称
 * @param envKey 环境变量键
 * @returns 环境变量值
 */
export function getServiceEnvVar(yamlString: string, serviceName: string, envKey: string): string | undefined {
  try {
    const parsed = parseDockerComposeYAML(yamlString);
    const value = parsed.services?.[serviceName]?.environment?.[envKey];
    // 将所有值转换为字符串（js-yaml 会将 "1000" 解析为 number 1000）
    return value !== undefined ? String(value) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * 获取服务特定的卷映射
 * @param yamlString YAML 字符串
 * @param serviceName 服务名称
 * @returns 卷映射数组
 */
export function getServiceVolumes(yamlString: string, serviceName: string): string[] {
  const parsed = parseDockerComposeYAML(yamlString);
  return parsed.services?.[serviceName]?.volumes || [];
}

/**
 * 检查服务是否存在
 * @param yamlString YAML 字符串
 * @param serviceName 服务名称
 * @returns 服务是否存在
 */
export function hasService(yamlString: string, serviceName: string): boolean {
  try {
    const parsed = parseDockerComposeYAML(yamlString);
    return !!parsed.services?.[serviceName];
  } catch {
    return false;
  }
}

/**
 * 检查卷是否存在
 * @param yamlString YAML 字符串
 * @param volumeName 卷名称
 * @returns 卷是否存在
 */
export function hasVolume(yamlString: string, volumeName: string): boolean {
  try {
    const parsed = parseDockerComposeYAML(yamlString);
    // 在 Docker Compose 中，空卷声明（如 "postgres-data:"）会被 js-yaml 解析为 null
    // 所以我们需要检查键是否存在，而不是值是否为真值
    return parsed.volumes && Object.prototype.hasOwnProperty.call(parsed.volumes, volumeName);
  } catch {
    return false;
  }
}

/**
 * 检查网络是否存在
 * @param yamlString YAML 字符串
 * @param networkName 网络名称
 * @returns 网络是否存在
 */
export function hasNetwork(yamlString: string, networkName: string): boolean {
  try {
    const parsed = parseDockerComposeYAML(yamlString);
    return !!parsed.networks?.[networkName];
  } catch {
    return false;
  }
}

/**
 * 获取服务端口映射
 * @param yamlString YAML 字符串
 * @param serviceName 服务名称
 * @returns 端口映射数组
 */
export function getServicePorts(yamlString: string, serviceName: string): string[] {
  const parsed = parseDockerComposeYAML(yamlString);
  return parsed.services?.[serviceName]?.ports || [];
}

/**
 * 验证环境变量是否存在
 * @param yamlString YAML 字符串
 * @param serviceName 服务名称
 * @param envKey 环境变量键
 * @returns 环境变量是否存在
 */
export function hasEnvVar(yamlString: string, serviceName: string, envKey: string): boolean {
  try {
    const envVar = getServiceEnvVar(yamlString, serviceName, envKey);
    return envVar !== undefined && envVar !== '';
  } catch {
    return false;
  }
}

/**
 * 获取服务镜像
 * @param yamlString YAML 字符串
 * @param serviceName 服务名称
 * @returns 镜像名称
 */
export function getServiceImage(yamlString: string, serviceName: string): string {
  const parsed = parseDockerComposeYAML(yamlString);
  return parsed.services?.[serviceName]?.image || '';
}
