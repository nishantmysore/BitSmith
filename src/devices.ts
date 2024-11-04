import { Device } from './device';
import { registers as adc_registers } from './registers'; // your existing registers file

export const deviceConfigs: Device[] = [
  {
    id: "adc",
    name: "ADC Controller",
    description: "12-bit ADC with DMA capabilities",
    registers: adc_registers
  },
  {
    id: "uart",
    name: "UART Controller",
    description: "Universal Asynchronous Receiver/Transmitter",
    registers: {
      UART_CTRL: {
        name: "UART_CTRL",
        address: "0x0000",
        fields: [
          { name: "ENABLE", bits: "31", access: "RW", description: "UART Enable" },
          { name: "BAUD_RATE", bits: "30:16", access: "RW", description: "Baud Rate Setting" },
          { name: "DATA_BITS", bits: "15:14", access: "RW", description: "Data Bits (5-8)" },
          { name: "STOP_BITS", bits: "13:12", access: "RW", description: "Stop Bits (1-2)" },
          { name: "PARITY", bits: "11:10", access: "RW", description: "Parity Selection" },
          { name: "RESERVED", bits: "9:0", access: "RSVD", description: "Reserved" }
        ]
      },
      // Add more UART registers as needed
    }
  }
  // Add more devices as needed
];
