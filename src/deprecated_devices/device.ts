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

export type RegisterMap = {
  [key: string]: Register;
}

export interface Device {
  id: string;
  name: string;
  description: string;
  registers: RegisterMap;
}
