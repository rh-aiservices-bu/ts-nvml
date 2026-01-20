import { existsSync } from 'node:fs';

/**
 * Default library search paths for libnvidia-ml.so
 */
const DEFAULT_LIBRARY_PATHS = [
  // Standard system library paths
  'libnvidia-ml.so.1',
  'libnvidia-ml.so',
  // Common installation locations
  '/usr/lib/x86_64-linux-gnu/libnvidia-ml.so.1',
  '/usr/lib64/libnvidia-ml.so.1',
  '/usr/lib/libnvidia-ml.so.1',
  '/usr/lib/aarch64-linux-gnu/libnvidia-ml.so.1',
  // CUDA toolkit locations
  '/usr/local/cuda/lib64/stubs/libnvidia-ml.so',
  '/usr/local/cuda/targets/x86_64-linux/lib/stubs/libnvidia-ml.so',
];

/**
 * Environment variable for overriding library path
 */
const NVML_LIBRARY_PATH_ENV = 'NVML_LIBRARY_PATH';

/**
 * Find the NVML library path
 *
 * Search order:
 * 1. NVML_LIBRARY_PATH environment variable (if set)
 * 2. System library paths (via dynamic linker)
 * 3. Known installation locations
 *
 * @returns The library path to use, or null if not found
 */
export function findLibraryPath(): string | null {
  // Check environment variable first
  const envPath = process.env[NVML_LIBRARY_PATH_ENV];
  if (envPath) {
    if (existsSync(envPath)) {
      return envPath;
    }
    // If env var is set but file doesn't exist, warn but continue searching
    console.warn(
      `NVML_LIBRARY_PATH set to '${envPath}' but file not found, searching default paths`
    );
  }

  // Try default paths
  for (const path of DEFAULT_LIBRARY_PATHS) {
    // For paths without directory, rely on dynamic linker
    if (!path.includes('/')) {
      // These will be resolved by koffi.load() via the dynamic linker
      return path;
    }

    // For absolute paths, check if file exists
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

/**
 * Get library search paths for debugging
 */
export function getSearchPaths(): string[] {
  const paths = [...DEFAULT_LIBRARY_PATHS];
  const envPath = process.env[NVML_LIBRARY_PATH_ENV];
  if (envPath) {
    paths.unshift(envPath);
  }
  return paths;
}
