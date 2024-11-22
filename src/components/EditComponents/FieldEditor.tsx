// components/FieldEditor.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldFormData } from "@/types/device";
import { FormErrors } from "@/types/validation";
import { Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessType } from "@prisma/client";

interface FieldEditorProps {
  field: FieldFormData;
  onUpdate: (updatedField: FieldFormData) => void;
  onDelete: () => void;
  errors?: FormErrors["registers"][string]["fields"][string];
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onUpdate,
  onDelete,
  errors,
}) => {
  const handleFieldChange = (fieldName: keyof FieldFormData, value: any) => {
    onUpdate({ ...field, [fieldName]: value });
  };

  return (
    <div className="border p-4 my-4 space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="text-md font-semibold">Field: {field.name || "New Field"}</h5>
        <Button variant="destructive" onClick={onDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete Field
        </Button>
      </div>

      {/* Field Name */}
      <div className="space-y-2">
        <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
        <Input
          id={`field-name-${field.id}`}
          value={field.name}
          onChange={(e) =>
            handleFieldChange("name", e.target.value)
          }
          className={errors?.name ? "border-red-500" : ""}
        />
        {errors?.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Bits */}
      <div className="space-y-2">
        <Label htmlFor={`field-bits-${field.id}`}>Bits</Label>
        <Input
          id={`field-bits-${field.id}`}
          value={field.bits}
          onChange={(e) =>
            handleFieldChange("bits", e.target.value)
          }
          className={errors?.bits ? "border-red-500" : ""}
        />
        {errors?.bits && (
          <p className="text-sm text-red-500">{errors.bits}</p>
        )}
      </div>

      {/* Access Type */}
      <div className="space-y-2">
        <Label htmlFor={`field-access-${field.id}`}>Access Type</Label>
        <Select
          value={field.access}
          onValueChange={(value) =>
            handleFieldChange("access", value as AccessType)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Access Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AccessType).map((accessType) => (
              <SelectItem key={accessType} value={accessType}>
                {accessType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.access && (
          <p className="text-sm text-red-500">{errors.access}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor={`field-description-${field.id}`}>Description</Label>
        <Input
          id={`field-description-${field.id}`}
          value={field.description}
          onChange={(e) =>
            handleFieldChange("description", e.target.value)
          }
          className={errors?.description ? "border-red-500" : ""}
        />
        {errors?.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>
    </div>
  );
};

