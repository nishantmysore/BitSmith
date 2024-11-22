import { Register, Field } from "@prisma/client";

export type RegisterError = {
  name?: string;
  address?: string;
  width?: string;
  fields?: {
    name?: string;
    bits?: string;
    access?: string;
    description?: string;
  }[];
};

export interface FormErrors {
  name?: string;
  description?: string;
  base_address?: string;
  registers?: {
    [key: string]: RegisterError;
  };
}

export interface FormData {
  name: string;
  description: string;
  base_address: string;
  isPublic: boolean;
  registers: (Register & { fields: Field[] })[];
}

