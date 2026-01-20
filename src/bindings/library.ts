import koffi, { type IKoffiLib } from 'koffi';
import { findLibraryPath, getSearchPaths } from '../utils/library-path.js';

let lib: IKoffiLib | null = null;
let libraryPath: string | null = null;

/**
 * Get or load the NVML library
 *
 * @throws Error if the library cannot be found or loaded
 */
export function getLibrary(): IKoffiLib {
  if (lib) {
    return lib;
  }

  const path = findLibraryPath();
  if (!path) {
    const searchPaths = getSearchPaths();
    throw new Error(
      `Could not find libnvidia-ml.so. ` +
        `Ensure NVIDIA drivers are installed or set NVML_LIBRARY_PATH environment variable.\n` +
        `Searched paths:\n${searchPaths.map((p) => `  - ${p}`).join('\n')}`
    );
  }

  try {
    lib = koffi.load(path);
    libraryPath = path;
    return lib;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error loading library';
    throw new Error(`Failed to load NVML library from '${path}': ${message}`);
  }
}

/**
 * Check if the library is loaded
 */
export function isLibraryLoaded(): boolean {
  return lib !== null;
}

/**
 * Get the path of the loaded library
 */
export function getLoadedLibraryPath(): string | null {
  return libraryPath;
}

/**
 * Unload the library (mainly for testing)
 */
export function unloadLibrary(): void {
  lib = null;
  libraryPath = null;
}
