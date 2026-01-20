import koffi from 'koffi';
import { getLibrary } from './library.js';
import type { KoffiNvmlDevice } from './types.js';

// Generic function type for NVML bindings
type NvmlFunc = (...args: unknown[]) => number;

// Process info struct for v2 API - registered with Koffi, referenced by name in function declarations
const _nvmlProcessInfo_v2_t = koffi.struct('nvmlProcessInfo_v2_t', {
  pid: 'uint',
  usedGpuMemory: 'uint64',
  gpuInstanceId: 'uint',
  computeInstanceId: 'uint',
});
void _nvmlProcessInfo_v2_t; // Ensure struct is registered

// Maximum number of processes to query
const MAX_PROCESSES = 128;

// Lazily initialized function bindings
let _deviceGetComputeRunningProcesses: NvmlFunc | null = null;
let _deviceGetGraphicsRunningProcesses: NvmlFunc | null = null;

function getDeviceGetComputeRunningProcesses(): NvmlFunc {
  if (!_deviceGetComputeRunningProcesses) {
    // Use v3 API which returns nvmlProcessInfo_v2_t
    _deviceGetComputeRunningProcesses = getLibrary().func(
      'int nvmlDeviceGetComputeRunningProcesses_v3(nvmlDevice* device, _Inout_ uint *infoCount, _Out_ nvmlProcessInfo_v2_t *infos)'
    ) as NvmlFunc;
  }
  return _deviceGetComputeRunningProcesses;
}

function getDeviceGetGraphicsRunningProcesses(): NvmlFunc {
  if (!_deviceGetGraphicsRunningProcesses) {
    // Use v3 API which returns nvmlProcessInfo_v2_t
    _deviceGetGraphicsRunningProcesses = getLibrary().func(
      'int nvmlDeviceGetGraphicsRunningProcesses_v3(nvmlDevice* device, _Inout_ uint *infoCount, _Out_ nvmlProcessInfo_v2_t *infos)'
    ) as NvmlFunc;
  }
  return _deviceGetGraphicsRunningProcesses;
}

/**
 * Raw process info from NVML
 */
export interface RawProcessInfo {
  pid: number;
  usedGpuMemory: bigint;
  gpuInstanceId: number;
  computeInstanceId: number;
}

/**
 * Get compute (CUDA) running processes on a device
 */
export function nvmlDeviceGetComputeRunningProcesses(
  device: KoffiNvmlDevice
): { ret: number; processes: RawProcessInfo[] } {
  // Allocate array of process info structs
  const infoCount = [MAX_PROCESSES];
  const infos = new Array(MAX_PROCESSES).fill(null).map(() => ({
    pid: 0,
    usedGpuMemory: 0n,
    gpuInstanceId: 0,
    computeInstanceId: 0,
  }));

  const ret = getDeviceGetComputeRunningProcesses()(device, infoCount, infos);

  // Extract valid processes
  const count = infoCount[0] ?? 0;
  const processes: RawProcessInfo[] = [];
  for (let i = 0; i < count && i < MAX_PROCESSES; i++) {
    const info = infos[i];
    if (info && info.pid > 0) {
      processes.push({
        pid: info.pid,
        usedGpuMemory: BigInt(info.usedGpuMemory),
        gpuInstanceId: info.gpuInstanceId,
        computeInstanceId: info.computeInstanceId,
      });
    }
  }

  return { ret, processes };
}

/**
 * Get graphics running processes on a device
 */
export function nvmlDeviceGetGraphicsRunningProcesses(
  device: KoffiNvmlDevice
): { ret: number; processes: RawProcessInfo[] } {
  // Allocate array of process info structs
  const infoCount = [MAX_PROCESSES];
  const infos = new Array(MAX_PROCESSES).fill(null).map(() => ({
    pid: 0,
    usedGpuMemory: 0n,
    gpuInstanceId: 0,
    computeInstanceId: 0,
  }));

  const ret = getDeviceGetGraphicsRunningProcesses()(device, infoCount, infos);

  // Extract valid processes
  const count = infoCount[0] ?? 0;
  const processes: RawProcessInfo[] = [];
  for (let i = 0; i < count && i < MAX_PROCESSES; i++) {
    const info = infos[i];
    if (info && info.pid > 0) {
      processes.push({
        pid: info.pid,
        usedGpuMemory: BigInt(info.usedGpuMemory),
        gpuInstanceId: info.gpuInstanceId,
        computeInstanceId: info.computeInstanceId,
      });
    }
  }

  return { ret, processes };
}

/**
 * Get process name by PID (re-export for convenience)
 */
export { nvmlSystemGetProcessName } from './system.js';
