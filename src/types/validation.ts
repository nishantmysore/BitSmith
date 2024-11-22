import { Register } from "@prisma/client";

export interface FormErrors {
  name?: string;
  description?: string;
  base_address?: string;
  registers?: {
    [key: string]: {
      name?: string;
      address?: string;
      width?: string;
      fields?: string;
    };
  };
}

export interface FormData {
  name: string;
  description: string;
  base_address: string;
  isPublic: boolean;
  registers: Register[];
}

