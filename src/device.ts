import {
  nvmlDeviceGetHandleByIndex,
  nvmlDeviceGetHandleByUUID,
  nvmlDeviceGetName,
  nvmlDeviceGetUUID,
  nvmlDeviceGetMemoryInfo,
  nvmlDeviceGetUtilizationRates,
  nvmlDeviceGetTemperature,
  nvmlDeviceGetPowerUsage,
  nvmlDeviceGetPowerManagementLimit,
  nvmlDeviceGetFanSpeed,
  nvmlDeviceGetPerformanceState,
  nvmlDeviceGetPciInfo,
  nvmlDeviceGetPersistenceMode,
  nvmlDeviceGetDisplayActive,
  nvmlDeviceGetComputeMode,
  nvmlDeviceGetMigMode,
  nvmlDeviceGetTotalEccErrors,
  nvmlDeviceGetComputeRunningProcesses,
  nvmlDeviceGetGraphicsRunningProcesses,
  nvmlSystemGetProcessName,
  type KoffiNvmlDevice,
} from './bindings/index.js';
import {
  NvmlReturn,
  NvmlTemperatureSensors,
  NvmlMemoryErrorType,
  NvmlEccCounterType,
  NvmlPState,
  NvmlComputeMode,
  type MemoryInfo,
  type UtilizationRates,
  type PciInfo,
  type GpuBasicInfo,
  type GpuStatus,
  type GpuProcess,
  type Result,
  ok,
  errFromReturn,
  isSuccess,
  NvmlError,
} from './types/index.js';

/**
 * Represents an NVIDIA GPU device
 *
 * @example
 * ```typescript
 * import { Nvml, unwrap } from 'ts-nvml';
 *
 * Nvml.init();
 * const device = Device.getByIndex(0);
 * const memory = unwrap(device.getMemoryInfo());
 * console.log(`Total: ${memory.total} bytes`);
 * Nvml.shutdown();
 * ```
 */
export class Device {
  private constructor(
    private readonly handle: KoffiNvmlDevice,
    public readonly index: number
  ) {}

  /**
   * Get device by index
   *
   * @param index Device index (0-based, must be a non-negative integer)
   * @throws {Error} If index is invalid
   * @throws {NvmlError} If device cannot be retrieved
   */
  static getByIndex(index: number): Device {
    if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) {
      throw new Error(`Invalid device index: expected non-negative integer, got ${index}`);
    }
    const { ret, device } = nvmlDeviceGetHandleByIndex(index);
    if (!isSuccess(ret) || device === null) {
      throw NvmlError.fromReturn(ret, `Failed to get device at index ${index}`);
    }
    return new Device(device, index);
  }

  /**
   * Get device by UUID
   *
   * @param uuid Device UUID string (must be a non-empty string)
   * @throws {Error} If uuid is invalid
   * @throws {NvmlError} If device cannot be retrieved
   */
  static getByUUID(uuid: string): Device {
    if (typeof uuid !== 'string' || uuid.trim().length === 0) {
      throw new Error('Invalid device UUID: expected non-empty string');
    }
    const { ret, device } = nvmlDeviceGetHandleByUUID(uuid);
    if (!isSuccess(ret) || device === null) {
      throw NvmlError.fromReturn(ret, `Failed to get device with UUID ${uuid}`);
    }
    // Index is unknown when getting by UUID, use -1
    return new Device(device, -1);
  }

  /**
   * Get device name (e.g., "NVIDIA GeForce RTX 4090")
   */
  getName(): Result<string> {
    const { ret, name } = nvmlDeviceGetName(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get device name');
    }
    return ok(name);
  }

  /**
   * Get device UUID
   */
  getUUID(): Result<string> {
    const { ret, uuid } = nvmlDeviceGetUUID(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get device UUID');
    }
    return ok(uuid);
  }

  /**
   * Get memory information (total, free, used in bytes)
   */
  getMemoryInfo(): Result<MemoryInfo> {
    const { ret, memory } = nvmlDeviceGetMemoryInfo(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get memory info');
    }
    return ok({
      total: BigInt(memory.total),
      free: BigInt(memory.free),
      used: BigInt(memory.used),
    });
  }

  /**
   * Get GPU and memory utilization rates (0-100%)
   */
  getUtilizationRates(): Result<UtilizationRates> {
    const { ret, utilization } = nvmlDeviceGetUtilizationRates(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get utilization rates');
    }
    return ok({
      gpu: utilization.gpu,
      memory: utilization.memory,
    });
  }

  /**
   * Get GPU temperature in Celsius
   */
  getTemperature(): Result<number> {
    const { ret, temperature } = nvmlDeviceGetTemperature(
      this.handle,
      NvmlTemperatureSensors.GPU
    );
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get temperature');
    }
    return ok(temperature);
  }

  /**
   * Get power usage in watts
   */
  getPowerUsage(): Result<number> {
    const { ret, power } = nvmlDeviceGetPowerUsage(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get power usage');
    }
    // Convert milliwatts to watts
    return ok(power / 1000);
  }

  /**
   * Get power management limit in watts
   */
  getPowerLimit(): Result<number> {
    const { ret, limit } = nvmlDeviceGetPowerManagementLimit(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get power limit');
    }
    // Convert milliwatts to watts
    return ok(limit / 1000);
  }

  /**
   * Get fan speed percentage (0-100)
   *
   * Note: Returns null for passively cooled GPUs
   */
  getFanSpeed(): Result<number | null> {
    const { ret, speed } = nvmlDeviceGetFanSpeed(this.handle);
    if (ret === NvmlReturn.ERROR_NOT_SUPPORTED) {
      return ok(null);
    }
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get fan speed');
    }
    return ok(speed);
  }

  /**
   * Get performance state (P-state)
   */
  getPerformanceState(): Result<NvmlPState> {
    const { ret, pState } = nvmlDeviceGetPerformanceState(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get performance state');
    }
    return ok(pState as NvmlPState);
  }

  /**
   * Get PCI information
   */
  getPciInfo(): Result<PciInfo> {
    const { ret, pci } = nvmlDeviceGetPciInfo(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get PCI info');
    }
    return ok({
      busId: pci.busId,
      domain: pci.domain,
      bus: pci.bus,
      device: pci.device,
      function: 0, // Not directly available in struct
      pciDeviceId: pci.pciDeviceId,
      pciSubsystemId: pci.pciSubSystemId,
    });
  }

  /**
   * Get persistence mode status
   */
  getPersistenceMode(): Result<boolean> {
    const { ret, enabled } = nvmlDeviceGetPersistenceMode(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get persistence mode');
    }
    return ok(enabled);
  }

  /**
   * Check if a display is active on this device
   */
  getDisplayActive(): Result<boolean> {
    const { ret, active } = nvmlDeviceGetDisplayActive(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get display active status');
    }
    return ok(active);
  }

  /**
   * Get compute mode
   */
  getComputeMode(): Result<NvmlComputeMode> {
    const { ret, mode } = nvmlDeviceGetComputeMode(this.handle);
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get compute mode');
    }
    return ok(mode as NvmlComputeMode);
  }

  /**
   * Get MIG mode status
   *
   * Note: Returns null if MIG is not supported
   */
  getMigMode(): Result<boolean | null> {
    const { ret, currentMode } = nvmlDeviceGetMigMode(this.handle);
    if (ret === NvmlReturn.ERROR_NOT_SUPPORTED) {
      return ok(null);
    }
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get MIG mode');
    }
    return ok(currentMode === 1);
  }

  /**
   * Get total corrected ECC errors (volatile counter)
   *
   * Note: Returns null if ECC is not supported
   */
  getEccErrorsCorrected(): Result<number | null> {
    const { ret, count } = nvmlDeviceGetTotalEccErrors(
      this.handle,
      NvmlMemoryErrorType.CORRECTED,
      NvmlEccCounterType.VOLATILE
    );
    if (ret === NvmlReturn.ERROR_NOT_SUPPORTED) {
      return ok(null);
    }
    if (!isSuccess(ret)) {
      return errFromReturn(ret, 'Failed to get ECC errors');
    }
    return ok(Number(count));
  }

  /**
   * Get basic device info (equivalent to sardeenz GpuInfo)
   */
  getBasicInfo(): Result<GpuBasicInfo> {
    const nameResult = this.getName();
    if (!nameResult.ok) return nameResult;

    const memoryResult = this.getMemoryInfo();
    if (!memoryResult.ok) return memoryResult;

    const totalMiB = Number(memoryResult.value.total / (1024n * 1024n));

    return ok({
      index: this.index,
      name: nameResult.value,
      memoryTotalMiB: totalMiB,
      memoryTotalGiB: Math.round((totalMiB / 1024) * 10) / 10,
    });
  }

  /**
   * Get comprehensive device status (equivalent to sardeenz GpuStatus)
   */
  getStatus(): Result<GpuStatus> {
    // Get all required fields
    const nameResult = this.getName();
    if (!nameResult.ok) return nameResult;

    const persistenceResult = this.getPersistenceMode();
    if (!persistenceResult.ok) return persistenceResult;

    const pciResult = this.getPciInfo();
    if (!pciResult.ok) return pciResult;

    const displayResult = this.getDisplayActive();
    if (!displayResult.ok) return displayResult;

    const eccResult = this.getEccErrorsCorrected();
    if (!eccResult.ok) return eccResult;

    const fanResult = this.getFanSpeed();
    if (!fanResult.ok) return fanResult;

    const tempResult = this.getTemperature();
    if (!tempResult.ok) return tempResult;

    const pstateResult = this.getPerformanceState();
    if (!pstateResult.ok) return pstateResult;

    const powerResult = this.getPowerUsage();
    if (!powerResult.ok) return powerResult;

    const powerLimitResult = this.getPowerLimit();
    if (!powerLimitResult.ok) return powerLimitResult;

    const memoryResult = this.getMemoryInfo();
    if (!memoryResult.ok) return memoryResult;

    const utilResult = this.getUtilizationRates();
    if (!utilResult.ok) return utilResult;

    const computeModeResult = this.getComputeMode();
    if (!computeModeResult.ok) return computeModeResult;

    const migResult = this.getMigMode();
    if (!migResult.ok) return migResult;

    const usedMiB = Number(memoryResult.value.used / (1024n * 1024n));
    const totalMiB = Number(memoryResult.value.total / (1024n * 1024n));

    return ok({
      index: this.index,
      name: nameResult.value,
      persistenceMode: persistenceResult.value,
      pciBusId: pciResult.value.busId,
      displayActive: displayResult.value,
      eccErrorsCorrected: eccResult.value,
      fanSpeed: fanResult.value,
      temperature: tempResult.value,
      pstate: pstateResult.value,
      powerDraw: powerResult.value,
      powerLimit: powerLimitResult.value,
      memoryUsedMiB: usedMiB,
      memoryTotalMiB: totalMiB,
      utilizationGpu: utilResult.value.gpu,
      utilizationMemory: utilResult.value.memory,
      computeMode: computeModeResult.value,
      migMode: migResult.value,
    });
  }

  /**
   * Get running processes on this device (both compute and graphics)
   *
   * Returns combined list of all processes using this GPU.
   */
  getProcesses(): Result<GpuProcess[]> {
    const processes: GpuProcess[] = [];

    // Get compute (CUDA) processes
    const computeResult = nvmlDeviceGetComputeRunningProcesses(this.handle);
    if (!isSuccess(computeResult.ret)) {
      return errFromReturn(computeResult.ret, 'Failed to get compute processes');
    }

    // Get graphics processes
    const graphicsResult = nvmlDeviceGetGraphicsRunningProcesses(this.handle);
    if (!isSuccess(graphicsResult.ret)) {
      return errFromReturn(graphicsResult.ret, 'Failed to get graphics processes');
    }

    // Combine and convert to GpuProcess format
    const allRawProcesses = [...computeResult.processes, ...graphicsResult.processes];

    // Deduplicate by PID (a process can appear in both lists)
    const seenPids = new Set<number>();
    for (const rawProc of allRawProcesses) {
      if (seenPids.has(rawProc.pid)) {
        continue;
      }
      seenPids.add(rawProc.pid);

      // Get process name
      const nameResult = nvmlSystemGetProcessName(rawProc.pid);
      const processName = isSuccess(nameResult.ret) ? nameResult.name : `pid:${rawProc.pid}`;

      // Convert memory from bytes to MiB
      const usedMemoryMiB = Number(rawProc.usedGpuMemory / (1024n * 1024n));

      processes.push({
        gpuIndex: this.index,
        pid: rawProc.pid,
        processName,
        usedMemoryMiB,
      });
    }

    return ok(processes);
  }

  /**
   * Get the internal device handle (for advanced usage)
   */
  getHandle(): KoffiNvmlDevice {
    return this.handle;
  }
}
