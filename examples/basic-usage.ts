/**
 * Basic usage example for ts-nvml
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import { Nvml, unwrap } from '../dist/index.js';

function main() {
  console.log('Initializing NVML...');
  Nvml.init();
  console.log('NVML initialized successfully!\n');

  const deviceCount = Nvml.getDeviceCount();
  console.log(`Found ${deviceCount} GPU(s)\n`);

  for (let i = 0; i < deviceCount; i++) {
    const device = Nvml.getDevice(i);

    // Get basic info
    const name = unwrap(device.getName());
    const uuid = unwrap(device.getUUID());
    console.log(`GPU ${i}: ${name}`);
    console.log(`  UUID: ${uuid}`);

    // Get memory info
    const memory = unwrap(device.getMemoryInfo());
    const totalGB = Number(memory.total) / (1024 * 1024 * 1024);
    const usedGB = Number(memory.used) / (1024 * 1024 * 1024);
    const freeGB = Number(memory.free) / (1024 * 1024 * 1024);
    console.log(
      `  Memory: ${usedGB.toFixed(2)} GB / ${totalGB.toFixed(2)} GB (${freeGB.toFixed(2)} GB free)`
    );

    // Get utilization
    const util = unwrap(device.getUtilizationRates());
    console.log(`  Utilization: GPU ${util.gpu}%, Memory ${util.memory}%`);

    // Get temperature
    const temp = unwrap(device.getTemperature());
    console.log(`  Temperature: ${temp}°C`);

    // Get power
    const power = unwrap(device.getPowerUsage());
    const powerLimit = unwrap(device.getPowerLimit());
    console.log(`  Power: ${power.toFixed(1)}W / ${powerLimit.toFixed(1)}W`);

    // Get P-state
    const pstate = unwrap(device.getPerformanceState());
    console.log(`  P-State: P${pstate}`);

    // Get fan speed (may not be supported)
    const fanResult = device.getFanSpeed();
    if (fanResult.ok && fanResult.value !== null) {
      console.log(`  Fan Speed: ${fanResult.value}%`);
    }

    console.log();
  }

  // Get full status for comparison with nvidia-smi
  console.log('--- Full GPU Status ---');
  const allStatus = unwrap(Nvml.getAllGpuStatus());
  for (const status of allStatus) {
    console.log(`GPU ${status.index}: ${status.name}`);
    console.log(`  PCI Bus ID: ${status.pciBusId}`);
    console.log(`  Persistence Mode: ${status.persistenceMode ? 'Enabled' : 'Disabled'}`);
    console.log(`  Display Active: ${status.displayActive ? 'Yes' : 'No'}`);
    console.log(`  Compute Mode: ${status.computeMode}`);
    console.log(
      `  MIG Mode: ${status.migMode === null ? 'N/A' : status.migMode ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `  ECC Errors (Corrected): ${status.eccErrorsCorrected === null ? 'N/A' : status.eccErrorsCorrected}`
    );
  }

  // Get driver info
  console.log('\n--- Driver Info ---');
  const driverInfo = unwrap(Nvml.getDriverInfo());
  console.log(`  Driver Version: ${driverInfo.driverVersion}`);
  console.log(`  NVML Version: ${driverInfo.nvmlVersion}`);
  console.log(`  CUDA Version: ${driverInfo.cudaVersion}`);

  // Get running processes
  console.log('\n--- GPU Processes ---');
  for (let i = 0; i < deviceCount; i++) {
    const device = Nvml.getDevice(i);
    const processes = unwrap(device.getProcesses());
    console.log(`GPU ${i}: ${processes.length} process(es)`);
    for (const proc of processes) {
      console.log(`  PID ${proc.pid}: ${proc.processName} (${proc.usedMemoryMiB} MiB)`);
    }
  }

  // Test full system snapshot
  console.log('\n--- System Snapshot ---');
  const snapshot = unwrap(Nvml.getSystemSnapshot());
  console.log(`  Timestamp: ${snapshot.timestamp.toISOString()}`);
  console.log(`  GPUs: ${snapshot.gpus.length}`);
  console.log(`  Total Processes: ${snapshot.processes.length}`);

  console.log('\nShutting down NVML...');
  Nvml.shutdown();
  console.log('Done!');
}

main();
