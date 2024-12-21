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
  readAction?: String;
  writeAction?: String;
  modifiedWritevalues?: String;
  access: RegisterAccessType;
  isArray: Boolean;
  arraySize?: number;
  arrayStride?: BigInt;
  namePattern?: String;
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
  bitOffset: string;
  bitWidth: number;
  status: Status;
  readAction: String;
  writeAction: String;
  access: FieldAccessType;
};

export type FieldEnumFormData = {
  db_id?: string;
  name: string;
  value: number;
  description: string;
};
export type ValidFieldFieldNames = "name" | "description" | "bits" | "access";

export const FieldValidateSchema: ZodType<FieldFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "Field is required" })
    .min(1, { message: "Field name is too short" })
    .max(30, { message: "Field name is too long" }),
  description: z
    .string({ required_error: "Field description is required" })
    .min(1, { message: "Field description is too short" })
    .max(500, { message: "Field description is too long" }),
  bits: z
    .string()
    .regex(/^\d+(?::\d+)?$/, "Field bits must be a single number or range"),
  access: z.nativeEnum(AccessType),
  status: z.enum(STATUS_VALUES),
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
    address: z
      .string()
      .regex(
        /^(0x)?[0-9A-Fa-f]+$/,
        "Register Address must be a valid hex value",
      ),
    width: z.enum(acceptedWidthsStr),
    status: z.enum(STATUS_VALUES),
    fields: z.array(FieldValidateSchema).optional(),
  })
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
    registers: z.array(RegisterValidateSchema).optional(),
  })
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
