import { RegisterAccessType, FieldAccessType } from "@prisma/client";
import { FieldError, UseFormRegister } from "react-hook-form";
import { z, ZodType } from "zod";

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

export const STATUS_VALUES = [
  "unchanged",
  "added",
  "modified",
  "deleted",
] as const;
export type Status = (typeof STATUS_VALUES)[number];

export type DeviceFormData = {
  name: string;
  description: string;
  isPublic: boolean;
  littleEndian: boolean;
  defaultClockFreq?: number;
  version?: string;
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
  baseAddress: bigint;
  size: bigint;
  registers?: RegisterFormData[];
};

export type RegisterFormData = {
  db_id?: string;
  name: string;
  description: string;
  width: number;
  addressOffset: bigint;
  resetValue: bigint;
  resetMask?: bigint;
  readAction?: string;
  writeAction?: string;
  modifiedWriteValues?: string;
  access: RegisterAccessType;
  isArray: boolean;
  arraySize?: number;
  arrayStride?: bigint;
  namePattern?: string;
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
  enumeratedValues?: FieldEnumFormData[];
};

export type FieldEnumFormData = {
  db_id?: string;
  name: string;
  value: number;
  description: string;
};

export const FieldEnumValidateSchema: ZodType<FieldEnumFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "FieldEnum is required" })
    .min(1, { message: "FieldEnum name is too short" })
    .max(100, { message: "FieldEnum name is too long" }),
  description: z
    .string({ required_error: "FieldEnum description is required" })
    .max(5000, { message: "FieldEnum description is too long" }),
  value: z.coerce.number().nonnegative(),
});

export const FieldValidateSchema: ZodType<FieldFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "Field name is required" })
    .min(1, { message: "Field name is too short" })
    .max(100, { message: "Field name is too long" }),
  description: z
    .string({ required_error: "Field description is required" })
    .max(5000, { message: "Field description is too long" }),
  bitOffset: z.coerce.number().nonnegative(),
  bitWidth: z.coerce.number().nonnegative(),
  readAction: z.string().optional(),
  writeAction: z.string().optional(),
  access: z.nativeEnum(FieldAccessType),
  enumeratedValues: z.array(FieldEnumValidateSchema).optional(),
});

export const RegisterValidateSchema: ZodType<RegisterFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "Register is required" })
    .min(1, { message: "Register name is too short" })
    .max(100, { message: "Register name is too long" }),
  description: z
    .string({ required_error: "Register description is required" })
    .min(1, { message: "Register description is too short" })
    .max(5000, { message: "Register description is too long" }),
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
  fields: z.array(FieldValidateSchema).optional(),
});

export const PeripheralValidateSchema: ZodType<PeripheralFormData> = z.object({
  db_id: z.string().optional(),
  name: z
    .string({ required_error: "Register is required" })
    .min(1, { message: "Register name is too short" })
    .max(100, { message: "Register name is too long" }),
  description: z
    .string({ required_error: "Register description is required" })
    .min(1, { message: "Register description is too short" })
    .max(5000, { message: "Register description is too long" }),
  baseAddress: z.coerce.bigint().nonnegative(),
  size: z.coerce.bigint().nonnegative(),
  registers: z.array(RegisterValidateSchema).optional(),
});

export const DeviceValidateSchema: ZodType<DeviceFormData> = z.object({
  name: z
    .string({ required_error: "Device name is required" })
    .min(1, { message: "Device name is too short" })
    .max(100, { message: "Device name is too long" }),
  description: z
    .string({ required_error: "Device description is required" })
    .min(1, { message: "Device description is too short" })
    .max(5000, { message: "Device description is too long" }),
  isPublic: z.boolean({ required_error: "isPublic is required" }),
  littleEndian: z.boolean({ required_error: "littleEndian is required" }),
  defaultClockFreq: z.number().optional(),
  version: z.string().optional(),
  peripherals: z.array(PeripheralValidateSchema).optional(),
});
