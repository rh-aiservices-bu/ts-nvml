import { getLibrary } from './library.js';
import {
  NVML_DEVICE_NAME_BUFFER_SIZE,
  NVML_DEVICE_UUID_BUFFER_SIZE,
  type KoffiNvmlDevice,
  type RawNvmlMemory,
  type RawNvmlUtilization,
  type RawNvmlPciInfo,
} from './types.js';

// Generic function type for NVML bindings
type NvmlFunc = (...args: unknown[]) => number;

// Lazily initialized function bindings
let _deviceGetCount: NvmlFunc | null = null;
let _deviceGetHandleByIndex: NvmlFunc | null = null;
let _deviceGetHandleByUUID: NvmlFunc | null = null;
let _deviceGetName: NvmlFunc | null = null;
let _deviceGetUUID: NvmlFunc | null = null;
let _deviceGetMemoryInfo: NvmlFunc | null = null;
let _deviceGetUtilizationRates: NvmlFunc | null = null;
let _deviceGetTemperature: NvmlFunc | null = null;
let _deviceGetPowerUsage: NvmlFunc | null = null;
let _deviceGetPowerManagementLimit: NvmlFunc | null = null;
let _deviceGetFanSpeed: NvmlFunc | null = null;
let _deviceGetPerformanceState: NvmlFunc | null = null;
let _deviceGetPciInfo: NvmlFunc | null = null;
let _deviceGetPersistenceMode: NvmlFunc | null = null;
let _deviceGetDisplayActive: NvmlFunc | null = null;
let _deviceGetComputeMode: NvmlFunc | null = null;
let _deviceGetMigMode: NvmlFunc | null = null;
let _deviceGetTotalEccErrors: NvmlFunc | null = null;

// Function getters with lazy initialization

function getDeviceGetCount(): NvmlFunc {
  if (!_deviceGetCount) {
    _deviceGetCount = getLibrary().func(
      'int nvmlDeviceGetCount_v2(_Out_ uint *deviceCount)'
    ) as NvmlFunc;
  }
  return _deviceGetCount;
}

function getDeviceGetHandleByIndex(): NvmlFunc {
  if (!_deviceGetHandleByIndex) {
    _deviceGetHandleByIndex = getLibrary().func(
      'int nvmlDeviceGetHandleByIndex_v2(uint index, _Out_ nvmlDevice* *device)'
    ) as NvmlFunc;
  }
  return _deviceGetHandleByIndex;
}

function getDeviceGetHandleByUUID(): NvmlFunc {
  if (!_deviceGetHandleByUUID) {
    _deviceGetHandleByUUID = getLibrary().func(
      'int nvmlDeviceGetHandleByUUID(str uuid, _Out_ nvmlDevice* *device)'
    ) as NvmlFunc;
  }
  return _deviceGetHandleByUUID;
}

function getDeviceGetName(): NvmlFunc {
  if (!_deviceGetName) {
    _deviceGetName = getLibrary().func(
      'int nvmlDeviceGetName(nvmlDevice* device, _Out_ str *name, uint length)'
    ) as NvmlFunc;
  }
  return _deviceGetName;
}

function getDeviceGetUUID(): NvmlFunc {
  if (!_deviceGetUUID) {
    _deviceGetUUID = getLibrary().func(
      'int nvmlDeviceGetUUID(nvmlDevice* device, _Out_ str *uuid, uint length)'
    ) as NvmlFunc;
  }
  return _deviceGetUUID;
}

function getDeviceGetMemoryInfo(): NvmlFunc {
  if (!_deviceGetMemoryInfo) {
    _deviceGetMemoryInfo = getLibrary().func(
      'int nvmlDeviceGetMemoryInfo(nvmlDevice* device, _Out_ nvmlMemory_t *memory)'
    ) as NvmlFunc;
  }
  return _deviceGetMemoryInfo;
}

function getDeviceGetUtilizationRates(): NvmlFunc {
  if (!_deviceGetUtilizationRates) {
    _deviceGetUtilizationRates = getLibrary().func(
      'int nvmlDeviceGetUtilizationRates(nvmlDevice* device, _Out_ nvmlUtilization_t *utilization)'
    ) as NvmlFunc;
  }
  return _deviceGetUtilizationRates;
}

function getDeviceGetTemperature(): NvmlFunc {
  if (!_deviceGetTemperature) {
    _deviceGetTemperature = getLibrary().func(
      'int nvmlDeviceGetTemperature(nvmlDevice* device, int sensorType, _Out_ uint *temp)'
    ) as NvmlFunc;
  }
  return _deviceGetTemperature;
}

function getDeviceGetPowerUsage(): NvmlFunc {
  if (!_deviceGetPowerUsage) {
    _deviceGetPowerUsage = getLibrary().func(
      'int nvmlDeviceGetPowerUsage(nvmlDevice* device, _Out_ uint *power)'
    ) as NvmlFunc;
  }
  return _deviceGetPowerUsage;
}

function getDeviceGetPowerManagementLimit(): NvmlFunc {
  if (!_deviceGetPowerManagementLimit) {
    _deviceGetPowerManagementLimit = getLibrary().func(
      'int nvmlDeviceGetPowerManagementLimit(nvmlDevice* device, _Out_ uint *limit)'
    ) as NvmlFunc;
  }
  return _deviceGetPowerManagementLimit;
}

function getDeviceGetFanSpeed(): NvmlFunc {
  if (!_deviceGetFanSpeed) {
    _deviceGetFanSpeed = getLibrary().func(
      'int nvmlDeviceGetFanSpeed(nvmlDevice* device, _Out_ uint *speed)'
    ) as NvmlFunc;
  }
  return _deviceGetFanSpeed;
}

function getDeviceGetPerformanceState(): NvmlFunc {
  if (!_deviceGetPerformanceState) {
    _deviceGetPerformanceState = getLibrary().func(
      'int nvmlDeviceGetPerformanceState(nvmlDevice* device, _Out_ int *pState)'
    ) as NvmlFunc;
  }
  return _deviceGetPerformanceState;
}

function getDeviceGetPciInfo(): NvmlFunc {
  if (!_deviceGetPciInfo) {
    _deviceGetPciInfo = getLibrary().func(
      'int nvmlDeviceGetPciInfo_v3(nvmlDevice* device, _Out_ nvmlPciInfo_t *pci)'
    ) as NvmlFunc;
  }
  return _deviceGetPciInfo;
}

function getDeviceGetPersistenceMode(): NvmlFunc {
  if (!_deviceGetPersistenceMode) {
    _deviceGetPersistenceMode = getLibrary().func(
      'int nvmlDeviceGetPersistenceMode(nvmlDevice* device, _Out_ int *mode)'
    ) as NvmlFunc;
  }
  return _deviceGetPersistenceMode;
}

function getDeviceGetDisplayActive(): NvmlFunc {
  if (!_deviceGetDisplayActive) {
    _deviceGetDisplayActive = getLibrary().func(
      'int nvmlDeviceGetDisplayActive(nvmlDevice* device, _Out_ int *isActive)'
    ) as NvmlFunc;
  }
  return _deviceGetDisplayActive;
}

function getDeviceGetComputeMode(): NvmlFunc {
  if (!_deviceGetComputeMode) {
    _deviceGetComputeMode = getLibrary().func(
      'int nvmlDeviceGetComputeMode(nvmlDevice* device, _Out_ int *mode)'
    ) as NvmlFunc;
  }
  return _deviceGetComputeMode;
}

function getDeviceGetMigMode(): NvmlFunc {
  if (!_deviceGetMigMode) {
    _deviceGetMigMode = getLibrary().func(
      'int nvmlDeviceGetMigMode(nvmlDevice* device, _Out_ int *currentMode, _Out_ int *pendingMode)'
    ) as NvmlFunc;
  }
  return _deviceGetMigMode;
}

function getDeviceGetTotalEccErrors(): NvmlFunc {
  if (!_deviceGetTotalEccErrors) {
    _deviceGetTotalEccErrors = getLibrary().func(
      'int nvmlDeviceGetTotalEccErrors(nvmlDevice* device, int errorType, int counterType, _Out_ uint64 *eccCounts)'
    ) as NvmlFunc;
  }
  return _deviceGetTotalEccErrors;
}

// Exported binding functions

/**
 * Get the number of GPU devices
 */
export function nvmlDeviceGetCount(): { ret: number; count: number } {
  const count = [0];
  const ret = getDeviceGetCount()(count);
  return { ret, count: count[0] ?? 0 };
}

/**
 * Get device handle by index
 */
export function nvmlDeviceGetHandleByIndex(
  index: number
): { ret: number; device: KoffiNvmlDevice | null } {
  const device = [null];
  const ret = getDeviceGetHandleByIndex()(index, device);
  return { ret, device: device[0] };
}

/**
 * Get device handle by UUID
 */
export function nvmlDeviceGetHandleByUUID(
  uuid: string
): { ret: number; device: KoffiNvmlDevice | null } {
  const device = [null];
  const ret = getDeviceGetHandleByUUID()(uuid, device);
  return { ret, device: device[0] };
}

/**
 * Get device name
 */
export function nvmlDeviceGetName(
  device: KoffiNvmlDevice
): { ret: number; name: string } {
  const buffer = Buffer.alloc(NVML_DEVICE_NAME_BUFFER_SIZE);
  const ret = getDeviceGetName()(
    device,
    buffer,
    NVML_DEVICE_NAME_BUFFER_SIZE
  );
  const name = buffer.toString('utf8').replace(/\0/g, '');
  return { ret, name };
}

/**
 * Get device UUID
 */
export function nvmlDeviceGetUUID(
  device: KoffiNvmlDevice
): { ret: number; uuid: string } {
  const buffer = Buffer.alloc(NVML_DEVICE_UUID_BUFFER_SIZE);
  const ret = getDeviceGetUUID()(
    device,
    buffer,
    NVML_DEVICE_UUID_BUFFER_SIZE
  );
  const uuid = buffer.toString('utf8').replace(/\0/g, '');
  return { ret, uuid };
}

/**
 * Get memory information
 */
export function nvmlDeviceGetMemoryInfo(
  device: KoffiNvmlDevice
): { ret: number; memory: RawNvmlMemory } {
  const memory: RawNvmlMemory = { total: 0n, free: 0n, used: 0n };
  const ret = getDeviceGetMemoryInfo()(device, memory);
  return { ret, memory };
}

/**
 * Get utilization rates
 */
export function nvmlDeviceGetUtilizationRates(
  device: KoffiNvmlDevice
): { ret: number; utilization: RawNvmlUtilization } {
  const utilization: RawNvmlUtilization = { gpu: 0, memory: 0 };
  const ret = getDeviceGetUtilizationRates()(device, utilization);
  return { ret, utilization };
}

/**
 * Get GPU temperature
 *
 * @param device Device handle
 * @param sensorType Temperature sensor type (0 = GPU)
 * @returns Temperature in Celsius
 */
export function nvmlDeviceGetTemperature(
  device: KoffiNvmlDevice,
  sensorType: number = 0
): { ret: number; temperature: number } {
  const temp = [0];
  const ret = getDeviceGetTemperature()(device, sensorType, temp);
  return { ret, temperature: temp[0] ?? 0 };
}

/**
 * Get power usage in milliwatts
 */
export function nvmlDeviceGetPowerUsage(
  device: KoffiNvmlDevice
): { ret: number; power: number } {
  const power = [0];
  const ret = getDeviceGetPowerUsage()(device, power);
  return { ret, power: power[0] ?? 0 };
}

/**
 * Get power management limit in milliwatts
 */
export function nvmlDeviceGetPowerManagementLimit(
  device: KoffiNvmlDevice
): { ret: number; limit: number } {
  const limit = [0];
  const ret = getDeviceGetPowerManagementLimit()(device, limit);
  return { ret, limit: limit[0] ?? 0 };
}

/**
 * Get fan speed percentage
 */
export function nvmlDeviceGetFanSpeed(
  device: KoffiNvmlDevice
): { ret: number; speed: number } {
  const speed = [0];
  const ret = getDeviceGetFanSpeed()(device, speed);
  return { ret, speed: speed[0] ?? 0 };
}

/**
 * Get performance state (P-state)
 */
export function nvmlDeviceGetPerformanceState(
  device: KoffiNvmlDevice
): { ret: number; pState: number } {
  const pState = [0];
  const ret = getDeviceGetPerformanceState()(device, pState);
  return { ret, pState: pState[0] ?? 0 };
}

/**
 * Get PCI information
 */
export function nvmlDeviceGetPciInfo(
  device: KoffiNvmlDevice
): { ret: number; pci: RawNvmlPciInfo } {
  const pci: RawNvmlPciInfo = {
    busIdLegacy: '',
    domain: 0,
    bus: 0,
    device: 0,
    pciDeviceId: 0,
    pciSubSystemId: 0,
    busId: '',
  };
  const ret = getDeviceGetPciInfo()(device, pci);
  return { ret, pci };
}

/**
 * Get persistence mode
 */
export function nvmlDeviceGetPersistenceMode(
  device: KoffiNvmlDevice
): { ret: number; enabled: boolean } {
  const mode = [0];
  const ret = getDeviceGetPersistenceMode()(device, mode);
  return { ret, enabled: (mode[0] ?? 0) === 1 };
}

/**
 * Get display active status
 */
export function nvmlDeviceGetDisplayActive(
  device: KoffiNvmlDevice
): { ret: number; active: boolean } {
  const isActive = [0];
  const ret = getDeviceGetDisplayActive()(device, isActive);
  return { ret, active: (isActive[0] ?? 0) === 1 };
}

/**
 * Get compute mode
 */
export function nvmlDeviceGetComputeMode(
  device: KoffiNvmlDevice
): { ret: number; mode: number } {
  const mode = [0];
  const ret = getDeviceGetComputeMode()(device, mode);
  return { ret, mode: mode[0] ?? 0 };
}

/**
 * Get MIG mode
 */
export function nvmlDeviceGetMigMode(
  device: KoffiNvmlDevice
): { ret: number; currentMode: number; pendingMode: number } {
  const currentMode = [0];
  const pendingMode = [0];
  const ret = getDeviceGetMigMode()(device, currentMode, pendingMode);
  return {
    ret,
    currentMode: currentMode[0] ?? 0,
    pendingMode: pendingMode[0] ?? 0,
  };
}

/**
 * Get total ECC errors
 *
 * @param device Device handle
 * @param errorType 0 = corrected, 1 = uncorrected
 * @param counterType 0 = volatile, 1 = aggregate
 */
export function nvmlDeviceGetTotalEccErrors(
  device: KoffiNvmlDevice,
  errorType: number,
  counterType: number
): { ret: number; count: bigint } {
  const count = [0n];
  const ret = getDeviceGetTotalEccErrors()(
    device,
    errorType,
    counterType,
    count
  );
  return { ret, count: BigInt(count[0] ?? 0) };
}
