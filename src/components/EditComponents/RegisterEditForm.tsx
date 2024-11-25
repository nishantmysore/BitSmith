import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { DeviceFormData, RegisterFormData } from "@/types/validation";
import { Button } from "@/components/ui/button";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { acceptedWidthsStr } from "@/types/validation";
import { Plus } from "lucide-react";
import FieldEdit from "./FieldEditForm";
import { AccessType } from "@prisma/client";

const RegisterEditForm = ({
  index,
  register,
  watch,
  setValue,
  onChanged,
  onRemove,
  errors,
}: {
  index: number;
  register: UseFormRegister<DeviceFormData>;
  watch: UseFormWatch<DeviceFormData>;
  setValue: UseFormSetValue<DeviceFormData>;
  onChanged: () => void;
  onRemove: () => void;
  errors?: FieldErrors<RegisterFormData>;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const handleDelete = (e: any) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onRemove();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChanged();
  };
 
  // Added function to handle adding a new field
  const handleAddField = () => {
    const currentFields = watch(`registers.${index}.fields`) || [];
    setValue(`registers.${index}.fields`, [
      ...currentFields,
      {
        name: "",
        description: "",
        bits: "",
        access: "RW" as AccessType,
        status: "added",
      },
    ]);
    onChanged();
  };

  // Added function to handle field changes
  const handleFieldChange = () => {
    onChanged();
  };

  // Added function to handle field removal
  const handleFieldRemove = (fieldIndex: number) => {
    const currentFields = watch(`registers.${index}.fields`) || [];
    const field = currentFields[fieldIndex];
    
    if (field.status === "unchanged") {
      // Mark existing field as deleted
      const updatedFields = [...currentFields];
      updatedFields[fieldIndex] = { ...field, status: "deleted" };
      setValue(`registers.${index}.fields`, updatedFields);
    } else {
      // Remove new field entirely
      const updatedFields = currentFields.filter((_, i) => i !== fieldIndex);
      setValue(`registers.${index}.fields`, updatedFields);
    }
    onChanged();
  };

  const fields = watch(`registers.${index}.fields`) || [];

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        className="w-full border rounded-lg mb-4"
        value={isAccordionOpen ? "basic-info" : ""}
        onValueChange={(value) => setIsAccordionOpen(value === "basic-info")}
      >
        <AccordionItem value="basic-info">
          <div className="flex items-center justify-between px-4">
            <AccordionTrigger className="flex-1">
              <span>
                {watch(`registers.${index}.name`) || "New Register"}
              </span>
            </AccordionTrigger>

            <div
              onClick={handleDelete}
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
            >
              <Trash2 className="text-destructive" />
            </div>
          </div>

          <AccordionContent>
            <div className="space-y-6 p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`registers.${index}.name`}>Name</Label>
                  <Input
                    id={`registers.${index}.name`}
                    {...register(`registers.${index}.name`)}
                    onChange={(e) => {
                      register(`registers.${index}.name`).onChange(e);
                      handleInputChange(e);
                    }}
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
                    onChange={(e) => {
                      register(`registers.${index}.description`).onChange(e);
                      handleInputChange(e);
                    }}
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
                    onChange={(e) => {
                      register(`registers.${index}.address`).onChange(e);
                      handleInputChange(e);
                    }}
                  />
                  {errors?.address && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.address.message}
                      </AlertDescription>
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
                      <AlertDescription>
                        {errors.width.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fields</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddField}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.map((field, fieldIndex) => 
              field.status !== "deleted" && (
                <FieldEdit
                  key={fieldIndex}
                  registerIndex={index}
                  fieldIndex={fieldIndex}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  onChanged={handleFieldChange}
                  onRemove={() => handleFieldRemove(fieldIndex)}
                  errors={errors?.fields?.[fieldIndex]}
                />
              )
            )}
          </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Register</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this register? This action cannot
              be undone.
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

export default RegisterEditForm;
