import { Register } from "@prisma/client";

const acceptedWidths = [1, 2, 4, 8, 16, 24, 32, 64, 128, 256];

export const isValidHexAddress = (address: string): boolean => {
  const hexRegex = /^(0x)?[0-9A-Fa-f]+$/;
  return hexRegex.test(address);
};

export const isValidRegisterWidth = (width: number): boolean => {
  return acceptedWidths.includes(width);
};

export const hasRegisterAddressCollision = (
  registers: Register[],
  currentRegister: Register,
): boolean => {
  return registers.some(
    (reg) => 
      reg.id !== currentRegister.id && 
      reg.address.toLowerCase() === currentRegister.address.toLowerCase()
  );
};

