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
  registers?: RegisterFormData[];
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
  db_id?: string;
  name: string;
  description: string;
  width: string;
  address: string;
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
  bits: string;
  status: Status; 
  access: AccessType;
};

export type ValidFieldFieldNames =
  | "name"
  | "description"
  | "bits"
  | "access";

export const FieldValidateSchema: ZodType<FieldFormData> = z.object({
    db_id: z.string().optional(),
    name: z.string({required_error: "Field is required"}).min(1, {message: "Field name is too short"}).max(30, {message: "Field name is too long"}),
    description: z.string({required_error: "Field description is required"}).min(1, {message: "Field description is too short"}).max(500, {message: "Field description is too long"}),
    bits: z.string().regex(/[0-9A-Fa-f]+/g, "Field bits must be a range"),
    access: z.nativeEnum(AccessType), 
    status: z.enum(STATUS_VALUES),
});

export const RegisterValidateSchema: ZodType<RegisterFormData> = z.object({
    db_id: z.string().optional(),
    name: z.string({required_error: "Register is required"}).min(1, {message: "Register name is too short"}).max(30, {message: "Register name is too long"}),
    description: z.string({required_error: "Register description is required"}).min(1, {message: "Register description is too short"}).max(500, {message: "Register description is too long"}),
    address: z.string().regex(/[0-9A-Fa-f]+/g, "Register Address must be a valid hex value"),
    width: z.enum(acceptedWidthsStr), 
    status: z.enum(STATUS_VALUES),
    fields: z.array(FieldValidateSchema).optional(),
});

export const DeviceValidateSchema: ZodType<DeviceFormData> = z.object({
    name: z.string({required_error: "Device name is required"}).min(1, {message: "Device name is too short"}).max(30, {message: "Device name is too long"}),
    description: z.string({required_error: "Device description is required"}).min(1, {message: "Device description is too short"}).max(500, {message: "Device description is too long"}),
    base_address: z.string().regex(/[0-9A-Fa-f]+/g, "Device base address be a valid hex value"),
    isPublic: z.boolean({required_error: "isPublic is required",}),
    registers: z.array(RegisterValidateSchema).optional()
}).superRefine((data, ctx) => {
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
                path: ['registers', index, 'name']
            });
        } else {
            registerNames.set(register.name, index);
        }
        if (registerAddresses.has(register.address)) {
            // Add error for duplicate name
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Duplicate register address "${register.address}" found at positions ${registerAddresses.get(register.address)} and ${index}`,
                path: ['registers', index, 'address']
            });
        } else {
            registerAddresses.set(register.address, index);
        }
    });
});


;



