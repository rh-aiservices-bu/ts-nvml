import type { NvmlComputeMode, NvmlPState } from './enums.js';

/**
 * GPU memory information (maps to nvmlMemory_t)
 */
export interface MemoryInfo {
  /** Total installed GPU memory in bytes */
  total: bigint;
  /** Unallocated GPU memory in bytes */
  free: bigint;
  /** Allocated GPU memory in bytes */
  used: bigint;
}

/**
 * GPU utilization rates (maps to nvmlUtilization_t)
 */
export interface UtilizationRates {
  /** Percent of time GPU compute units were executing (0-100) */
  gpu: number;
  /** Percent of time GPU memory controller was active (0-100) */
  memory: number;
}

/**
 * PCI information for a device
 */
export interface PciInfo {
  /** PCI bus ID string (e.g., "0000:00:1E.0") */
  busId: string;
  /** PCI domain */
  domain: number;
  /** PCI bus number */
  bus: number;
  /** PCI device number */
  device: number;
  /** PCI function number */
  function: number;
  /** PCI device ID */
  pciDeviceId: number;
  /** PCI subsystem ID */
  pciSubsystemId: number;
}

/**
 * Running process information
 */
export interface ProcessInfo {
  /** Process ID */
  pid: number;
  /** GPU memory used by process in bytes */
  usedGpuMemory: bigint;
  /** GPU instance ID (for MIG) */
  gpuInstanceId?: number;
  /** Compute instance ID (for MIG) */
  computeInstanceId?: number;
}

/**
 * Basic GPU information (equivalent to sardeenz GpuInfo)
 */
export interface GpuBasicInfo {
  /** Device index */
  index: number;
  /** GPU name (e.g., "NVIDIA GeForce RTX 4090") */
  name: string;
  /** Total memory in MiB */
  memoryTotalMiB: number;
  /** Total memory in GiB */
  memoryTotalGiB: number;
}

/**
 * Comprehensive GPU status (equivalent to sardeenz GpuStatus)
 */
export interface GpuStatus {
  /** Device index */
  index: number;
  /** GPU name */
  name: string;
  /** Persistence mode enabled */
  persistenceMode: boolean;
  /** PCI bus ID */
  pciBusId: string;
  /** Display attached and active */
  displayActive: boolean;
  /** Corrected ECC errors (volatile) */
  eccErrorsCorrected: number | null;
  /** Fan speed percentage */
  fanSpeed: number | null;
  /** GPU temperature in Celsius */
  temperature: number;
  /** Performance state (P0-P15) */
  pstate: NvmlPState;
  /** Current power draw in watts */
  powerDraw: number;
  /** Power limit in watts */
  powerLimit: number;
  /** Used memory in MiB */
  memoryUsedMiB: number;
  /** Total memory in MiB */
  memoryTotalMiB: number;
  /** GPU utilization percentage */
  utilizationGpu: number;
  /** Memory utilization percentage */
  utilizationMemory: number;
  /** Compute mode */
  computeMode: NvmlComputeMode;
  /** MIG mode enabled */
  migMode: boolean | null;
}

/**
 * GPU process information (equivalent to sardeenz GpuProcess)
 */
export interface GpuProcess {
  /** GPU index */
  gpuIndex: number;
  /** Process ID */
  pid: number;
  /** Process name */
  processName: string;
  /** GPU memory used in MiB */
  usedMemoryMiB: number;
}

/**
 * Driver and version information (equivalent to sardeenz DriverInfo)
 */
export interface DriverInfo {
  /** NVIDIA driver version */
  driverVersion: string;
  /** NVML library version */
  nvmlVersion: string;
  /** CUDA driver version (e.g., "12.4") */
  cudaVersion: string;
}

/**
 * Complete system snapshot (equivalent to sardeenz NvidiaSmiInfo)
 */
export interface SystemSnapshot {
  /** Timestamp of the snapshot */
  timestamp: Date;
  /** Driver and version info */
  driver: DriverInfo;
  /** Status for all GPUs */
  gpus: GpuStatus[];
  /** All running GPU processes */
  processes: GpuProcess[];
}
