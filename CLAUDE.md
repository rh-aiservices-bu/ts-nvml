# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ts-nvml is a TypeScript binding for NVIDIA Management Library (NVML). It provides direct access to GPU monitoring functions via Koffi FFI, replacing inefficient nvidia-smi CLI calls.

## Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Type check without emitting
npm run typecheck

# Run tests
npm test

# Run example (requires NVIDIA GPU)
npx tsx examples/basic-usage.ts
```

## Architecture

```
src/
├── index.ts              # Public API exports
├── nvml.ts               # Nvml namespace (init, shutdown, system queries)
├── device.ts             # Device class with query methods
├── types/
│   ├── enums.ts          # NvmlReturn, NvmlPState, NvmlComputeMode, etc.
│   ├── structs.ts        # MemoryInfo, GpuStatus, SystemSnapshot, etc.
│   └── result.ts         # Result<T> type and NvmlError
├── bindings/
│   ├── library.ts        # Koffi library loading
│   ├── types.ts          # Koffi struct definitions (nvmlMemory_t, etc.)
│   ├── init.ts           # nvmlInit, nvmlShutdown bindings
│   └── device.ts         # Device query bindings (memory, temp, power, etc.)
└── utils/
    └── library-path.ts   # NVML library discovery
```

## Key Patterns

### Result Type for Error Handling
All query methods return `Result<T>` instead of throwing:
```typescript
const result = device.getMemoryInfo();
if (result.ok) {
  console.log(result.value.total);
} else {
  console.error(result.error.message);
}

// Or use unwrap() to throw on error
const memory = unwrap(device.getMemoryInfo());
```

### Lazy Function Binding
NVML functions are bound lazily on first use to avoid loading the library at import time:
```typescript
let _nvmlInit: NvmlFunc | null = null;
function getNvmlInit(): NvmlFunc {
  if (!_nvmlInit) {
    _nvmlInit = getLibrary().func('int nvmlInit_v2()') as NvmlFunc;
  }
  return _nvmlInit;
}
```

### Koffi Output Parameters
Primitive outputs use arrays, structs use objects:
```typescript
// Primitive: use array wrapper
const count = [0];
getDeviceGetCount()(count);  // count[0] now has value

// Struct: use object
const memory = { total: 0n, free: 0n, used: 0n };
getDeviceGetMemoryInfo()(device, memory);  // memory now populated
```

## Testing

- Unit tests don't require a GPU (use mocks)
- Integration tests require an NVIDIA GPU with drivers installed
- The NVML library path can be overridden via `NVML_LIBRARY_PATH` env var

## License

Apache License 2.0
