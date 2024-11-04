// src/devices/index.ts
import { Device } from '@/devices/device';
import adc from './adc/device.json';
import uart from './uart/device.json';

// Import all device configurations statically
export const deviceConfigs: Device[] = [
  adc,
  uart
];

// Optional: Add validation
export function validateDevice(device: Device): boolean {
  // Basic validation
  if (!device.id || !device.name || !device.description || !device.registers) {
    return false;
  }

  // Register validation
  for (const [key, register] of Object.entries(device.registers)) {
    if (!register.name || !register.address || !Array.isArray(register.fields)) {
      return false;
    }

    // Field validation
    for (const field of register.fields) {
      if (!field.name || !field.bits || !field.access || !field.description) {
        return false;
      }
    }
  }

  return true;
}
