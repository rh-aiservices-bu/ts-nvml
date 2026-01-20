# ts-nvml API Reference

TypeScript bindings for NVIDIA Management Library (NVML). Provides direct FFI access to GPU monitoring functions, replacing inefficient `nvidia-smi` CLI calls.

## Requirements

- Node.js >= 22.0.0
- Linux with NVIDIA GPU and drivers installed
- `libnvidia-ml.so.1` available (included with NVIDIA drivers)

## Installation

```bash
npm install ts-nvml
```

## Quick Start

```typescript
import { Nvml, Device, unwrap } from 'ts-nvml';

// Initialize NVML (required before any operations)
Nvml.init();

try {
  // Get device count and enumerate
  const count = Nvml.getDeviceCount();
  const device = Nvml.getDevice(0);

  // Query device properties
  const name = unwrap(device.getName());
  const memory = unwrap(device.getMemoryInfo());
  const temp = unwrap(device.getTemperature());

  console.log(`${name}: ${temp}C, ${memory.used}/${memory.total} bytes`);
} finally {
  // Always shutdown when done
  Nvml.shutdown();
}
```

---

## Nvml Namespace

Static functions for NVML initialization, device discovery, and system queries.

### Initialization Functions

#### `Nvml.init(): void`

Initialize NVML library. **Must be called before any other NVML operations.**

- **Throws:** `NvmlError` if initialization fails

```typescript
Nvml.init();
```

#### `Nvml.shutdown(): void`

Shutdown NVML library and release resources. **Should be called when done.**

- **Throws:** `NvmlError` if shutdown fails

```typescript
Nvml.shutdown();
```

#### `Nvml.isInitialized(): boolean`

Check if NVML is currently initialized.

- **Returns:** `true` if initialized, `false` otherwise

```typescript
if (Nvml.isInitialized()) {
  // Safe to call NVML functions
}
```

#### `Nvml.ensureInitialized(): void`

Ensure NVML is initialized, throw if not.

- **Throws:** `NvmlError` with `ERROR_UNINITIALIZED` if not initialized

```typescript
Nvml.ensureInitialized(); // Throws if not initialized
```

### Device Discovery Functions

#### `Nvml.getDeviceCount(): number`

Get the number of GPU devices in the system.

- **Returns:** Number of GPU devices
- **Throws:** `NvmlError` if not initialized or query fails

```typescript
const count = Nvml.getDeviceCount();
console.log(`Found ${count} GPU(s)`);
```

#### `Nvml.getDevice(index: number): Device`

Get a device by its index.

- **Parameters:**
  - `index`: Device index (0-based)
- **Returns:** `Device` instance
- **Throws:** `NvmlError` if not initialized or device not found

```typescript
const device = Nvml.getDevice(0); // First GPU
```

#### `Nvml.getDeviceByUUID(uuid: string): Device`

Get a device by its UUID string.

- **Parameters:**
  - `uuid`: Device UUID string (e.g., `"GPU-12345678-..."`)
- **Returns:** `Device` instance
- **Throws:** `NvmlError` if not initialized or device not found

```typescript
const device = Nvml.getDeviceByUUID('GPU-12345678-1234-1234-1234-123456789abc');
```

#### `Nvml.getAllDevices(): Device[]`

Get all GPU devices in the system.

- **Returns:** Array of `Device` instances
- **Throws:** `NvmlError` if not initialized or enumeration fails

```typescript
const devices = Nvml.getAllDevices();
for (const device of devices) {
  console.log(unwrap(device.getName()));
}
```

### System Information Functions

#### `Nvml.getDriverInfo(): Result<DriverInfo>`

Get driver and version information.

- **Returns:** `Result<DriverInfo>` with driver, NVML, and CUDA versions

```typescript
const result = Nvml.getDriverInfo();
if (result.ok) {
  console.log(`Driver: ${result.value.driverVersion}`);
  console.log(`NVML: ${result.value.nvmlVersion}`);
  console.log(`CUDA: ${result.value.cudaVersion}`);
}
```

#### `Nvml.getDriverVersion(): Result<string>`

Get NVIDIA driver version string.

- **Returns:** `Result<string>` (e.g., `"550.100"`)

```typescript
const version = unwrap(Nvml.getDriverVersion());
```

#### `Nvml.getNvmlVersion(): Result<string>`

Get NVML library version string.

- **Returns:** `Result<string>` (e.g., `"12.550.100"`)

```typescript
const version = unwrap(Nvml.getNvmlVersion());
```

#### `Nvml.getCudaVersion(): Result<string>`

Get CUDA driver version string.

- **Returns:** `Result<string>` (e.g., `"12.4"`)

```typescript
const version = unwrap(Nvml.getCudaVersion());
```

### Batch Operations

#### `Nvml.getAllGpuStatus(): Result<GpuStatus[]>`

Get comprehensive status for all GPUs in a single call.

- **Returns:** `Result<GpuStatus[]>` with status for each GPU

```typescript
const statuses = unwrap(Nvml.getAllGpuStatus());
for (const status of statuses) {
  console.log(`GPU ${status.index}: ${status.temperature}C, ${status.utilizationGpu}%`);
}
```

#### `Nvml.getSystemSnapshot(): Result<SystemSnapshot>`

Get complete system snapshot including driver info, all GPU statuses, and all running processes.

- **Returns:** `Result<SystemSnapshot>`

```typescript
const snapshot = unwrap(Nvml.getSystemSnapshot());
console.log(`Timestamp: ${snapshot.timestamp.toISOString()}`);
console.log(`Driver: ${snapshot.driver.driverVersion}`);
console.log(`GPUs: ${snapshot.gpus.length}`);
console.log(`Processes: ${snapshot.processes.length}`);
```

---

## Device Class

Represents an NVIDIA GPU device with methods to query its properties.

### Static Constructors

#### `Device.getByIndex(index: number): Device`

Create a Device from its index.

- **Parameters:**
  - `index`: Device index (0-based)
- **Returns:** `Device` instance
- **Throws:** `NvmlError` if device cannot be retrieved

```typescript
const device = Device.getByIndex(0);
```

#### `Device.getByUUID(uuid: string): Device`

Create a Device from its UUID.

- **Parameters:**
  - `uuid`: Device UUID string
- **Returns:** `Device` instance (with `index = -1`)
- **Throws:** `NvmlError` if device cannot be retrieved

```typescript
const device = Device.getByUUID('GPU-12345678-...');
```

### Properties

#### `device.index: number`

Device index (0-based). Returns `-1` if device was created by UUID.

```typescript
console.log(`Device index: ${device.index}`);
```

### Basic Information Methods

#### `device.getName(): Result<string>`

Get device name.

- **Returns:** `Result<string>` (e.g., `"NVIDIA GeForce RTX 4090"`)

```typescript
const name = unwrap(device.getName());
```

#### `device.getUUID(): Result<string>`

Get device UUID.

- **Returns:** `Result<string>` (e.g., `"GPU-12345678-1234-1234-1234-123456789abc"`)

```typescript
const uuid = unwrap(device.getUUID());
```

#### `device.getBasicInfo(): Result<GpuBasicInfo>`

Get basic device info including index, name, and memory.

- **Returns:** `Result<GpuBasicInfo>`

```typescript
const info = unwrap(device.getBasicInfo());
console.log(`${info.name}: ${info.memoryTotalGiB} GiB`);
```

### Memory Methods

#### `device.getMemoryInfo(): Result<MemoryInfo>`

Get memory information (total, free, used) in bytes.

- **Returns:** `Result<MemoryInfo>` with `bigint` values

```typescript
const memory = unwrap(device.getMemoryInfo());
const totalGB = Number(memory.total) / (1024 * 1024 * 1024);
const usedGB = Number(memory.used) / (1024 * 1024 * 1024);
console.log(`Memory: ${usedGB.toFixed(2)} / ${totalGB.toFixed(2)} GB`);
```

#### `device.getUtilizationRates(): Result<UtilizationRates>`

Get GPU and memory utilization rates (0-100%).

- **Returns:** `Result<UtilizationRates>`

```typescript
const util = unwrap(device.getUtilizationRates());
console.log(`GPU: ${util.gpu}%, Memory: ${util.memory}%`);
```

### Performance Methods

#### `device.getTemperature(): Result<number>`

Get GPU temperature in Celsius.

- **Returns:** `Result<number>`

```typescript
const temp = unwrap(device.getTemperature());
console.log(`Temperature: ${temp}C`);
```

#### `device.getPowerUsage(): Result<number>`

Get current power usage in watts.

- **Returns:** `Result<number>` (converted from milliwatts)

```typescript
const power = unwrap(device.getPowerUsage());
console.log(`Power: ${power.toFixed(1)}W`);
```

#### `device.getPowerLimit(): Result<number>`

Get power management limit in watts.

- **Returns:** `Result<number>` (converted from milliwatts)

```typescript
const limit = unwrap(device.getPowerLimit());
console.log(`Power Limit: ${limit.toFixed(1)}W`);
```

#### `device.getFanSpeed(): Result<number | null>`

Get fan speed percentage (0-100).

- **Returns:** `Result<number | null>` - returns `null` for passively cooled GPUs

```typescript
const result = device.getFanSpeed();
if (result.ok && result.value !== null) {
  console.log(`Fan: ${result.value}%`);
} else if (result.ok) {
  console.log('Passive cooling (no fan)');
}
```

#### `device.getPerformanceState(): Result<NvmlPState>`

Get performance state (P-state).

- **Returns:** `Result<NvmlPState>` (P0 = highest performance, P15 = unknown)

```typescript
const pstate = unwrap(device.getPerformanceState());
console.log(`P-State: P${pstate}`);
```

### Hardware Information Methods

#### `device.getPciInfo(): Result<PciInfo>`

Get PCI bus information.

- **Returns:** `Result<PciInfo>`

```typescript
const pci = unwrap(device.getPciInfo());
console.log(`PCI Bus ID: ${pci.busId}`);
console.log(`Domain: ${pci.domain}, Bus: ${pci.bus}, Device: ${pci.device}`);
```

#### `device.getPersistenceMode(): Result<boolean>`

Get persistence mode status.

- **Returns:** `Result<boolean>`

```typescript
const enabled = unwrap(device.getPersistenceMode());
console.log(`Persistence Mode: ${enabled ? 'Enabled' : 'Disabled'}`);
```

#### `device.getDisplayActive(): Result<boolean>`

Check if a display is active on this device.

- **Returns:** `Result<boolean>`

```typescript
const active = unwrap(device.getDisplayActive());
console.log(`Display Active: ${active ? 'Yes' : 'No'}`);
```

#### `device.getComputeMode(): Result<NvmlComputeMode>`

Get compute mode.

- **Returns:** `Result<NvmlComputeMode>`

```typescript
const mode = unwrap(device.getComputeMode());
// 0 = DEFAULT, 1 = EXCLUSIVE_THREAD, 2 = PROHIBITED, 3 = EXCLUSIVE_PROCESS
```

#### `device.getMigMode(): Result<boolean | null>`

Get MIG (Multi-Instance GPU) mode status.

- **Returns:** `Result<boolean | null>` - returns `null` if MIG is not supported

```typescript
const result = device.getMigMode();
if (result.ok) {
  if (result.value === null) {
    console.log('MIG not supported');
  } else {
    console.log(`MIG Mode: ${result.value ? 'Enabled' : 'Disabled'}`);
  }
}
```

#### `device.getEccErrorsCorrected(): Result<number | null>`

Get total corrected ECC errors (volatile counter).

- **Returns:** `Result<number | null>` - returns `null` if ECC is not supported

```typescript
const result = device.getEccErrorsCorrected();
if (result.ok && result.value !== null) {
  console.log(`ECC Errors (Corrected): ${result.value}`);
}
```

### Composite Methods

#### `device.getStatus(): Result<GpuStatus>`

Get comprehensive device status with all key metrics.

- **Returns:** `Result<GpuStatus>`

```typescript
const status = unwrap(device.getStatus());
console.log(`GPU ${status.index}: ${status.name}`);
console.log(`  Temperature: ${status.temperature}C`);
console.log(`  Power: ${status.powerDraw}W / ${status.powerLimit}W`);
console.log(`  Memory: ${status.memoryUsedMiB} / ${status.memoryTotalMiB} MiB`);
console.log(`  Utilization: GPU ${status.utilizationGpu}%, Memory ${status.utilizationMemory}%`);
```

#### `device.getProcesses(): Result<GpuProcess[]>`

Get all running processes (compute and graphics) on this device.

- **Returns:** `Result<GpuProcess[]>` - deduplicated by PID

```typescript
const processes = unwrap(device.getProcesses());
for (const proc of processes) {
  console.log(`PID ${proc.pid}: ${proc.processName} (${proc.usedMemoryMiB} MiB)`);
}
```

### Internal Methods

#### `device.getHandle(): KoffiNvmlDevice`

Get the internal device handle for advanced usage with direct NVML bindings.

- **Returns:** Internal Koffi device handle

---

## Type Definitions

### MemoryInfo

GPU memory information in bytes.

```typescript
interface MemoryInfo {
  total: bigint;  // Total installed GPU memory in bytes
  free: bigint;   // Unallocated GPU memory in bytes
  used: bigint;   // Allocated GPU memory in bytes
}
```

### UtilizationRates

GPU and memory utilization percentages.

```typescript
interface UtilizationRates {
  gpu: number;     // GPU compute utilization (0-100%)
  memory: number;  // Memory controller utilization (0-100%)
}
```

### PciInfo

PCI bus information for a device.

```typescript
interface PciInfo {
  busId: string;         // PCI bus ID (e.g., "0000:00:1E.0")
  domain: number;        // PCI domain
  bus: number;           // PCI bus number
  device: number;        // PCI device number
  function: number;      // PCI function number
  pciDeviceId: number;   // PCI device ID
  pciSubsystemId: number; // PCI subsystem ID
}
```

### ProcessInfo

Running process information (low-level).

```typescript
interface ProcessInfo {
  pid: number;                  // Process ID
  usedGpuMemory: bigint;        // GPU memory used in bytes
  gpuInstanceId?: number;       // GPU instance ID (for MIG)
  computeInstanceId?: number;   // Compute instance ID (for MIG)
}
```

### GpuBasicInfo

Basic GPU information.

```typescript
interface GpuBasicInfo {
  index: number;           // Device index
  name: string;            // GPU name (e.g., "NVIDIA GeForce RTX 4090")
  memoryTotalMiB: number;  // Total memory in MiB
  memoryTotalGiB: number;  // Total memory in GiB
}
```

### GpuStatus

Comprehensive GPU status snapshot.

```typescript
interface GpuStatus {
  index: number;                    // Device index
  name: string;                     // GPU name
  persistenceMode: boolean;         // Persistence mode enabled
  pciBusId: string;                 // PCI bus ID
  displayActive: boolean;           // Display attached and active
  eccErrorsCorrected: number | null; // Corrected ECC errors (null if unsupported)
  fanSpeed: number | null;          // Fan speed 0-100% (null if passive cooling)
  temperature: number;              // GPU temperature in Celsius
  pstate: NvmlPState;               // Performance state (P0-P15)
  powerDraw: number;                // Current power draw in watts
  powerLimit: number;               // Power limit in watts
  memoryUsedMiB: number;            // Used memory in MiB
  memoryTotalMiB: number;           // Total memory in MiB
  utilizationGpu: number;           // GPU utilization (0-100%)
  utilizationMemory: number;        // Memory utilization (0-100%)
  computeMode: NvmlComputeMode;     // Compute mode
  migMode: boolean | null;          // MIG mode (null if unsupported)
}
```

### GpuProcess

GPU process information.

```typescript
interface GpuProcess {
  gpuIndex: number;       // GPU index
  pid: number;            // Process ID
  processName: string;    // Process name
  usedMemoryMiB: number;  // GPU memory used in MiB
}
```

### DriverInfo

Driver and version information.

```typescript
interface DriverInfo {
  driverVersion: string;  // NVIDIA driver version (e.g., "550.100")
  nvmlVersion: string;    // NVML library version (e.g., "12.550.100")
  cudaVersion: string;    // CUDA driver version (e.g., "12.4")
}
```

### SystemSnapshot

Complete system snapshot.

```typescript
interface SystemSnapshot {
  timestamp: Date;        // Snapshot timestamp
  driver: DriverInfo;     // Driver and version info
  gpus: GpuStatus[];      // Status for all GPUs
  processes: GpuProcess[]; // All running GPU processes
}
```

---

## Enums

### NvmlReturn

NVML operation return codes.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `SUCCESS` | Operation completed successfully |
| 1 | `ERROR_UNINITIALIZED` | NVML was not initialized |
| 2 | `ERROR_INVALID_ARGUMENT` | Invalid argument provided |
| 3 | `ERROR_NOT_SUPPORTED` | Operation not supported |
| 4 | `ERROR_NO_PERMISSION` | Insufficient permissions |
| 5 | `ERROR_ALREADY_INITIALIZED` | NVML already initialized |
| 6 | `ERROR_NOT_FOUND` | Resource not found |
| 7 | `ERROR_INSUFFICIENT_SIZE` | Insufficient buffer size |
| 8 | `ERROR_INSUFFICIENT_POWER` | Insufficient power available |
| 9 | `ERROR_DRIVER_NOT_LOADED` | NVIDIA driver not loaded |
| 10 | `ERROR_TIMEOUT` | Operation timed out |
| 11 | `ERROR_IRQ_ISSUE` | Interrupt request issue |
| 12 | `ERROR_LIBRARY_NOT_FOUND` | NVML library not found |
| 13 | `ERROR_FUNCTION_NOT_FOUND` | Function not found in library |
| 14 | `ERROR_CORRUPTED_INFOROM` | InfoROM corrupted |
| 15 | `ERROR_GPU_IS_LOST` | GPU is lost |
| 16 | `ERROR_RESET_REQUIRED` | GPU reset required |
| 17 | `ERROR_OPERATING_SYSTEM` | Operating system error |
| 18 | `ERROR_LIB_RM_VERSION_MISMATCH` | RM/library version mismatch |
| 19 | `ERROR_IN_USE` | GPU is in use |
| 20 | `ERROR_MEMORY` | Memory allocation failed |
| 21 | `ERROR_NO_DATA` | No data available |
| 22 | `ERROR_VGPU_ECC_NOT_SUPPORTED` | vGPU ECC not supported |
| 23 | `ERROR_INSUFFICIENT_RESOURCES` | Insufficient resources |
| 24 | `ERROR_FREQ_NOT_SUPPORTED` | Frequency not supported |
| 25 | `ERROR_ARGUMENT_VERSION_MISMATCH` | Argument version mismatch |
| 26 | `ERROR_DEPRECATED` | Deprecated function |
| 27 | `ERROR_NOT_READY` | Not ready |
| 28 | `ERROR_GPU_NOT_FOUND` | GPU not found |
| 29 | `ERROR_INVALID_STATE` | Invalid state |
| 999 | `ERROR_UNKNOWN` | Unknown error |

### NvmlPState

GPU performance states (P-states).

| Value | Name | Description |
|-------|------|-------------|
| 0 | `P0` | Maximum performance |
| 1 | `P1` | Performance state 1 |
| 2 | `P2` | Performance state 2 |
| 3 | `P3` | Performance state 3 |
| 4 | `P4` | Performance state 4 |
| 5 | `P5` | Performance state 5 |
| 6 | `P6` | Performance state 6 |
| 7 | `P7` | Performance state 7 |
| 8 | `P8` | Performance state 8 |
| 9 | `P9` | Performance state 9 |
| 10 | `P10` | Performance state 10 |
| 11 | `P11` | Performance state 11 |
| 12 | `P12` | Performance state 12 |
| 15 | `P15` | Unknown performance state |
| 32 | `UNKNOWN` | Unknown |

### NvmlComputeMode

GPU compute modes.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `DEFAULT` | Multiple contexts allowed (default) |
| 1 | `EXCLUSIVE_THREAD` | Exclusive thread mode (deprecated) |
| 2 | `PROHIBITED` | No CUDA contexts allowed |
| 3 | `EXCLUSIVE_PROCESS` | Only one context in one process |

### NvmlTemperatureSensors

Temperature sensor types.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `GPU` | Temperature sensor for GPU die |

### NvmlClockType

GPU clock types.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `GRAPHICS` | Graphics clock (GPU core frequency) |
| 1 | `SM` | Streaming Multiprocessor clock |
| 2 | `MEM` | Memory clock |
| 3 | `VIDEO` | Video clock |

### NvmlEnableState

Feature enable states.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `DISABLED` | Feature disabled |
| 1 | `ENABLED` | Feature enabled |

### NvmlMemoryErrorType

ECC memory error types.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `CORRECTED` | Correctable single bit ECC errors |
| 1 | `UNCORRECTED` | Uncorrectable double bit ECC errors |

### NvmlEccCounterType

ECC error counter types.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `VOLATILE` | Volatile counts since last driver load |
| 1 | `AGGREGATE` | Aggregate counts persisted across reboots |

### NvmlMemoryLocation

Memory locations for ECC error counts.

| Value | Name | Description |
|-------|------|-------------|
| 0 | `L1_CACHE` | L1 cache |
| 1 | `L2_CACHE` | L2 cache |
| 2 | `DRAM` | DRAM (device memory) |
| 2 | `DEVICE_MEMORY` | Alias for DRAM |
| 3 | `REGISTER_FILE` | Register file |
| 4 | `TEXTURE_MEMORY` | Texture memory |
| 5 | `TEXTURE_SHM` | Texture shared memory |
| 6 | `CBU` | CBU (Composite Busy Unit) |
| 7 | `SRAM` | SRAM |

---

## Error Handling

### Result Type

All query methods return `Result<T>` for error handling without exceptions.

```typescript
type Result<T, E = NvmlError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

### NvmlError Class

Error class for NVML operations.

```typescript
class NvmlError extends Error {
  readonly name: 'NvmlError';
  readonly code: NvmlReturn;

  static fromReturn(ret: NvmlReturn, context?: string): NvmlError;
  is(code: NvmlReturn): boolean;
}
```

### Result Helper Functions

#### `ok<T>(value: T): Result<T, never>`

Create a successful result.

```typescript
const result = ok(42); // { ok: true, value: 42 }
```

#### `err<E>(error: E): Result<never, E>`

Create a failed result.

```typescript
const result = err(new Error('failed')); // { ok: false, error: Error }
```

#### `errFromReturn(ret: NvmlReturn, context?: string): Result<never, NvmlError>`

Create a failed result from an NVML return code.

```typescript
const result = errFromReturn(NvmlReturn.ERROR_NOT_FOUND, 'Device query');
```

#### `unwrap<T>(result: Result<T>): T`

Extract value from result, throw on error.

```typescript
const memory = unwrap(device.getMemoryInfo());
// Throws NvmlError if result.ok is false
```

#### `unwrapOr<T>(result: Result<T>, defaultValue: T): T`

Extract value with fallback default.

```typescript
const temp = unwrapOr(device.getTemperature(), 0);
// Returns 0 if query fails
```

#### `map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U>`

Transform successful result value.

```typescript
const fahrenheit = map(
  device.getTemperature(),
  (celsius) => celsius * 9/5 + 32
);
```

#### `andThen<T, U>(result: Result<T>, fn: (value: T) => Result<U>): Result<U>`

Chain result operations.

```typescript
const result = andThen(
  device.getName(),
  (name) => map(device.getTemperature(), (temp) => `${name}: ${temp}C`)
);
```

#### `isSuccess(ret: number): boolean`

Check if NVML return code indicates success.

```typescript
if (isSuccess(returnCode)) {
  // Operation succeeded
}
```

#### `nvmlErrorString(ret: NvmlReturn): string`

Get human-readable error message for return code.

```typescript
const message = nvmlErrorString(NvmlReturn.ERROR_NOT_FOUND);
// Returns "Not found"
```

### Error Handling Patterns

**Pattern 1: Direct pattern matching**

```typescript
const result = device.getMemoryInfo();
if (result.ok) {
  console.log(`Total: ${result.value.total} bytes`);
} else {
  console.error(`Error: ${result.error.message}`);
  console.error(`Code: ${result.error.code}`);
}
```

**Pattern 2: Using unwrap (throws on error)**

```typescript
try {
  const memory = unwrap(device.getMemoryInfo());
  console.log(`Total: ${memory.total} bytes`);
} catch (e) {
  if (e instanceof NvmlError) {
    console.error(`NVML Error: ${e.message}`);
  }
}
```

**Pattern 3: Using unwrapOr (default fallback)**

```typescript
const temp = unwrapOr(device.getTemperature(), 0);
```

**Pattern 4: Check specific error types**

```typescript
const result = device.getFanSpeed();
if (!result.ok && result.error.is(NvmlReturn.ERROR_NOT_SUPPORTED)) {
  console.log('Fan speed not supported (passive cooling)');
}
```

---

## Complete Examples

### Basic Device Query

```typescript
import { Nvml, unwrap } from 'ts-nvml';

Nvml.init();

try {
  const deviceCount = Nvml.getDeviceCount();
  console.log(`Found ${deviceCount} GPU(s)`);

  for (let i = 0; i < deviceCount; i++) {
    const device = Nvml.getDevice(i);

    const name = unwrap(device.getName());
    const memory = unwrap(device.getMemoryInfo());
    const temp = unwrap(device.getTemperature());
    const power = unwrap(device.getPowerUsage());
    const util = unwrap(device.getUtilizationRates());

    const totalGB = Number(memory.total) / (1024 * 1024 * 1024);
    const usedGB = Number(memory.used) / (1024 * 1024 * 1024);

    console.log(`GPU ${i}: ${name}`);
    console.log(`  Memory: ${usedGB.toFixed(2)} / ${totalGB.toFixed(2)} GB`);
    console.log(`  Temperature: ${temp}C`);
    console.log(`  Power: ${power.toFixed(1)}W`);
    console.log(`  Utilization: GPU ${util.gpu}%, Memory ${util.memory}%`);
  }
} finally {
  Nvml.shutdown();
}
```

### Monitoring Loop

```typescript
import { Nvml, unwrap } from 'ts-nvml';

Nvml.init();
const device = Nvml.getDevice(0);

const interval = setInterval(() => {
  const util = unwrap(device.getUtilizationRates());
  const temp = unwrap(device.getTemperature());
  const power = unwrap(device.getPowerUsage());

  console.log(`GPU: ${util.gpu}% | Mem: ${util.memory}% | Temp: ${temp}C | Power: ${power.toFixed(1)}W`);
}, 1000);

process.on('SIGINT', () => {
  clearInterval(interval);
  Nvml.shutdown();
  process.exit();
});
```

### System Snapshot

```typescript
import { Nvml, unwrap } from 'ts-nvml';

Nvml.init();

try {
  const snapshot = unwrap(Nvml.getSystemSnapshot());

  console.log(`Timestamp: ${snapshot.timestamp.toISOString()}`);
  console.log(`Driver: ${snapshot.driver.driverVersion}`);
  console.log(`CUDA: ${snapshot.driver.cudaVersion}`);

  console.log(`\nGPUs (${snapshot.gpus.length}):`);
  for (const gpu of snapshot.gpus) {
    console.log(`  ${gpu.index}: ${gpu.name}`);
    console.log(`    Temp: ${gpu.temperature}C, Power: ${gpu.powerDraw}W`);
    console.log(`    Memory: ${gpu.memoryUsedMiB}/${gpu.memoryTotalMiB} MiB`);
  }

  console.log(`\nProcesses (${snapshot.processes.length}):`);
  for (const proc of snapshot.processes) {
    console.log(`  GPU${proc.gpuIndex} PID ${proc.pid}: ${proc.processName} (${proc.usedMemoryMiB} MiB)`);
  }
} finally {
  Nvml.shutdown();
}
```

### Process Monitoring

```typescript
import { Nvml, unwrap } from 'ts-nvml';

Nvml.init();

try {
  const devices = Nvml.getAllDevices();

  for (const device of devices) {
    const name = unwrap(device.getName());
    const processes = unwrap(device.getProcesses());

    console.log(`${name}: ${processes.length} process(es)`);
    for (const proc of processes) {
      console.log(`  PID ${proc.pid}: ${proc.processName}`);
      console.log(`    GPU Memory: ${proc.usedMemoryMiB} MiB`);
    }
  }
} finally {
  Nvml.shutdown();
}
```

---

## Exports Summary

```typescript
// Classes
export { Nvml } from 'ts-nvml';
export { Device } from 'ts-nvml';

// Types
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
  Result,
} from 'ts-nvml';

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
} from 'ts-nvml';

// Error Handling
export {
  NvmlError,
  nvmlErrorString,
  ok,
  err,
  errFromReturn,
  unwrap,
  unwrapOr,
  map,
  andThen,
  isSuccess,
} from 'ts-nvml';
```
