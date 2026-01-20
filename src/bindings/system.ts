import { getLibrary } from './library.js';
import {
  NVML_SYSTEM_DRIVER_VERSION_BUFFER_SIZE,
  NVML_SYSTEM_NVML_VERSION_BUFFER_SIZE,
} from './types.js';

// Generic function type for NVML bindings
type NvmlFunc = (...args: unknown[]) => number;

// Lazily initialized function bindings
let _systemGetDriverVersion: NvmlFunc | null = null;
let _systemGetNvmlVersion: NvmlFunc | null = null;
let _systemGetCudaDriverVersion: NvmlFunc | null = null;
let _systemGetCudaDriverVersion_v2: NvmlFunc | null = null;
let _systemGetProcessName: NvmlFunc | null = null;

function getSystemGetDriverVersion(): NvmlFunc {
  if (!_systemGetDriverVersion) {
    _systemGetDriverVersion = getLibrary().func(
      'int nvmlSystemGetDriverVersion(_Out_ str *version, uint length)'
    ) as NvmlFunc;
  }
  return _systemGetDriverVersion;
}

function getSystemGetNvmlVersion(): NvmlFunc {
  if (!_systemGetNvmlVersion) {
    _systemGetNvmlVersion = getLibrary().func(
      'int nvmlSystemGetNVMLVersion(_Out_ str *version, uint length)'
    ) as NvmlFunc;
  }
  return _systemGetNvmlVersion;
}

function getSystemGetCudaDriverVersion(): NvmlFunc {
  if (!_systemGetCudaDriverVersion) {
    _systemGetCudaDriverVersion = getLibrary().func(
      'int nvmlSystemGetCudaDriverVersion(_Out_ int *cudaDriverVersion)'
    ) as NvmlFunc;
  }
  return _systemGetCudaDriverVersion;
}

function getSystemGetCudaDriverVersion_v2(): NvmlFunc {
  if (!_systemGetCudaDriverVersion_v2) {
    _systemGetCudaDriverVersion_v2 = getLibrary().func(
      'int nvmlSystemGetCudaDriverVersion_v2(_Out_ int *cudaDriverVersion)'
    ) as NvmlFunc;
  }
  return _systemGetCudaDriverVersion_v2;
}

function getSystemGetProcessName(): NvmlFunc {
  if (!_systemGetProcessName) {
    _systemGetProcessName = getLibrary().func(
      'int nvmlSystemGetProcessName(uint pid, _Out_ str *name, uint length)'
    ) as NvmlFunc;
  }
  return _systemGetProcessName;
}

/**
 * Get NVIDIA driver version string
 */
export function nvmlSystemGetDriverVersion(): { ret: number; version: string } {
  const buffer = Buffer.alloc(NVML_SYSTEM_DRIVER_VERSION_BUFFER_SIZE);
  const ret = getSystemGetDriverVersion()(
    buffer,
    NVML_SYSTEM_DRIVER_VERSION_BUFFER_SIZE
  );
  const version = buffer.toString('utf8').replace(/\0/g, '');
  return { ret, version };
}

/**
 * Get NVML library version string
 */
export function nvmlSystemGetNvmlVersion(): { ret: number; version: string } {
  const buffer = Buffer.alloc(NVML_SYSTEM_NVML_VERSION_BUFFER_SIZE);
  const ret = getSystemGetNvmlVersion()(
    buffer,
    NVML_SYSTEM_NVML_VERSION_BUFFER_SIZE
  );
  const version = buffer.toString('utf8').replace(/\0/g, '');
  return { ret, version };
}

/**
 * Get CUDA driver version as integer
 *
 * The version is encoded as (major * 1000) + (minor * 10)
 * e.g., CUDA 12.4 = 12040
 */
export function nvmlSystemGetCudaDriverVersion(): {
  ret: number;
  version: number;
} {
  const version = [0];
  const ret = getSystemGetCudaDriverVersion()(version);
  return { ret, version: version[0] ?? 0 };
}

/**
 * Get CUDA driver version as integer (v2 - includes minor version)
 *
 * The version is encoded as (major * 1000) + (minor * 10)
 * e.g., CUDA 12.4 = 12040
 */
export function nvmlSystemGetCudaDriverVersion_v2(): {
  ret: number;
  version: number;
} {
  const version = [0];
  const ret = getSystemGetCudaDriverVersion_v2()(version);
  return { ret, version: version[0] ?? 0 };
}

/**
 * Get process name by PID
 *
 * Returns the executable path. NVML may return the full command line
 * with null-separated arguments, so we extract just the first part.
 */
export function nvmlSystemGetProcessName(
  pid: number
): { ret: number; name: string } {
  const buffer = Buffer.alloc(256);
  const ret = getSystemGetProcessName()(pid, buffer, 256);
  // Extract just the executable path (first null-terminated string)
  const name = buffer.toString('utf8').split('\0')[0] ?? '';
  return { ret, name };
}

/**
 * Convert CUDA driver version integer to string
 * e.g., 12040 -> "12.4"
 */
export function cudaVersionToString(version: number): string {
  const major = Math.floor(version / 1000);
  const minor = Math.floor((version % 1000) / 10);
  return `${major}.${minor}`;
}
