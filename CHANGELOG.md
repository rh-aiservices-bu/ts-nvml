# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-20

### Added

- **Nvml namespace** for library initialization and system queries
  - `init()` / `shutdown()` for lifecycle management
  - `getDriverVersion()` and `getNvmlVersion()` for version info
  - `getDeviceCount()` and `getDeviceByIndex()` for device enumeration
- **Device class** with comprehensive GPU monitoring methods
  - Memory info (`getMemoryInfo()`)
  - Temperature (`getTemperature()`)
  - Power usage and limits (`getPowerUsage()`, `getPowerLimit()`)
  - GPU/memory utilization (`getUtilization()`)
  - Clock speeds (`getClockInfo()`)
  - P-state and compute mode (`getPState()`, `getComputeMode()`)
  - Running processes (`getRunningProcesses()`)
  - Device identification (`getName()`, `getUuid()`, `getSerial()`)
- **Result<T> type** for safe error handling without exceptions
  - `ok()` / `err()` constructors
  - `unwrap()` / `unwrapOr()` helpers
  - `isOk()` / `isErr()` type guards
- **Lazy function binding** for optimal startup performance
- **Comprehensive type definitions** for all NVML structures and enums
- **Unit tests** with NVML mocks (no GPU required to run)
- **API documentation** with usage examples
- **GitHub Actions CI** workflow for automated testing

[0.1.0]: https://github.com/rh-aiservices-bu/ts-nvml/releases/tag/v0.1.0
