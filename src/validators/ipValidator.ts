export interface ParsedHostPort {
  host: string;
  port?: number;
}

const IPV4_SEGMENT = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_REGEX = new RegExp(`^(${IPV4_SEGMENT}\\.){3}${IPV4_SEGMENT}$`);

export function isValidIpv4(value: string): boolean {
  return IPV4_REGEX.test(value.trim());
}

export function isValidIpv6(value: string): boolean {
  const input = value.trim();
  if (!input.includes(':')) {
    return false;
  }

  const doubleColonParts = input.split('::');
  if (doubleColonParts.length > 2) {
    return false;
  }

  const segmentPattern = /^[0-9a-fA-F]{1,4}$/;
  const validateBlock = (block: string): boolean => {
    if (block === '') {
      return true;
    }
    return block.split(':').every((segment) => segmentPattern.test(segment));
  };

  if (!doubleColonParts.every(validateBlock)) {
    return false;
  }

  if (doubleColonParts.length === 1) {
    return input.split(':').length === 8;
  }

  const leftCount = doubleColonParts[0] ? doubleColonParts[0].split(':').length : 0;
  const rightCount = doubleColonParts[1] ? doubleColonParts[1].split(':').length : 0;
  return leftCount + rightCount < 8;
}

export function isValidIp(value: string): boolean {
  const trimmed = value.trim();
  return isValidIpv4(trimmed) || isValidIpv6(trimmed);
}

export function parseHostWithOptionalPort(raw: string): ParsedHostPort | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  // Bracketed IPv6 form: [::1]:443
  const bracketed = value.match(/^\[([^\]]+)\](?::(\d+))?$/);
  if (bracketed) {
    const host = bracketed[1];
    const port = bracketed[2] ? Number(bracketed[2]) : undefined;
    if (!isValidIp(host)) {
      return null;
    }
    if (port !== undefined && (port < 1 || port > 65535)) {
      return null;
    }
    return { host, port };
  }

  const colonCount = (value.match(/:/g) || []).length;
  if (colonCount > 1) {
    return isValidIpv6(value) ? { host: value } : null;
  }

  const hostPortMatch = value.match(/^([^:]+)(?::(\d+))?$/);
  if (!hostPortMatch) {
    return null;
  }

  const host = hostPortMatch[1];
  const port = hostPortMatch[2] ? Number(hostPortMatch[2]) : undefined;
  if (!isValidIp(host)) {
    return null;
  }
  if (port !== undefined && (port < 1 || port > 65535)) {
    return null;
  }

  return { host, port };
}

export function isPrivateIpv4(value: string): boolean {
  if (!isValidIpv4(value)) {
    return false;
  }

  const [a, b] = value.split('.').map(Number);
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

export function isLocalhostHost(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

export function hasPortConflict(httpPort: string, httpsPort: string): boolean {
  const http = Number(httpPort);
  const https = Number(httpsPort);
  if (Number.isNaN(http) || Number.isNaN(https)) {
    return false;
  }
  return http === https;
}
