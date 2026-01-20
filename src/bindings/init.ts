import { getLibrary } from './library.js';

// Lazily initialized function bindings
type NvmlFunc = (...args: unknown[]) => number;

let _nvmlInit: NvmlFunc | null = null;
let _nvmlInitWithFlags: NvmlFunc | null = null;
let _nvmlShutdown: NvmlFunc | null = null;

/**
 * Get nvmlInit_v2 binding
 */
function getNvmlInit(): NvmlFunc {
  if (!_nvmlInit) {
    _nvmlInit = getLibrary().func('int nvmlInit_v2()') as NvmlFunc;
  }
  return _nvmlInit;
}

/**
 * Get nvmlInitWithFlags binding
 */
function getNvmlInitWithFlags(): NvmlFunc {
  if (!_nvmlInitWithFlags) {
    _nvmlInitWithFlags = getLibrary().func('int nvmlInitWithFlags(uint flags)') as NvmlFunc;
  }
  return _nvmlInitWithFlags;
}

/**
 * Get nvmlShutdown binding
 */
function getNvmlShutdown(): NvmlFunc {
  if (!_nvmlShutdown) {
    _nvmlShutdown = getLibrary().func('int nvmlShutdown()') as NvmlFunc;
  }
  return _nvmlShutdown;
}

/**
 * Initialize NVML library
 *
 * @returns NVML return code (0 = success)
 */
export function nvmlInit(): number {
  return getNvmlInit()();
}

/**
 * Initialize NVML library with flags
 *
 * @param flags Initialization flags
 * @returns NVML return code (0 = success)
 */
export function nvmlInitWithFlags(flags: number): number {
  return getNvmlInitWithFlags()(flags);
}

/**
 * Shutdown NVML library
 *
 * @returns NVML return code (0 = success)
 */
export function nvmlShutdown(): number {
  return getNvmlShutdown()();
}

// Initialization flags
export const NVML_INIT_FLAG_NO_GPUS = 1;
export const NVML_INIT_FLAG_NO_ATTACH = 2;
