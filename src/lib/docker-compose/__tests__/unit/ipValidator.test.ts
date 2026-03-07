import { describe, expect, it } from 'vitest';
import {
  hasPortConflict,
  isLocalhostHost,
  isPrivateIpv4,
  isValidIp,
  isValidIpv4,
  isValidIpv6,
  parseHostWithOptionalPort,
} from '../../../../validators/ipValidator';

describe('ipValidator', () => {
  it('validates IPv4', () => {
    expect(isValidIpv4('192.168.1.100')).toBe(true);
    expect(isValidIpv4('256.1.1.1')).toBe(false);
  });

  it('validates IPv6', () => {
    expect(isValidIpv6('fe80::1')).toBe(true);
    expect(isValidIpv6('gggg::1')).toBe(false);
  });

  it('validates generic IP', () => {
    expect(isValidIp('10.0.0.5')).toBe(true);
    expect(isValidIp('fe80::1')).toBe(true);
    expect(isValidIp('localhost')).toBe(false);
  });

  it('parses host with optional port', () => {
    expect(parseHostWithOptionalPort('192.168.1.10:443')).toEqual({ host: '192.168.1.10', port: 443 });
    expect(parseHostWithOptionalPort('[fe80::1]:8443')).toEqual({ host: 'fe80::1', port: 8443 });
    expect(parseHostWithOptionalPort('fe80::1')).toEqual({ host: 'fe80::1' });
    expect(parseHostWithOptionalPort('not-an-ip')).toBeNull();
  });

  it('detects private IPv4', () => {
    expect(isPrivateIpv4('192.168.1.10')).toBe(true);
    expect(isPrivateIpv4('172.20.1.1')).toBe(true);
    expect(isPrivateIpv4('8.8.8.8')).toBe(false);
  });

  it('detects localhost hosts', () => {
    expect(isLocalhostHost('localhost')).toBe(true);
    expect(isLocalhostHost('127.0.0.1')).toBe(true);
    expect(isLocalhostHost('::1')).toBe(true);
    expect(isLocalhostHost('192.168.0.1')).toBe(false);
  });

  it('detects port conflicts', () => {
    expect(hasPortConflict('45000', '45000')).toBe(true);
    expect(hasPortConflict('45000', '443')).toBe(false);
  });
});
