import { FieldError, UseFormRegister} from "react-hook-form"
import { z, ZodType } from "zod"; 

export type DeviceFormData = {
  name: string;
  description: string;
  base_address: string;
  isPublic: boolean;
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

 export const DeviceValidateSchema: ZodType<DeviceFormData> = z.object({
    name: z.string({required_error: "Device Field is required"}).min(1, {message: "Device name is too short"}).max(30, {message: "Device name is too long"}),
    description: z.string({required_error: "Device description is required"}).min(1, {message: "Device description is too short"}).max(500, {message: "Device description is too long"}),
    base_address: z.string().regex(/[0-9A-Fa-f]+/g, "Must be a valid hex value"),
    isPublic: z.boolean({required_error: "isPublic is required",})
  });
//  .refine((data) => data.password === data.confirmPassword, {
//    message: "Passwords do not match",
//    path: ["confirmPassword"], // path of error
//  });
