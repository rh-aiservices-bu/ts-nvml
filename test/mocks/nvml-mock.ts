/**
 * Mock NVML bindings for unit testing without a GPU
 */

import { NvmlReturn } from '../../src/types/enums.js';

// Mock device handle
export const mockDeviceHandle = { __brand: 'nvmlDevice' } as unknown;

// Mock data for a simulated GPU
export const mockGpuData = {
  name: 'NVIDIA Mock GPU',
  uuid: 'GPU-mock-uuid-1234-5678-abcdef',
  memory: {
    total: 8n * 1024n * 1024n * 1024n, // 8 GiB
    free: 6n * 1024n * 1024n * 1024n,  // 6 GiB
    used: 2n * 1024n * 1024n * 1024n,  // 2 GiB
  },
  utilization: {
    gpu: 45,
    memory: 25,
  },
  temperature: 55,
  powerUsage: 150000, // milliwatts
  powerLimit: 300000, // milliwatts
  fanSpeed: 50,
  pState: 0, // P0
  pci: {
    busIdLegacy: '0000:00:1E.0',
    domain: 0,
    bus: 0,
    device: 30,
    pciDeviceId: 0x123456,
    pciSubSystemId: 0x789abc,
    busId: '00000000:00:1E.0',
  },
  persistenceMode: true,
  displayActive: false,
  computeMode: 0,
  migCurrentMode: 0,
  migPendingMode: 0,
  eccErrors: 0n,
};

// Mock process data
export const mockProcesses = {
  compute: [
    { pid: 1234, usedGpuMemory: 512n * 1024n * 1024n, gpuInstanceId: 0, computeInstanceId: 0 },
    { pid: 5678, usedGpuMemory: 1024n * 1024n * 1024n, gpuInstanceId: 0, computeInstanceId: 0 },
  ],
  graphics: [
    { pid: 9999, usedGpuMemory: 256n * 1024n * 1024n, gpuInstanceId: 0, computeInstanceId: 0 },
  ],
};

// Mock system data
export const mockSystemData = {
  driverVersion: '535.154.05',
  nvmlVersion: '12.535.154.05',
  cudaVersion: 12040, // CUDA 12.4
};

// Mock process names
export const mockProcessNames: Record<number, string> = {
  1234: '/usr/bin/python3',
  5678: '/opt/cuda/bin/cuda-app',
  9999: '/usr/bin/Xorg',
};

/**
 * Create mock bindings that can be used with vi.mock()
 */
export function createMockBindings() {
  return {
    // Init
    nvmlInit: () => NvmlReturn.SUCCESS,
    nvmlInitWithFlags: () => NvmlReturn.SUCCESS,
    nvmlShutdown: () => NvmlReturn.SUCCESS,

    // Device count and handles
    nvmlDeviceGetCount: () => ({ ret: NvmlReturn.SUCCESS, count: 1 }),
    nvmlDeviceGetHandleByIndex: (index: number) => {
      if (index === 0) {
        return { ret: NvmlReturn.SUCCESS, device: mockDeviceHandle };
      }
      return { ret: NvmlReturn.ERROR_INVALID_ARGUMENT, device: null };
    },
    nvmlDeviceGetHandleByUUID: (uuid: string) => {
      if (uuid === mockGpuData.uuid) {
        return { ret: NvmlReturn.SUCCESS, device: mockDeviceHandle };
      }
      return { ret: NvmlReturn.ERROR_NOT_FOUND, device: null };
    },

    // Device queries
    nvmlDeviceGetName: () => ({ ret: NvmlReturn.SUCCESS, name: mockGpuData.name }),
    nvmlDeviceGetUUID: () => ({ ret: NvmlReturn.SUCCESS, uuid: mockGpuData.uuid }),
    nvmlDeviceGetMemoryInfo: () => ({ ret: NvmlReturn.SUCCESS, memory: mockGpuData.memory }),
    nvmlDeviceGetUtilizationRates: () => ({
      ret: NvmlReturn.SUCCESS,
      utilization: mockGpuData.utilization,
    }),
    nvmlDeviceGetTemperature: () => ({
      ret: NvmlReturn.SUCCESS,
      temperature: mockGpuData.temperature,
    }),
    nvmlDeviceGetPowerUsage: () => ({ ret: NvmlReturn.SUCCESS, power: mockGpuData.powerUsage }),
    nvmlDeviceGetPowerManagementLimit: () => ({
      ret: NvmlReturn.SUCCESS,
      limit: mockGpuData.powerLimit,
    }),
    nvmlDeviceGetFanSpeed: () => ({ ret: NvmlReturn.SUCCESS, speed: mockGpuData.fanSpeed }),
    nvmlDeviceGetPerformanceState: () => ({ ret: NvmlReturn.SUCCESS, pState: mockGpuData.pState }),
    nvmlDeviceGetPciInfo: () => ({ ret: NvmlReturn.SUCCESS, pci: mockGpuData.pci }),
    nvmlDeviceGetPersistenceMode: () => ({
      ret: NvmlReturn.SUCCESS,
      enabled: mockGpuData.persistenceMode,
    }),
    nvmlDeviceGetDisplayActive: () => ({
      ret: NvmlReturn.SUCCESS,
      active: mockGpuData.displayActive,
    }),
    nvmlDeviceGetComputeMode: () => ({ ret: NvmlReturn.SUCCESS, mode: mockGpuData.computeMode }),
    nvmlDeviceGetMigMode: () => ({
      ret: NvmlReturn.SUCCESS,
      currentMode: mockGpuData.migCurrentMode,
      pendingMode: mockGpuData.migPendingMode,
    }),
    nvmlDeviceGetTotalEccErrors: () => ({ ret: NvmlReturn.SUCCESS, count: mockGpuData.eccErrors }),

    // Process queries
    nvmlDeviceGetComputeRunningProcesses: () => ({
      ret: NvmlReturn.SUCCESS,
      processes: mockProcesses.compute,
    }),
    nvmlDeviceGetGraphicsRunningProcesses: () => ({
      ret: NvmlReturn.SUCCESS,
      processes: mockProcesses.graphics,
    }),

    // System queries
    nvmlSystemGetDriverVersion: () => ({
      ret: NvmlReturn.SUCCESS,
      version: mockSystemData.driverVersion,
    }),
    nvmlSystemGetNvmlVersion: () => ({
      ret: NvmlReturn.SUCCESS,
      version: mockSystemData.nvmlVersion,
    }),
    nvmlSystemGetCudaDriverVersion: () => ({
      ret: NvmlReturn.SUCCESS,
      version: mockSystemData.cudaVersion,
    }),
    nvmlSystemGetCudaDriverVersion_v2: () => ({
      ret: NvmlReturn.SUCCESS,
      version: mockSystemData.cudaVersion,
    }),
    nvmlSystemGetProcessName: (pid: number) => ({
      ret: mockProcessNames[pid] ? NvmlReturn.SUCCESS : NvmlReturn.ERROR_NOT_FOUND,
      name: mockProcessNames[pid] ?? '',
    }),
    cudaVersionToString: (version: number) => {
      const major = Math.floor(version / 1000);
      const minor = Math.floor((version % 1000) / 10);
      return `${major}.${minor}`;
    },

    // Library management
    getLibrary: () => ({}),
    isLibraryLoaded: () => true,
    getLoadedLibraryPath: () => '/usr/lib64/libnvidia-ml.so.1',
    unloadLibrary: () => {},

    // Type exports
    NVML_DEVICE_NAME_BUFFER_SIZE: 96,
    NVML_DEVICE_UUID_BUFFER_SIZE: 96,
    NVML_SYSTEM_DRIVER_VERSION_BUFFER_SIZE: 80,
    NVML_SYSTEM_NVML_VERSION_BUFFER_SIZE: 80,
    charArrayToString: (arr: number[]) => String.fromCharCode(...arr.filter((c) => c !== 0)),
  };
}
