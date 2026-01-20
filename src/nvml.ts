import {
  nvmlInit,
  nvmlShutdown,
  nvmlDeviceGetCount,
  nvmlSystemGetDriverVersion,
  nvmlSystemGetNvmlVersion,
  nvmlSystemGetCudaDriverVersion_v2,
  cudaVersionToString,
} from './bindings/index.js';
import { Device } from './device.js';
import {
  NvmlReturn,
  NvmlError,
  isSuccess,
  type Result,
  type GpuStatus,
  type GpuProcess,
  type DriverInfo,
  type SystemSnapshot,
  ok,
  errFromReturn,
} from './types/index.js';

let initialized = false;

/**
 * NVML library namespace - initialization, shutdown, and system queries
 *
 * @example
 * ```typescript
 * import { Nvml, unwrap } from 'ts-nvml';
 *
 * // Initialize NVML
 * Nvml.init();
 *
 * // Query devices
 * const count = Nvml.getDeviceCount();
 * const device = Nvml.getDevice(0);
 *
 * // Cleanup
 * Nvml.shutdown();
 * ```
 */
export const Nvml = {
  /**
   * Initialize NVML library
   *
   * Must be called before any other NVML operations.
   *
   * @throws {NvmlError} If initialization fails
   */
  init(): void {
    const ret = nvmlInit();
    if (!isSuccess(ret)) {
      throw NvmlError.fromReturn(ret, 'Failed to initialize NVML');
    }
    initialized = true;
  },

  /**
   * Shutdown NVML library and release resources
   *
   * Should be called when done with NVML operations.
   *
   * @throws {NvmlError} If shutdown fails
   */
  shutdown(): void {
    const ret = nvmlShutdown();
    if (!isSuccess(ret)) {
      throw NvmlError.fromReturn(ret, 'Failed to shutdown NVML');
    }
    initialized = false;
  },

  /**
   * Check if NVML is initialized
   */
  isInitialized(): boolean {
    return initialized;
  },

  /**
   * Ensure NVML is initialized, throw if not
   *
   * @throws {NvmlError} If NVML is not initialized
   */
  ensureInitialized(): void {
    if (!initialized) {
      throw new NvmlError(
        NvmlReturn.ERROR_UNINITIALIZED,
        'NVML not initialized. Call Nvml.init() first.'
      );
    }
  },

  /**
   * Get the number of GPU devices
   *
   * @throws {NvmlError} If not initialized or query fails
   */
  getDeviceCount(): number {
    this.ensureInitialized();
    const { ret, count } = nvmlDeviceGetCount();
    if (!isSuccess(ret)) {
      throw NvmlError.fromReturn(ret, 'Failed to get device count');
    }
    return count;
  },

  /**
   * Get device by index
   *
   * @param index Device index (0-based)
   * @throws {NvmlError} If not initialized or device not found
   */
  getDevice(index: number): Device {
    this.ensureInitialized();
    return Device.getByIndex(index);
  },

  /**
   * Get device by UUID
   *
   * @param uuid Device UUID string
   * @throws {NvmlError} If not initialized or device not found
   */
  getDeviceByUUID(uuid: string): Device {
    this.ensureInitialized();
    return Device.getByUUID(uuid);
  },

  /**
   * Get all GPU devices
   *
   * @throws {NvmlError} If not initialized or enumeration fails
   */
  getAllDevices(): Device[] {
    const count = this.getDeviceCount();
    const devices: Device[] = [];
    for (let i = 0; i < count; i++) {
      devices.push(Device.getByIndex(i));
    }
    return devices;
  },

  /**
   * Get driver and version information
   */
  getDriverInfo(): Result<DriverInfo> {
    this.ensureInitialized();

    const driverResult = nvmlSystemGetDriverVersion();
    if (!isSuccess(driverResult.ret)) {
      return errFromReturn(driverResult.ret, 'Failed to get driver version');
    }

    const nvmlResult = nvmlSystemGetNvmlVersion();
    if (!isSuccess(nvmlResult.ret)) {
      return errFromReturn(nvmlResult.ret, 'Failed to get NVML version');
    }

    const cudaResult = nvmlSystemGetCudaDriverVersion_v2();
    if (!isSuccess(cudaResult.ret)) {
      return errFromReturn(cudaResult.ret, 'Failed to get CUDA version');
    }

    return ok({
      driverVersion: driverResult.version,
      nvmlVersion: nvmlResult.version,
      cudaVersion: cudaVersionToString(cudaResult.version),
    });
  },

  /**
   * Get NVIDIA driver version string
   */
  getDriverVersion(): Result<string> {
    this.ensureInitialized();
    const { ret, version } = nvmlSystemGetDriverVersion();
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get driver version');
    }
    return ok(version);
  },

  /**
   * Get NVML library version string
   */
  getNvmlVersion(): Result<string> {
    this.ensureInitialized();
    const { ret, version } = nvmlSystemGetNvmlVersion();
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get NVML version');
    }
    return ok(version);
  },

  /**
   * Get CUDA driver version string (e.g., "12.4")
   */
  getCudaVersion(): Result<string> {
    this.ensureInitialized();
    const { ret, version } = nvmlSystemGetCudaDriverVersion_v2();
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get CUDA version');
    }
    return ok(cudaVersionToString(version));
  },

  /**
   * Get status for all GPUs
   *
   * Convenience method that gets status for all devices.
   * Returns Result to handle partial failures gracefully.
   */
  getAllGpuStatus(): Result<GpuStatus[]> {
    this.ensureInitialized();

    const { ret, count } = nvmlDeviceGetCount();
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get device count');
    }

    const statuses: GpuStatus[] = [];
    for (let i = 0; i < count; i++) {
      const device = Device.getByIndex(i);
      const statusResult = device.getStatus();
      if (!statusResult.ok) {
        return statusResult;
      }
      statuses.push(statusResult.value);
    }

    return ok(statuses);
  },

  /**
   * Get complete system snapshot (equivalent to sardeenz NvidiaSmiInfo)
   */
  getSystemSnapshot(): Result<SystemSnapshot> {
    this.ensureInitialized();

    const driverInfoResult = this.getDriverInfo();
    if (!driverInfoResult.ok) {
      return driverInfoResult;
    }

    const gpuStatusResult = this.getAllGpuStatus();
    if (!gpuStatusResult.ok) {
      return gpuStatusResult;
    }

    // Collect processes from all devices
    const { ret, count } = nvmlDeviceGetCount();
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get device count for process query');
    }

    const allProcesses: GpuProcess[] = [];
    for (let i = 0; i < count; i++) {
      const device = Device.getByIndex(i);
      const processResult = device.getProcesses();
      if (!processResult.ok) {
        return processResult;
      }
      allProcesses.push(...processResult.value);
    }

    return ok({
      timestamp: new Date(),
      driver: driverInfoResult.value,
      gpus: gpuStatusResult.value,
      processes: allProcesses,
    });
  },
};
