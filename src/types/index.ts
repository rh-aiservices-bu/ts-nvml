// Enums
export {
  NvmlReturn,
  NvmlTemperatureSensors,
  NvmlClockType,
  NvmlPState,
  NvmlComputeMode,
  NvmlEnableState,
  NvmlMemoryErrorType,
  NvmlEccCounterType,
  NvmlMemoryLocation,
  nvmlErrorString,
} from './enums.js';

// Structs/Interfaces
export type {
  MemoryInfo,
  UtilizationRates,
  PciInfo,
  ProcessInfo,
  GpuBasicInfo,
  GpuStatus,
  GpuProcess,
  DriverInfo,
  SystemSnapshot,
} from './structs.js';

// Result type and utilities
export {
  NvmlError,
  ok,
  err,
  errFromReturn,
  unwrap,
  unwrapOr,
  map,
  andThen,
  isSuccess,
} from './result.js';
export type { Result } from './result.js';
