/**
 * Unit tests for Nvml namespace
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockBindings, mockGpuData, mockSystemData } from '../mocks/nvml-mock.js';

// Mock the bindings module before importing Nvml
vi.mock('../../src/bindings/index.js', () => createMockBindings());

// Import after mocking
import { Nvml } from '../../src/nvml.js';
import { Device } from '../../src/device.js';
import { NvmlError } from '../../src/types/index.js';

describe('Nvml', () => {
  beforeEach(() => {
    // Reset initialization state before each test
    if (Nvml.isInitialized()) {
      Nvml.shutdown();
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (Nvml.isInitialized()) {
      Nvml.shutdown();
    }
  });

  describe('init() and shutdown()', () => {
    it('initializes successfully', () => {
      expect(() => Nvml.init()).not.toThrow();
      expect(Nvml.isInitialized()).toBe(true);
    });

    it('shuts down successfully', () => {
      Nvml.init();
      expect(() => Nvml.shutdown()).not.toThrow();
      expect(Nvml.isInitialized()).toBe(false);
    });
  });

  describe('isInitialized()', () => {
    it('returns false before init', () => {
      expect(Nvml.isInitialized()).toBe(false);
    });

    it('returns true after init', () => {
      Nvml.init();
      expect(Nvml.isInitialized()).toBe(true);
    });

    it('returns false after shutdown', () => {
      Nvml.init();
      Nvml.shutdown();
      expect(Nvml.isInitialized()).toBe(false);
    });
  });

  describe('ensureInitialized()', () => {
    it('throws when not initialized', () => {
      expect(() => Nvml.ensureInitialized()).toThrow(NvmlError);
    });

    it('does not throw when initialized', () => {
      Nvml.init();
      expect(() => Nvml.ensureInitialized()).not.toThrow();
    });
  });

  describe('getDeviceCount()', () => {
    it('throws when not initialized', () => {
      expect(() => Nvml.getDeviceCount()).toThrow(NvmlError);
    });

    it('returns device count when initialized', () => {
      Nvml.init();
      const count = Nvml.getDeviceCount();
      expect(count).toBe(1);
    });
  });

  describe('getDevice()', () => {
    it('throws when not initialized', () => {
      expect(() => Nvml.getDevice(0)).toThrow(NvmlError);
    });

    it('returns device when initialized', () => {
      Nvml.init();
      const device = Nvml.getDevice(0);
      expect(device).toBeInstanceOf(Device);
    });
  });

  describe('getDeviceByUUID()', () => {
    it('throws when not initialized', () => {
      expect(() => Nvml.getDeviceByUUID(mockGpuData.uuid)).toThrow(NvmlError);
    });

    it('returns device when initialized', () => {
      Nvml.init();
      const device = Nvml.getDeviceByUUID(mockGpuData.uuid);
      expect(device).toBeInstanceOf(Device);
    });
  });

  describe('getAllDevices()', () => {
    it('returns array of all devices', () => {
      Nvml.init();
      const devices = Nvml.getAllDevices();
      expect(Array.isArray(devices)).toBe(true);
      expect(devices.length).toBe(1);
      expect(devices[0]).toBeInstanceOf(Device);
    });
  });

  describe('getDriverInfo()', () => {
    it('returns driver information', () => {
      Nvml.init();
      const result = Nvml.getDriverInfo();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.driverVersion).toBe(mockSystemData.driverVersion);
        expect(result.value.nvmlVersion).toBe(mockSystemData.nvmlVersion);
        expect(result.value.cudaVersion).toBe('12.4');
      }
    });
  });

  describe('getDriverVersion()', () => {
    it('returns driver version string', () => {
      Nvml.init();
      const result = Nvml.getDriverVersion();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockSystemData.driverVersion);
      }
    });
  });

  describe('getNvmlVersion()', () => {
    it('returns NVML version string', () => {
      Nvml.init();
      const result = Nvml.getNvmlVersion();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockSystemData.nvmlVersion);
      }
    });
  });

  describe('getCudaVersion()', () => {
    it('returns CUDA version string', () => {
      Nvml.init();
      const result = Nvml.getCudaVersion();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('12.4');
      }
    });
  });

  describe('getAllGpuStatus()', () => {
    it('returns status for all GPUs', () => {
      Nvml.init();
      const result = Nvml.getAllGpuStatus();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBe(1);
        expect(result.value[0].name).toBe(mockGpuData.name);
      }
    });
  });

  describe('getSystemSnapshot()', () => {
    it('returns complete system snapshot', () => {
      Nvml.init();
      const result = Nvml.getSystemSnapshot();
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Check timestamp
        expect(result.value.timestamp).toBeInstanceOf(Date);

        // Check driver info
        expect(result.value.driver.driverVersion).toBe(mockSystemData.driverVersion);
        expect(result.value.driver.nvmlVersion).toBe(mockSystemData.nvmlVersion);
        expect(result.value.driver.cudaVersion).toBe('12.4');

        // Check GPUs
        expect(result.value.gpus.length).toBe(1);
        expect(result.value.gpus[0].name).toBe(mockGpuData.name);

        // Check processes
        expect(Array.isArray(result.value.processes)).toBe(true);
        expect(result.value.processes.length).toBeGreaterThan(0);
      }
    });
  });
});
