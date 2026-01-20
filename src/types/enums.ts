/**
 * NVML return codes - maps to nvmlReturn_t from nvml.h
 */
export enum NvmlReturn {
  SUCCESS = 0,
  ERROR_UNINITIALIZED = 1,
  ERROR_INVALID_ARGUMENT = 2,
  ERROR_NOT_SUPPORTED = 3,
  ERROR_NO_PERMISSION = 4,
  ERROR_ALREADY_INITIALIZED = 5,
  ERROR_NOT_FOUND = 6,
  ERROR_INSUFFICIENT_SIZE = 7,
  ERROR_INSUFFICIENT_POWER = 8,
  ERROR_DRIVER_NOT_LOADED = 9,
  ERROR_TIMEOUT = 10,
  ERROR_IRQ_ISSUE = 11,
  ERROR_LIBRARY_NOT_FOUND = 12,
  ERROR_FUNCTION_NOT_FOUND = 13,
  ERROR_CORRUPTED_INFOROM = 14,
  ERROR_GPU_IS_LOST = 15,
  ERROR_RESET_REQUIRED = 16,
  ERROR_OPERATING_SYSTEM = 17,
  ERROR_LIB_RM_VERSION_MISMATCH = 18,
  ERROR_IN_USE = 19,
  ERROR_MEMORY = 20,
  ERROR_NO_DATA = 21,
  ERROR_VGPU_ECC_NOT_SUPPORTED = 22,
  ERROR_INSUFFICIENT_RESOURCES = 23,
  ERROR_FREQ_NOT_SUPPORTED = 24,
  ERROR_ARGUMENT_VERSION_MISMATCH = 25,
  ERROR_DEPRECATED = 26,
  ERROR_NOT_READY = 27,
  ERROR_GPU_NOT_FOUND = 28,
  ERROR_INVALID_STATE = 29,
  ERROR_UNKNOWN = 999,
}

/**
 * Temperature sensor types
 */
export enum NvmlTemperatureSensors {
  /** Temperature sensor for the GPU die */
  GPU = 0,
}

/**
 * GPU clock types
 */
export enum NvmlClockType {
  GRAPHICS = 0,
  SM = 1,
  MEM = 2,
  VIDEO = 3,
}

/**
 * Performance state (P-state)
 */
export enum NvmlPState {
  P0 = 0,
  P1 = 1,
  P2 = 2,
  P3 = 3,
  P4 = 4,
  P5 = 5,
  P6 = 6,
  P7 = 7,
  P8 = 8,
  P9 = 9,
  P10 = 10,
  P11 = 11,
  P12 = 12,
  P15 = 15, // Unknown performance state
  UNKNOWN = 32,
}

/**
 * Compute mode
 */
export enum NvmlComputeMode {
  /** Default mode - multiple contexts allowed */
  DEFAULT = 0,
  /** Exclusive thread mode (deprecated) */
  EXCLUSIVE_THREAD = 1,
  /** No compute mode - no CUDA contexts allowed */
  PROHIBITED = 2,
  /** Exclusive process mode - only one context in one process */
  EXCLUSIVE_PROCESS = 3,
}

/**
 * Enable states for features
 */
export enum NvmlEnableState {
  DISABLED = 0,
  ENABLED = 1,
}

/**
 * ECC memory types
 */
export enum NvmlMemoryErrorType {
  /** Correctable single bit ECC errors */
  CORRECTED = 0,
  /** Uncorrectable double bit ECC errors */
  UNCORRECTED = 1,
}

/**
 * ECC counter types
 */
export enum NvmlEccCounterType {
  /** Volatile counts since last driver load */
  VOLATILE = 0,
  /** Aggregate counts persisted across reboots */
  AGGREGATE = 1,
}

/**
 * Memory locations for ECC error counts
 */
export enum NvmlMemoryLocation {
  L1_CACHE = 0,
  L2_CACHE = 1,
  DRAM = 2,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  DEVICE_MEMORY = 2, // Alias for DRAM (per NVML API)
  REGISTER_FILE = 3,
  TEXTURE_MEMORY = 4,
  TEXTURE_SHM = 5,
  CBU = 6,
  SRAM = 7,
}

/**
 * Human-readable error messages for NVML return codes
 */
export function nvmlErrorString(ret: NvmlReturn): string {
  const messages: Record<NvmlReturn, string> = {
    [NvmlReturn.SUCCESS]: 'Success',
    [NvmlReturn.ERROR_UNINITIALIZED]: 'NVML was not initialized',
    [NvmlReturn.ERROR_INVALID_ARGUMENT]: 'Invalid argument',
    [NvmlReturn.ERROR_NOT_SUPPORTED]: 'Operation not supported',
    [NvmlReturn.ERROR_NO_PERMISSION]: 'Insufficient permissions',
    [NvmlReturn.ERROR_ALREADY_INITIALIZED]: 'NVML already initialized',
    [NvmlReturn.ERROR_NOT_FOUND]: 'Not found',
    [NvmlReturn.ERROR_INSUFFICIENT_SIZE]: 'Insufficient buffer size',
    [NvmlReturn.ERROR_INSUFFICIENT_POWER]: 'Insufficient power',
    [NvmlReturn.ERROR_DRIVER_NOT_LOADED]: 'NVIDIA driver not loaded',
    [NvmlReturn.ERROR_TIMEOUT]: 'Operation timed out',
    [NvmlReturn.ERROR_IRQ_ISSUE]: 'Interrupt request issue',
    [NvmlReturn.ERROR_LIBRARY_NOT_FOUND]: 'NVML library not found',
    [NvmlReturn.ERROR_FUNCTION_NOT_FOUND]: 'Function not found',
    [NvmlReturn.ERROR_CORRUPTED_INFOROM]: 'InfoROM corrupted',
    [NvmlReturn.ERROR_GPU_IS_LOST]: 'GPU is lost',
    [NvmlReturn.ERROR_RESET_REQUIRED]: 'GPU reset required',
    [NvmlReturn.ERROR_OPERATING_SYSTEM]: 'Operating system error',
    [NvmlReturn.ERROR_LIB_RM_VERSION_MISMATCH]: 'RM/library version mismatch',
    [NvmlReturn.ERROR_IN_USE]: 'GPU is in use',
    [NvmlReturn.ERROR_MEMORY]: 'Memory allocation failed',
    [NvmlReturn.ERROR_NO_DATA]: 'No data available',
    [NvmlReturn.ERROR_VGPU_ECC_NOT_SUPPORTED]: 'vGPU ECC not supported',
    [NvmlReturn.ERROR_INSUFFICIENT_RESOURCES]: 'Insufficient resources',
    [NvmlReturn.ERROR_FREQ_NOT_SUPPORTED]: 'Frequency not supported',
    [NvmlReturn.ERROR_ARGUMENT_VERSION_MISMATCH]: 'Argument version mismatch',
    [NvmlReturn.ERROR_DEPRECATED]: 'Deprecated function',
    [NvmlReturn.ERROR_NOT_READY]: 'Not ready',
    [NvmlReturn.ERROR_GPU_NOT_FOUND]: 'GPU not found',
    [NvmlReturn.ERROR_INVALID_STATE]: 'Invalid state',
    [NvmlReturn.ERROR_UNKNOWN]: 'Unknown error',
  };
  return messages[ret] ?? `Unknown error code: ${ret}`;
}
