import koffi from 'koffi';

// Buffer size constants from nvml.h
export const NVML_DEVICE_NAME_BUFFER_SIZE = 64;
export const NVML_DEVICE_NAME_V2_BUFFER_SIZE = 96;
export const NVML_DEVICE_UUID_BUFFER_SIZE = 80;
export const NVML_DEVICE_UUID_V2_BUFFER_SIZE = 96;
export const NVML_SYSTEM_DRIVER_VERSION_BUFFER_SIZE = 80;
export const NVML_SYSTEM_NVML_VERSION_BUFFER_SIZE = 80;
export const NVML_DEVICE_PCI_BUS_ID_BUFFER_SIZE = 32;
export const NVML_DEVICE_PCI_BUS_ID_BUFFER_V2_SIZE = 16;

// Opaque device handle - used in function declarations as 'nvmlDevice*'
export const nvmlDevice = koffi.opaque('nvmlDevice');

// Structs matching NVML C definitions

/**
 * nvmlMemory_t - Memory information for a device
 */
export const nvmlMemory_t = koffi.struct('nvmlMemory_t', {
  total: 'uint64',
  free: 'uint64',
  used: 'uint64',
});

/**
 * nvmlUtilization_t - Utilization rates
 */
export const nvmlUtilization_t = koffi.struct('nvmlUtilization_t', {
  gpu: 'uint',
  memory: 'uint',
});

/**
 * nvmlPciInfo_t - PCI information
 * Using 'String' hint for char arrays to auto-convert to JS strings
 */
export const nvmlPciInfo_t = koffi.struct('nvmlPciInfo_t', {
  busIdLegacy: koffi.array('char', 16, 'String'), // Deprecated
  domain: 'uint',
  bus: 'uint',
  device: 'uint',
  pciDeviceId: 'uint',
  pciSubSystemId: 'uint',
  busId: koffi.array('char', 32, 'String'),
});

/**
 * nvmlProcessInfo_t - Running process information
 */
export const nvmlProcessInfo_t = koffi.struct('nvmlProcessInfo_t', {
  pid: 'uint',
  usedGpuMemory: 'uint64',
  gpuInstanceId: 'uint',
  computeInstanceId: 'uint',
});

// Type aliases for Koffi function declarations
export type KoffiNvmlDevice = unknown;

/**
 * Raw memory struct from Koffi
 */
export interface RawNvmlMemory {
  total: number | bigint;
  free: number | bigint;
  used: number | bigint;
}

/**
 * Raw utilization struct from Koffi
 */
export interface RawNvmlUtilization {
  gpu: number;
  memory: number;
}

/**
 * Raw PCI info struct from Koffi
 * char arrays with 'String' hint are converted to JS strings
 */
export interface RawNvmlPciInfo {
  busIdLegacy: string;
  domain: number;
  bus: number;
  device: number;
  pciDeviceId: number;
  pciSubSystemId: number;
  busId: string;
}

/**
 * Raw process info struct from Koffi
 */
export interface RawNvmlProcessInfo {
  pid: number;
  usedGpuMemory: number | bigint;
  gpuInstanceId: number;
  computeInstanceId: number;
}

/**
 * Convert a char array to string
 */
export function charArrayToString(arr: number[]): string {
  const nullIndex = arr.indexOf(0);
  const bytes = nullIndex >= 0 ? arr.slice(0, nullIndex) : arr;
  return String.fromCharCode(...bytes);
}
