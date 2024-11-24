import { AccessType } from "@prisma/client";
import { FieldError, UseFormRegister} from "react-hook-form"
import { z, ZodType } from "zod"; 

export const acceptedWidthsStr = ["1","2","4","8","16","32","64","128"] as const;
const STATUS_VALUES = ["unchanged", "added", "modified", "deleted"] as const;
export type Status = typeof STATUS_VALUES[number];

export type DeviceFormData = {
  name: string;
  description: string;
  base_address: string;
  isPublic: boolean;
  registers: RegisterFormData[];
};

export type DeviceFormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidDeviceFieldNames;
  register: UseFormRegister<DeviceFormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
}

export type ValidDeviceFieldNames =
  | "name"
  | "description"
  | "base_address"
  | "isPublic";

export type RegisterFormData = {
  name: string;
  description: string;
  width: string;
  address: string;
  status: Status; 
};

export type RegisterFormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidDeviceFieldNames;
  register: UseFormRegister<RegisterFormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
}

export type ValidRegisterFieldNames =
  | "name"
  | "description"
  | "width"
  | "address";

export type FieldFormData = {
  name: string;
  description: string;
  bits: string;
  access: AccessType;
};

export type FieldFormFieldProps = {
  type: string;
  placeholder: string;
  name: ValidDeviceFieldNames;
  register: UseFormRegister<FieldFormData>;
  error: FieldError | undefined;
  valueAsNumber?: boolean;
}

export type ValidFieldFieldNames =
  | "name"
  | "description"
  | "bits"
  | "access";

export const FieldValidateSchema: ZodType<FieldFormData> = z.object({
    name: z.string({required_error: "Field is required"}).min(1, {message: "Field name is too short"}).max(30, {message: "Field name is too long"}),
    description: z.string({required_error: "Field description is required"}).min(1, {message: "Field description is too short"}).max(500, {message: "Field description is too long"}),
    bits: z.string().regex(/[0-9A-Fa-f]+/g, "Field bits must be a range"),
    access: z.nativeEnum(AccessType), 
});

export const RegisterValidateSchema: ZodType<RegisterFormData> = z.object({
    name: z.string({required_error: "Register is required"}).min(1, {message: "Register name is too short"}).max(30, {message: "Register name is too long"}),
    description: z.string({required_error: "Register description is required"}).min(1, {message: "Register description is too short"}).max(500, {message: "Register description is too long"}),
    address: z.string().regex(/[0-9A-Fa-f]+/g, "Register Address must be a valid hex value"),
    width: z.enum(acceptedWidthsStr), 
    fields: z.array(FieldValidateSchema),
    status: z.enum(STATUS_VALUES),
});

export const DeviceValidateSchema: ZodType<Omit<DeviceFormData, 'registers'>> = z.object({
    name: z.string({required_error: "Device name is required"}).min(1, {message: "Device name is too short"}).max(30, {message: "Device name is too long"}),
    description: z.string({required_error: "Device description is required"}).min(1, {message: "Device description is too short"}).max(500, {message: "Device description is too long"}),
    base_address: z.string().regex(/[0-9A-Fa-f]+/g, "Device base address be a valid hex value"),
    isPublic: z.boolean({required_error: "isPublic is required",}),
});


