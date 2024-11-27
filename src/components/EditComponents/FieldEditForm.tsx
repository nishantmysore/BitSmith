import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeviceFormData, FieldFormData } from "@/types/validation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UseFormWatch,
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
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
  register: UseFormRegister<DeviceFormData>;
  watch: UseFormWatch<DeviceFormData>;
  setValue: UseFormSetValue<DeviceFormData>;
  onChanged: () => void;
  onRemove: () => void;
  errors?: FieldErrors<FieldFormData>;
}) => {
  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onRemove();
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center p-4">
        <h4 className="text-sm font-medium">
          <span>
            {watch(`registers.${registerIndex}.fields.${fieldIndex}.name`) ||
              "New Field"}
          </span>
        </h4>
        <Button type="button" variant="outline"
            
          onClick={handleDelete}
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.name`}
            >
              Name
            </Label>

            <Input
              id={`registers.${registerIndex}.fields.${fieldIndex}.name`}
              {...register(
                `registers.${registerIndex}.fields.${fieldIndex}.name`,
              )}
              onClick={(e) => e.stopPropagation()}
            />
            {errors?.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.bits`}
            >
              Bits
            </Label>

            <Input
              id={`registers.${registerIndex}.fields.${fieldIndex}.bits`}
              {...register(
                `registers.${registerIndex}.fields.${fieldIndex}.bits`,
              )}
              onClick={(e) => e.stopPropagation()}
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
            <Label
              htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.description`}
            >
              Description
            </Label>

            <Input
              id={`registers.${registerIndex}.fields.${fieldIndex}.description`}
              {...register(
                `registers.${registerIndex}.fields.${fieldIndex}.description`,
              )}
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

          <div className="space-y-2">
            <Label
              htmlFor={`registers.${registerIndex}.fields.${fieldIndex}.access`}
            >
              Access
            </Label>
            <Select
              value={watch(
                `registers.${registerIndex}.fields.${fieldIndex}.access`,
              )}
              onValueChange={(value) => {
                setValue(
                  `registers.${registerIndex}.fields.${fieldIndex}.access`,
                  value as AccessType,
                );
                onChanged();
              }}
            >
              <SelectTrigger onClick={(e) => e.stopPropagation()}>
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Register</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this field?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FieldEdit;
