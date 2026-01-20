/**
 * Unit tests for Device class
 */

import { describe, it, expect, vi } from 'vitest';
import { createMockBindings, mockGpuData, mockProcesses, mockProcessNames } from '../mocks/nvml-mock.js';

// Mock the bindings module before importing Device
vi.mock('../../src/bindings/index.js', () => createMockBindings());

// Import after mocking
import { Device } from '../../src/device.js';
import { NvmlError } from '../../src/types/index.js';

describe('Device', () => {
  describe('getByIndex()', () => {
    it('returns device for valid index', () => {
      const device = Device.getByIndex(0);
      expect(device).toBeInstanceOf(Device);
      expect(device.index).toBe(0);
    });

    it('throws for invalid index', () => {
      expect(() => Device.getByIndex(999)).toThrow(NvmlError);
    });
  });

  describe('getByUUID()', () => {
    it('returns device for valid UUID', () => {
      const device = Device.getByUUID(mockGpuData.uuid);
      expect(device).toBeInstanceOf(Device);
    });

    it('throws for invalid UUID', () => {
      expect(() => Device.getByUUID('invalid-uuid')).toThrow(NvmlError);
    });
  });

  describe('getName()', () => {
    it('returns GPU name', () => {
      const device = Device.getByIndex(0);
      const result = device.getName();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.name);
      }
    });
  });

  describe('getUUID()', () => {
    it('returns GPU UUID', () => {
      const device = Device.getByIndex(0);
      const result = device.getUUID();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.uuid);
      }
    });
  });

  describe('getMemoryInfo()', () => {
    it('returns memory information', () => {
      const device = Device.getByIndex(0);
      const result = device.getMemoryInfo();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.total).toBe(mockGpuData.memory.total);
        expect(result.value.free).toBe(mockGpuData.memory.free);
        expect(result.value.used).toBe(mockGpuData.memory.used);
      }
    });
  });

  describe('getUtilizationRates()', () => {
    it('returns GPU and memory utilization', () => {
      const device = Device.getByIndex(0);
      const result = device.getUtilizationRates();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.gpu).toBe(mockGpuData.utilization.gpu);
        expect(result.value.memory).toBe(mockGpuData.utilization.memory);
      }
    });
  });

  describe('getTemperature()', () => {
    it('returns GPU temperature', () => {
      const device = Device.getByIndex(0);
      const result = device.getTemperature();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.temperature);
      }
    });
  });

  describe('getPowerUsage()', () => {
    it('returns power usage in watts', () => {
      const device = Device.getByIndex(0);
      const result = device.getPowerUsage();
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Mock returns milliwatts, method converts to watts
        expect(result.value).toBe(mockGpuData.powerUsage / 1000);
      }
    });
  });

  describe('getPowerLimit()', () => {
    it('returns power limit in watts', () => {
      const device = Device.getByIndex(0);
      const result = device.getPowerLimit();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.powerLimit / 1000);
      }
    });
  });

  describe('getFanSpeed()', () => {
    it('returns fan speed percentage', () => {
      const device = Device.getByIndex(0);
      const result = device.getFanSpeed();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.fanSpeed);
      }
    });
  });

  describe('getPerformanceState()', () => {
    it('returns P-state', () => {
      const device = Device.getByIndex(0);
      const result = device.getPerformanceState();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.pState);
      }
    });
  });

  describe('getPciInfo()', () => {
    it('returns PCI information', () => {
      const device = Device.getByIndex(0);
      const result = device.getPciInfo();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.busId).toBe(mockGpuData.pci.busId);
        expect(result.value.domain).toBe(mockGpuData.pci.domain);
        expect(result.value.bus).toBe(mockGpuData.pci.bus);
        expect(result.value.device).toBe(mockGpuData.pci.device);
      }
    });
  });

  describe('getPersistenceMode()', () => {
    it('returns persistence mode status', () => {
      const device = Device.getByIndex(0);
      const result = device.getPersistenceMode();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.persistenceMode);
      }
    });
  });

  describe('getDisplayActive()', () => {
    it('returns display active status', () => {
      const device = Device.getByIndex(0);
      const result = device.getDisplayActive();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.displayActive);
      }
    });
  });

  describe('getComputeMode()', () => {
    it('returns compute mode', () => {
      const device = Device.getByIndex(0);
      const result = device.getComputeMode();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(mockGpuData.computeMode);
      }
    });
  });

  describe('getBasicInfo()', () => {
    it('returns basic GPU info', () => {
      const device = Device.getByIndex(0);
      const result = device.getBasicInfo();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.index).toBe(0);
        expect(result.value.name).toBe(mockGpuData.name);
        expect(result.value.memoryTotalMiB).toBeGreaterThan(0);
        expect(result.value.memoryTotalGiB).toBeGreaterThan(0);
      }
    });
  });

  describe('getStatus()', () => {
    it('returns comprehensive GPU status', () => {
      const device = Device.getByIndex(0);
      const result = device.getStatus();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.index).toBe(0);
        expect(result.value.name).toBe(mockGpuData.name);
        expect(result.value.temperature).toBe(mockGpuData.temperature);
        expect(result.value.powerDraw).toBe(mockGpuData.powerUsage / 1000);
        expect(result.value.utilizationGpu).toBe(mockGpuData.utilization.gpu);
        expect(result.value.pciBusId).toBe(mockGpuData.pci.busId);
      }
    });
  });

  describe('getProcesses()', () => {
    it('returns running GPU processes', () => {
      const device = Device.getByIndex(0);
      const result = device.getProcesses();
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Should have compute + graphics processes (deduplicated)
        const totalExpected = mockProcesses.compute.length + mockProcesses.graphics.length;
        expect(result.value.length).toBe(totalExpected);

        // Check first process
        const firstProc = result.value[0];
        expect(firstProc.gpuIndex).toBe(0);
        expect(firstProc.pid).toBe(mockProcesses.compute[0].pid);
        expect(firstProc.processName).toBe(mockProcessNames[mockProcesses.compute[0].pid]);
      }
    });
  });

  describe('getHandle()', () => {
    it('returns the internal device handle', () => {
      const device = Device.getByIndex(0);
      const handle = device.getHandle();
      expect(handle).toBeDefined();
    });
  });
});
