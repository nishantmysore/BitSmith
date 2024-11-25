import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeviceFormData, FieldFormData, RegisterFormData } from "@/types/validation";
import { UseFormWatch, UseFormRegister, UseFormSetValue, FieldErrors} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccessType } from "@prisma/client";

const FieldEdit = ({
  register,
  registerIndex,
  fieldIndex,
  watch,
  setValue,
  onChanged,
  onRemove,
  errors,
}: {
  registerIndex: number;
  fieldIndex: number;
  register:  UseFormRegister<DeviceFormData>;
  watch: UseFormWatch<DeviceFormData>;
  setValue: UseFormSetValue<DeviceFormData>;
  onChanged: () => void;
  onRemove: () => void;
  errors?: FieldErrors<FieldFormData>;

}) => {
  const handleInputChange = (e) => {
    onChanged();
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center p-4">
        <h4 className="text-sm font-medium">
        <span>
          {watch(`registers.${registerIndex}.fields.${fieldIndex}.name`) || "New Field"}
        </span>
        </h4>
        <div
          onClick={onRemove}
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.name`}>
              Name
            </Label>
            <Input
              id={`registers.${registerIndex}.fields.${fieldIndex}.name`}
              {...register(`registers.${registerIndex}.fields.${fieldIndex}.name`)}
              onChange={(e) => {
                register(`registers.${registerIndex}.fields.${fieldIndex}.name`).onChange(e);
                handleInputChange(e);
              }}
            />
            {errors?.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.bits`}>
              Bits
            </Label>
            <Input
              id={`registers.${registerIndex}.fields.${fieldIndex}.bits`}
              {...register(`registers.${registerIndex}.fields.${fieldIndex}.bits`)}
              placeholder="e.g., 31:24 or 7"
              onChange={(e) => {
                register(`registers.${registerIndex}.fields.${fieldIndex}.bits`).onChange(e);
                handleInputChange(e);
              }}
            />
            {errors?.bits && (
              <Alert variant="destructive">
                <AlertDescription>{errors.bits.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.description`}>
              Description
            </Label>
            <Input
              id={`registers.${registerIndex}.fields.${fieldIndex}.description`}
              {...register(`registers.${registerIndex}.fields.${fieldIndex}.description`)}
              onChange={(e) => {
                register(`registers.${registerIndex}.fields.${fieldIndex}.description`).onChange(e);
                handleInputChange(e);
              }}
            />
            {errors?.description && (
              <Alert variant="destructive">
                <AlertDescription>{errors.description.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.access`}>
              Access
            </Label>
            <Select
              value={watch(`registers.${registerIndex}.fields.${fieldIndex}.access`)}
              onValueChange={(value) => {
                setValue(`registers.${registerIndex}.fields.${fieldIndex}.access`, value as AccessType);
                onChanged();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select access type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AccessType).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.access && (
              <Alert variant="destructive">
                <AlertDescription>{errors.access.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldEdit;
