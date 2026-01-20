# ts-nvml

TypeScript bindings for NVIDIA Management Library (NVML) using [Koffi](https://koffi.dev/) FFI.

## Overview

`ts-nvml` provides direct access to NVIDIA GPU monitoring capabilities from Node.js, replacing the need to spawn `nvidia-smi` processes and parse text output. This results in significantly better performance for GPU monitoring applications.

## Features

- Direct FFI bindings to `libnvidia-ml.so`
- Full TypeScript support with comprehensive types
- Result-based error handling (no exceptions for expected failures)
- Zero external runtime dependencies (Koffi is the only dependency)
- Matches the API style of [NVIDIA go-nvml](https://github.com/NVIDIA/go-nvml)

## Documentation

For complete API documentation with all functions, types, enums, and examples, see **[docs/API.md](docs/API.md)**.

## Requirements

- Node.js >= 22.0.0
- Linux with NVIDIA GPU and drivers installed
- `libnvidia-ml.so.1` available (installed with NVIDIA drivers)

## Installation

```bash
npm install ts-nvml
```

## Quick Start

```typescript
import { Nvml, unwrap } from 'ts-nvml';

// Initialize NVML (required before any operations)
Nvml.init();

// Get device count
const count = Nvml.getDeviceCount();
console.log(`Found ${count} GPU(s)`);

// Query a specific device
const device = Nvml.getDevice(0);
const name = unwrap(device.getName());
const memory = unwrap(device.getMemoryInfo());
const temp = unwrap(device.getTemperature());

console.log(`GPU: ${name}`);
console.log(`Memory: ${Number(memory.used) / 1e9} / ${Number(memory.total) / 1e9} GB`);
console.log(`Temperature: ${temp}°C`);

// Always shutdown when done
Nvml.shutdown();
```

## NVML Lifecycle Management

### When to Initialize and Shutdown

NVML is designed to be initialized once and kept running for the lifetime of your application. You do **not** need to call `init()` and `shutdown()` for each query.

**For long-running services (backends, monitoring daemons):**

```typescript
import { Nvml, unwrap } from 'ts-nvml';

// Initialize once at startup
Nvml.init();

// Register cleanup for graceful shutdown
process.on('SIGINT', () => {
  Nvml.shutdown();
  process.exit();
});
process.on('SIGTERM', () => {
  Nvml.shutdown();
  process.exit();
});

// Poll as often as needed - no init/shutdown required
setInterval(() => {
  const statuses = unwrap(Nvml.getAllGpuStatus());
  // ... use statuses
}, 5000);
```

**For one-off scripts:**

```typescript
Nvml.init();
try {
  // ... do work
} finally {
  Nvml.shutdown();
}
```

### Why Keep NVML Initialized?

- **Performance**: `init()` and `shutdown()` each take ~1-2ms. Calling them repeatedly adds unnecessary overhead.
- **Design**: NVML maintains internal state and is designed for persistent usage.
- **Concurrency**: The library handles concurrent queries safely when initialized.

### When to Call Shutdown

- Process exit (SIGINT, SIGTERM, beforeExit)
- Graceful application shutdown
- When you truly won't need GPU queries anymore

Shutdown releases resources and should always be called before your process exits to ensure clean cleanup.

## API Reference

### Initialization

```typescript
// Initialize NVML library
Nvml.init(): void

// Shutdown NVML and release resources
Nvml.shutdown(): void

// Check if initialized
Nvml.isInitialized(): boolean
```

### System Queries

```typescript
// Get number of GPUs
Nvml.getDeviceCount(): number

// Get all devices
Nvml.getAllDevices(): Device[]

// Get device by index (0-based)
Nvml.getDevice(index: number): Device

// Get device by UUID
Nvml.getDeviceByUUID(uuid: string): Device

// Get driver and version information
Nvml.getDriverInfo(): Result<DriverInfo>
// Returns: { driverVersion, nvmlVersion, cudaVersion }

// Get complete system snapshot
Nvml.getSystemSnapshot(): Result<SystemSnapshot>
// Returns: { timestamp, driver, gpus, processes }
```

### Device Queries

All device methods return `Result<T>` to handle potential failures gracefully.

```typescript
const device = Nvml.getDevice(0);

// Basic info
device.getName(): Result<string>
device.getUUID(): Result<string>

// Memory
device.getMemoryInfo(): Result<MemoryInfo>
// Returns: { total: bigint, free: bigint, used: bigint } (bytes)

// Utilization
device.getUtilizationRates(): Result<UtilizationRates>
// Returns: { gpu: number, memory: number } (0-100%)

// Thermal
device.getTemperature(): Result<number>  // Celsius
device.getFanSpeed(): Result<number | null>  // 0-100% or null if passive

// Power
device.getPowerUsage(): Result<number>  // Watts
device.getPowerLimit(): Result<number>  // Watts

// Performance
device.getPerformanceState(): Result<NvmlPState>  // P0-P15

// PCI
device.getPciInfo(): Result<PciInfo>

// Modes
device.getPersistenceMode(): Result<boolean>
device.getDisplayActive(): Result<boolean>
device.getComputeMode(): Result<NvmlComputeMode>
device.getMigMode(): Result<boolean | null>

// ECC
device.getEccErrorsCorrected(): Result<number | null>

// Processes
device.getProcesses(): Result<GpuProcess[]>
// Returns: [{ gpuIndex, pid, processName, usedMemoryMiB }]

// Convenience methods
device.getBasicInfo(): Result<GpuBasicInfo>
device.getStatus(): Result<GpuStatus>  // All fields in one call
```

### Result Type

All fallible operations return a `Result<T>` type for explicit error handling:

```typescript
import { unwrap, unwrapOr, map, andThen } from 'ts-nvml';

const result = device.getTemperature();

// Pattern matching
if (result.ok) {
  console.log(`Temperature: ${result.value}°C`);
} else {
  console.error(`Error: ${result.error.message}`);
}

// Unwrap (throws on error)
const temp = unwrap(result);

// Unwrap with default
const temp = unwrapOr(result, 0);

// Map values
const fahrenheit = map(result, (c) => c * 9/5 + 32);

// Chain operations
const status = andThen(
  device.getName(),
  (name) => device.getTemperature().ok
    ? ok(`${name}: ${device.getTemperature().value}°C`)
    : device.getTemperature()
);
```

### Types

```typescript
interface MemoryInfo {
  total: bigint;  // bytes
  free: bigint;
  used: bigint;
}

interface UtilizationRates {
  gpu: number;     // 0-100
  memory: number;  // 0-100
}

interface GpuStatus {
  index: number;
  name: string;
  persistenceMode: boolean;
  pciBusId: string;
  displayActive: boolean;
  eccErrorsCorrected: number | null;
  fanSpeed: number | null;
  temperature: number;
  pstate: NvmlPState;
  powerDraw: number;
  powerLimit: number;
  memoryUsedMiB: number;
  memoryTotalMiB: number;
  utilizationGpu: number;
  utilizationMemory: number;
  computeMode: NvmlComputeMode;
  migMode: boolean | null;
}

interface GpuProcess {
  gpuIndex: number;
  pid: number;
  processName: string;
  usedMemoryMiB: number;
}

interface DriverInfo {
  driverVersion: string;
  nvmlVersion: string;
  cudaVersion: string;
}

interface SystemSnapshot {
  timestamp: Date;
  driver: DriverInfo;
  gpus: GpuStatus[];
  processes: GpuProcess[];
}
```

## Migration from nvidia-smi

If you're currently parsing `nvidia-smi` output, here's how to migrate:

### Before (nvidia-smi)

```typescript
import { execSync } from 'child_process';

function getGpuInfo() {
  const output = execSync('nvidia-smi --query-gpu=name,memory.total,memory.used,temperature.gpu --format=csv,noheader,nounits');
  const lines = output.toString().trim().split('\n');
  return lines.map(line => {
    const [name, total, used, temp] = line.split(', ');
    return { name, memoryTotal: parseInt(total), memoryUsed: parseInt(used), temperature: parseInt(temp) };
  });
}
```

### After (ts-nvml)

```typescript
import { Nvml, unwrap } from 'ts-nvml';

function getGpuInfo() {
  Nvml.init();
  try {
    const devices = Nvml.getAllDevices();
    return devices.map(device => {
      const name = unwrap(device.getName());
      const memory = unwrap(device.getMemoryInfo());
      const temp = unwrap(device.getTemperature());
      return {
        name,
        memoryTotal: Number(memory.total / (1024n * 1024n)),
        memoryUsed: Number(memory.used / (1024n * 1024n)),
        temperature: temp,
      };
    });
  } finally {
    Nvml.shutdown();
  }
}
```

### Performance Comparison

| Metric | nvidia-smi | ts-nvml |
|--------|------------|---------|
| Latency | ~50-100ms | ~1-2ms |
| CPU overhead | High (process spawn) | Minimal (FFI call) |
| Memory | New process per call | Shared library |

## Examples

### Get Complete System Snapshot

```typescript
import { Nvml, unwrap } from 'ts-nvml';

Nvml.init();

const snapshot = unwrap(Nvml.getSystemSnapshot());

console.log(`Driver: ${snapshot.driver.driverVersion}`);
console.log(`CUDA: ${snapshot.driver.cudaVersion}`);

for (const gpu of snapshot.gpus) {
  console.log(`\nGPU ${gpu.index}: ${gpu.name}`);
  console.log(`  Temperature: ${gpu.temperature}°C`);
  console.log(`  Power: ${gpu.powerDraw}W / ${gpu.powerLimit}W`);
  console.log(`  Memory: ${gpu.memoryUsedMiB} / ${gpu.memoryTotalMiB} MiB`);
  console.log(`  Utilization: GPU ${gpu.utilizationGpu}%, Memory ${gpu.utilizationMemory}%`);
}

console.log(`\nProcesses: ${snapshot.processes.length}`);
for (const proc of snapshot.processes) {
  console.log(`  GPU ${proc.gpuIndex} - PID ${proc.pid}: ${proc.processName} (${proc.usedMemoryMiB} MiB)`);
}

Nvml.shutdown();
```

### Monitor GPU in a Loop

```typescript
import { Nvml, unwrap } from 'ts-nvml';

Nvml.init();

const device = Nvml.getDevice(0);

setInterval(() => {
  const util = unwrap(device.getUtilizationRates());
  const temp = unwrap(device.getTemperature());
  const power = unwrap(device.getPowerUsage());

  console.log(`GPU: ${util.gpu}% | Mem: ${util.memory}% | Temp: ${temp}°C | Power: ${power.toFixed(1)}W`);
}, 1000);

// Remember to call Nvml.shutdown() on exit
process.on('SIGINT', () => {
  Nvml.shutdown();
  process.exit();
});
```

## Low-Level Bindings

For advanced use cases, you can access the raw NVML bindings:

```typescript
import {
  nvmlInit,
  nvmlShutdown,
  nvmlDeviceGetCount,
  nvmlDeviceGetHandleByIndex,
  nvmlDeviceGetMemoryInfo,
  // ... etc
} from 'ts-nvml/bindings';
```

## Testing

```bash
# Run all tests (unit tests don't require GPU)
npm test

# Run only unit tests
npm run test:unit

# Run integration tests (requires GPU)
npm run test:integration
```

## License

Apache-2.0

## Acknowledgments

- [NVIDIA NVML](https://developer.nvidia.com/nvidia-management-library-nvml) - The underlying library
- [Koffi](https://koffi.dev/) - Excellent FFI library for Node.js
- [NVIDIA go-nvml](https://github.com/NVIDIA/go-nvml) - API design inspiration
