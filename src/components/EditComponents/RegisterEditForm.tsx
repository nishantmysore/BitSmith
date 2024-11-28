import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DeviceFormData,
  FieldFormData,
  RegisterFormData,
} from "@/types/validation";
import { Button } from "@/components/ui/button";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
  Control,
  useFieldArray,
} from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { acceptedWidthsStr } from "@/types/validation";
import { Plus } from "lucide-react";
import FieldEdit from "./FieldEditForm";
import { AccessType } from "@prisma/client";

const RegisterEditForm = ({
  index,
  register,
  control,
  watch,
  setValue,
  onChanged,
  errors,
}: {
  index: number;
  register: UseFormRegister<DeviceFormData>;
  control: Control<DeviceFormData>;
  watch: UseFormWatch<DeviceFormData>;
  setValue: UseFormSetValue<DeviceFormData>;
  onChanged: () => void;
  errors?: FieldErrors<RegisterFormData>;
}) => {
  const {
    fields: registerFields,
    remove,
    append,
    update,
  } = useFieldArray({
    control,
    name: `registers.${index}.fields`,
  });

  const handleAddField = () => {
    append({
      name: "",
      description: "",
      bits: "",
      access: "RW" as AccessType,
      status: "added",
    });
  };

  const handleFieldChange = () => {
    onChanged();
  };

  const handleFieldRemove = (fieldIndex: number) => {
    const field = registerFields[fieldIndex];
    console.log("Removing Field: ", field);

    if (field.status === "unchanged") {
      const updatedField: FieldFormData = {
        ...field,
        status: "deleted",
      };
      update(fieldIndex, updatedField);
      //onChanged(); // Notify parent of the change
      setValue(`registers.${index}.fields.${fieldIndex}.status`, "deleted");
    } else {
      remove(fieldIndex);
    }
  };

  return (
    <div>
      <div className="space-y-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`registers.${index}.name`}>Name</Label>
            <Input
              id={`registers.${index}.name`}
              {...register(`registers.${index}.name`)}
              onClick={(e) => e.stopPropagation()}
            />
            {errors?.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor={`registers.${index}.description`}>
              Description
            </Label>
            <Input
              id={`registers.${index}.description`}
              {...register(`registers.${index}.description`)}
              onClick={(e) => e.stopPropagation()}
            />
            {errors?.description && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.description.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`registers.${index}.address`}>Address</Label>
            <Input
              id={`registers.${index}.address`}
              {...register(`registers.${index}.address`)}
              onClick={(e) => e.stopPropagation()}
            />
            {errors?.address && (
              <Alert variant="destructive">
                <AlertDescription>{errors.address.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor={`registers.${index}.width`}>Width</Label>
            <Select
              {...register(`registers.${index}.width`)}
              value={watch(`registers.${index}.width`)}
              onValueChange={(value) => {
                setValue(`registers.${index}.width`, value);
                onChanged();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select width" />
              </SelectTrigger>
              <SelectContent>
                {acceptedWidthsStr.map((width) => (
                  <SelectItem key={width} value={width}>
                    {width}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.width && (
              <Alert variant="destructive">
                <AlertDescription>{errors.width.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Fields</h3>
        </div>
        {registerFields.map((field, fieldIndex) => {
          if (field.status === "deleted") return null;
          return (
            <FieldEdit
              key={field.id}
              registerIndex={index}
              fieldIndex={fieldIndex}
              watch={watch}
              register={register}
              control={control}
              setValue={setValue}
              onChanged={handleFieldChange}
              onRemove={() => handleFieldRemove(fieldIndex)}
              errors={errors?.fields?.[fieldIndex]}
            />
          );
        })}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleAddField}
          >
            Add Field
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterEditForm;
