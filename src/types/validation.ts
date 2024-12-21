import { RegisterAccessType, FieldAccessType } from "@prisma/client";
import { FieldError, UseFormRegister } from "react-hook-form";
import { z, ZodType } from "zod";
import {
  normalizeHexAddress,
  parseBitRange,
  doRangesOverlap,
} from "@/utils/validation";

export const acceptedWidthsStr = [
  "1",
  "2",
  "4",
  "8",
  "16",
  "32",
  "64",
  "128",
] as const;

const STATUS_VALUES = ["unchanged", "added", "modified", "deleted"] as const;
export type Status = (typeof STATUS_VALUES)[number];

export type DeviceFormData = {
  name: string;
  description: string;
  base_address: string;
  isPublic: boolean;
  littleEndian: boolean;
  defaultClockFreq?: number;
  version?: String; 
  peripherals?: PeripheralFormData[];
};

export type DeviceFormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidDeviceFieldNames;
  register: UseFormRegister<DeviceFormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
};

export type ValidDeviceFieldNames =
  | "name"
  | "description"
  | "base_address"
  | "isPublic";

export type PeripheralFormData = {
  db_id?: string;
  name: string;
  description: string;
  base_address: BigInt;
  size: BigInt;
  status: Status;
  registers?: RegisterFormData[];
};

export type RegisterFormData = {
  db_id?: string;
  name: string;
  description: string;
  width: number;
  addressOffset: BigInt;
  resetValue: BigInt;
  resetMask?: BigInt;
  readAction?: string;
  writeAction?: string;
  modifiedWriteValues?: string;
  access: RegisterAccessType;
  isArray: boolean;
  arraySize?: number;
  arrayStride?: BigInt;
  namePattern?: string;
  status: Status;
  fields?: FieldFormData[];
};

export type ValidRegisterFieldNames =
  | "name"
  | "description"
  | "width"
  | "address";

export type FieldFormData = {
  db_id?: string;
  name: string;
  description: string;
  bitOffset: number;
  bitWidth: number;
  readAction?: string;
  writeAction?: string;
  access: FieldAccessType;
  status: Status;
  fieldEnums?: FieldEnumFormData[]; 
};

export type FieldEnumFormData = {
  db_id?: string;
  name: string;
  value: number;
  description: string; 
  status: Status;
};

export const FieldEnumValidateSchema: ZodType<FieldEnumFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "Field is required" })
    .min(1, { message: "Field name is too short" })
    .max(30, { message: "Field name is too long" }),
  description: z
    .string({ required_error: "Field description is required" })
    .min(1, { message: "Field description is too short" })
    .max(500, { message: "Field description is too long" }),
  value: z.coerce.number().nonnegative(),
  status: z.enum(STATUS_VALUES),
});

export const FieldValidateSchema: ZodType<FieldFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "Field Enum name is required" })
    .min(1, { message: "Field Enum name is too short" })
    .max(30, { message: "Field Enum name is too long" }),
  description: z
    .string({ required_error: "Field Enum description is required" })
    .min(1, { message: "Field Enum description is too short" })
    .max(500, { message: "Field Enum description is too long" }),
  bitOffset: z.coerce.number().nonnegative(),
  bitWidth: z.coerce.number().nonnegative(),
  readAction: z.string().optional(),
  writeAction: z.string().optional(),
  access: z.nativeEnum(FieldAccessType),
  status: z.enum(STATUS_VALUES),
  fieldEnums: z.array(FieldEnumValidateSchema).optional(),
});

export const RegisterValidateSchema: ZodType<RegisterFormData> = z
  .object({
    db_id: z.string().optional(),
    name: z
      .string({ required_error: "Register is required" })
      .min(1, { message: "Register name is too short" })
      .max(30, { message: "Register name is too long" }),
    description: z
      .string({ required_error: "Register description is required" })
      .min(1, { message: "Register description is too short" })
      .max(500, { message: "Register description is too long" }),
    width: z.coerce.number().positive(),
    addressOffset: z.coerce.bigint().nonnegative(),
    resetValue: z.coerce.bigint().nonnegative(),
    resetMask: z.coerce.bigint().nonnegative().optional(),
    readAction: z.string().optional(),
    writeAction: z.string().optional(),
    modifiedWriteValues: z.string().optional(),
    access: z.nativeEnum(RegisterAccessType),
    isArray: z.boolean(),
    arraySize: z.coerce.number().positive().optional(),
    arrayStride: z.coerce.bigint().nonnegative().optional(),
    namePattern: z.string().optional(),
    status: z.enum(STATUS_VALUES),
    fields: z.array(FieldValidateSchema).optional(),
  });
/*
  .superRefine((data, ctx) => {
    // Skip validation if there are no fields
    if (!data.fields || data.fields.length === 0) return;

    // Get the register width in bits
    const registerWidth = parseInt(data.width);
    const maxBit = registerWidth - 1;

    // Create a map to track field names
    const fieldNames = new Map<string, number>();

    // Create an array to store all bit ranges for overlap checking
    const bitRanges: Array<{ range: [number, number]; index: number }> = [];

    // Validate each field
    data.fields.forEach((field, index) => {
      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate field name "${field.name}" found at positions ${fieldNames.get(field.name)} and ${index}`,
          path: ["fields", index, "name"],
        });
      } else {
        fieldNames.set(field.name, index);
      }

      // Parse and validate bit range
      const [highBit, lowBit] = parseBitRange(field.bits);

      // Check if bits are within register width
      if (highBit > maxBit || lowBit > maxBit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Field bits [${highBit}:${lowBit}] exceed register width of ${registerWidth} bits`,
          path: ["fields", index, "bits"],
        });
      }

      // Check for range overlaps with previous fields
      bitRanges.forEach(({ range, index: prevIndex }) => {
        if (doRangesOverlap(range, [highBit, lowBit])) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Field bits [${highBit}:${lowBit}] overlap with field at position ${prevIndex} with bits [${range[0]}:${range[1]}]`,
            path: ["fields", index, "bits"],
          });
        }
      });

      // Add current range to the list
      bitRanges.push({ range: [highBit, lowBit], index });
    });
  });
*/

export const PeripheralValidateSchema: ZodType<PeripheralFormData> = z
  .object({
    db_id: z.string().optional(),
    name: z
      .string({ required_error: "Register is required" })
      .min(1, { message: "Register name is too short" })
      .max(30, { message: "Register name is too long" }),
    description: z
     .string({ required_error: "Register description is required" })
      .min(1, { message: "Register description is too short" })
      .max(500, { message: "Register description is too long" }),
    base_address: z.coerce.bigint().nonnegative(),
    size: z.coerce.bigint().nonnegative(),
    status: z.enum(STATUS_VALUES),
    registers: z.array(RegisterValidateSchema).optional(),
  });

export const DeviceValidateSchema: ZodType<DeviceFormData> = z
  .object({
    name: z
      .string({ required_error: "Device name is required" })
      .min(1, { message: "Device name is too short" })
      .max(30, { message: "Device name is too long" }),
    description: z
      .string({ required_error: "Device description is required" })
      .min(1, { message: "Device description is too short" })
      .max(500, { message: "Device description is too long" }),
    base_address: z
      .string()
      .regex(/^(0x)?[0-9A-Fa-f]+$/, "Device base address be a valid hex value"),
    isPublic: z.boolean({ required_error: "isPublic is required" }),
    littleEndian: z.boolean({ required_error: "littleEndian is required" }),
    defaultClockFreq: z.number({ required_error: "ClockFrequency in Mhz is required" }),
    version: z.string().optional(),
    peripherals: z.array(PeripheralValidateSchema).optional(),
  });
/*
  .superRefine((data, ctx) => {
    // Skip validation if there are no registers
    if (!data.registers || data.registers.length === 0) return;

    // Create a map to track register names
    const registerNames = new Map<string, number>();
    const registerAddresses = new Map<string, number>();

    // Check for duplicate names
    data.registers.forEach((register, index) => {
      if (registerNames.has(register.name)) {
        // Add error for duplicate name
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate register name "${register.name}" found at positions ${registerNames.get(register.name)} and ${index}`,
          path: ["registers", index, "name"],
        });
      } else {
        registerNames.set(register.name, index);
      }
      const normalized = normalizeHexAddress(register.address);
      if (registerAddresses.has(normalized)) {
        // Add error for duplicate name
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate register address "${register.address}" found at positions ${registerAddresses.get(normalized)} and ${index}`,
          path: ["registers", index, "address"],
        });
      } else {
        registerAddresses.set(normalized, index);
      }
    });
  });
*/
