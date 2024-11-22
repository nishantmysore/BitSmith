// components/RegisterEditor.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RegisterFormData, FieldFormData } from "@/types/device";
import { FormErrors } from "@/types/validation";
import { FieldEditor } from "./FieldEditor";
import { Plus, Trash } from "lucide-react";

interface RegisterEditorProps {
  register: RegisterFormData;
  onUpdate: (updatedRegister: RegisterFormData) => void;
  onDelete: () => void;
  errors?: FormErrors["registers"][string];
  touched: Set<string>;
  onBlur: () => void;
}

export const RegisterEditor: React.FC<RegisterEditorProps> = ({
  register,
  onUpdate,
  onDelete,
  errors,
  touched,
  onBlur,
}) => {
  const handleRegisterChange = (field: keyof RegisterFormData, value: any) => {
    onUpdate({ ...register, [field]: value });
    onBlur();
  };

  const createNewField = (): FieldFormData => ({
    id: `temp_field_${Date.now()}`,
    name: "",
    bits: "",
    access: "RO", // Default access type
    description: "",
  });

  return (
    <div className="border p-4 my-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Register: {register.name || "New Register"}</h3>
        <Button variant="destructive" onClick={onDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete Register
        </Button>
      </div>

      {/* Register Name */}
      <div className="space-y-2">
        <Label htmlFor={`register-name-${register.id}`}>Register Name</Label>
        <Input
          id={`register-name-${register.id}`}
          value={register.name}
          onChange={(e) =>
            handleRegisterChange("name", e.target.value)
          }
          className={errors?.name ? "border-red-500" : ""}
        />
        {errors?.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor={`register-address-${register.id}`}>Address</Label>
        <Input
          id={`register-address-${register.id}`}
          value={register.address}
          onChange={(e) =>
            handleRegisterChange("address", e.target.value)
          }
          className={errors?.address ? "border-red-500" : ""}
        />
        {errors?.address && (
          <p className="text-sm text-red-500">{errors.address}</p>
        )}
      </div>

      {/* Width */}
      <div className="space-y-2">
        <Label htmlFor={`register-width-${register.id}`}>Width</Label>
        <Input
          id={`register-width-${register.id}`}
          type="number"
          value={register.width}
          onChange={(e) =>
            handleRegisterChange("width", parseInt(e.target.value, 10))
          }
          className={errors?.width ? "border-red-500" : ""}
        />
        {errors?.width && (
          <p className="text-sm text-red-500">{errors.width}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor={`register-description-${register.id}`}>Description</Label>
        <Input
          id={`register-description-${register.id}`}
          value={register.description}
          onChange={(e) =>
            handleRegisterChange("description", e.target.value)
          }
          className={errors?.description ? "border-red-500" : ""}
        />
        {errors?.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold">Fields</h4>
        {register.fields.map((field, index) => (
          <FieldEditor
            key={field.id || index}
            field={field}
            onUpdate={(updatedField) => {
              const newFields = [...register.fields];
              newFields[index] = updatedField;
              onUpdate({ ...register, fields: newFields });
              onBlur();
            }}
            onDelete={() => {
              const newFields = register.fields.filter(
                (_, i) => i !== index
              );
              onUpdate({ ...register, fields: newFields });
              onBlur();
            }}
            errors={errors?.fields && errors.fields[field.id || `new_field_${index}`]}
          />
        ))}

        <Button
          variant="outline"
          onClick={() => {
            onUpdate({
              ...register,
              fields: [...register.fields, createNewField()],
            });
            onBlur();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>
    </div>
  );
};

