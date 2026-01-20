// Library management
export {
  getLibrary,
  isLibraryLoaded,
  getLoadedLibraryPath,
  unloadLibrary,
} from './library.js';

// Initialization
export {
  nvmlInit,
  nvmlInitWithFlags,
  nvmlShutdown,
  NVML_INIT_FLAG_NO_GPUS,
  NVML_INIT_FLAG_NO_ATTACH,
} from './init.js';

// Device bindings
export {
  nvmlDeviceGetCount,
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
} from './device.js';

// System bindings
export {
  nvmlSystemGetDriverVersion,
  nvmlSystemGetNvmlVersion,
  nvmlSystemGetCudaDriverVersion,
  nvmlSystemGetCudaDriverVersion_v2,
  nvmlSystemGetProcessName,
  cudaVersionToString,
} from './system.js';

// Process bindings
export {
  nvmlDeviceGetComputeRunningProcesses,
  nvmlDeviceGetGraphicsRunningProcesses,
  type RawProcessInfo,
} from './process.js';

// Types
export type { KoffiNvmlDevice, RawNvmlMemory, RawNvmlUtilization, RawNvmlPciInfo } from './types.js';
export {
  NVML_DEVICE_NAME_BUFFER_SIZE,
  NVML_DEVICE_UUID_BUFFER_SIZE,
  NVML_SYSTEM_DRIVER_VERSION_BUFFER_SIZE,
  NVML_SYSTEM_NVML_VERSION_BUFFER_SIZE,
  charArrayToString,
} from './types.js';
