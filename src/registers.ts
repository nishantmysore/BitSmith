export interface RegisterField {
  name: string;
  bits: string;
  access: 'RO' | 'RW' | 'WO' | 'RW1C' | 'W1S' | 'W1C' | 'RSVD';
  description: string;
}

export interface Register {
  name: string;
  address: string;
  fields: RegisterField[];
}

export const registers = {
  // Status and Control Register
  STATUS_CTRL: {
    name: "STATUS_CTRL",
    address: "0x0000",
    fields: [
      { name: "BUSY", bits: "31", access: "RO", description: "Device Busy Flag" },
      { name: "ERROR", bits: "30", access: "RW1C", description: "Error Flag (Write 1 to Clear)" },
      { name: "STATE", bits: "29:28", access: "RO", description: "Current State" },
      { name: "SOFT_RST", bits: "27", access: "WO", description: "Software Reset (Self-clearing)" },
      { name: "RESERVED1", bits: "26:24", access: "RSVD", description: "Reserved" },
      { name: "IRQ_MASK", bits: "23:16", access: "RW", description: "Interrupt Mask Bits" },
      { name: "VERSION", bits: "15:8", access: "RO", description: "Hardware Version" },
      { name: "ID", bits: "7:0", access: "RO", description: "Device ID" }
    ]
  },

  // Configuration Register with different field widths
  CONFIG: {
    name: "CONFIG",
    address: "0x0004",
    fields: [
      { name: "CLK_DIV", bits: "31:24", access: "RW", description: "Clock Divider" },
      { name: "SAMPLE_RATE", bits: "23:20", access: "RW", description: "Sampling Rate Selection" },
      { name: "TRIGGER_EDGE", bits: "19:18", access: "RW", description: "Trigger Edge Selection" },
      { name: "FILTER_EN", bits: "17", access: "RW", description: "Filter Enable" },
      { name: "RESERVED", bits: "16:12", access: "RSVD", description: "Reserved" },
      { name: "THRESHOLD", bits: "11:0", access: "RW", description: "Detection Threshold" }
    ]
  },

  // DMA Control Register
  DMA_CTRL: {
    name: "DMA_CTRL",
    address: "0x0008",
    fields: [
      { name: "DMA_EN", bits: "31", access: "RW", description: "DMA Enable" },
      { name: "BURST_SIZE", bits: "30:28", access: "RW", description: "DMA Burst Size" },
      { name: "PRIORITY", bits: "27:26", access: "RW", description: "DMA Channel Priority" },
      { name: "RESERVED1", bits: "25:24", access: "RSVD", description: "Reserved" },
      { name: "DESC_PTR", bits: "23:0", access: "RW", description: "Descriptor Pointer" }
    ]
  },

  // Interrupt Status Register (Read-only with Write-1-to-Clear)
  INT_STATUS: {
    name: "INT_STATUS",
    address: "0x000C",
    fields: [
      { name: "FIFO_FULL", bits: "31", access: "RW1C", description: "FIFO Full Interrupt" },
      { name: "FIFO_EMPTY", bits: "30", access: "RW1C", description: "FIFO Empty Interrupt" },
      { name: "TIMEOUT", bits: "29", access: "RW1C", description: "Timeout Interrupt" },
      { name: "ERROR_FLAGS", bits: "28:24", access: "RW1C", description: "Error Status Flags" },
      { name: "RESERVED", bits: "23:16", access: "RSVD", description: "Reserved" },
      { name: "STATUS_FLAGS", bits: "15:0", access: "RO", description: "General Status Flags" }
    ]
  },

  // Timer Register (Write-only configuration)
  TIMER: {
    name: "TIMER",
    address: "0x0010",
    fields: [
      { name: "PRESCALER", bits: "31:24", access: "WO", description: "Timer Prescaler Value" },
      { name: "PERIOD", bits: "23:8", access: "WO", description: "Timer Period" },
      { name: "MODE", bits: "7:4", access: "WO", description: "Timer Mode Selection" },
      { name: "TRIGGER_SEL", bits: "3:0", access: "WO", description: "Trigger Source Selection" }
    ]
  },

  // Mixed Access Rights Register
  MIXED_ACCESS: {
    name: "MIXED_ACCESS",
    address: "0x0014",
    fields: [
      { name: "DEBUG_EN", bits: "31", access: "RW", description: "Debug Enable" },
      { name: "COUNTER", bits: "30:24", access: "RO", description: "Event Counter" },
      { name: "CLEAR_CNT", bits: "23", access: "WO", description: "Clear Counter" },
      { name: "LOCK_BIT", bits: "22", access: "W1S", description: "Lock Bit (Write 1 to Set)" },
      { name: "UNLOCK_BIT", bits: "21", access: "W1C", description: "Unlock Bit (Write 1 to Clear)" },
      { name: "RESERVED", bits: "20:16", access: "RSVD", description: "Reserved" },
      { name: "STATUS_BITS", bits: "15:0", access: "RO", description: "Status Bits" }
    ]
  }
};

export type RegisterMap = typeof registers;
