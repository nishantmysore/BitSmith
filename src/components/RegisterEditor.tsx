// src/components/RegisterEditor.tsx
"use client";

import { useState } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FieldEditor } from "./FieldEditor";
import { Trash2 } from "lucide-react";
import { Register } from "@prisma/client";

const acceptedWidths = [1, 2, 4, 8, 16, 24, 32, 64, 128, 256];

interface RegisterEditorProps {
  register: Register;
  errors?: {
    name?: string;
    address?: string;
    width?: string;
    fields?: string;
  };
  touched: Set<string>;
  onBlur: (field: string) => void;
  onChange: (updatedRegister: Register) => void;
  onDelete: () => void;
}

export function RegisterEditor({
  register,
  errors,
  touched,
  onBlur,
  onChange,
  onDelete,
}: RegisterEditorProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleFieldChange = (fieldIndex: number, updatedField: any) => {
    const newFields = [...register.fields];
    newFields[fieldIndex] = updatedField;
    onChange({ ...register, fields: newFields });
  };

  const handleFieldDelete = (fieldIndex: number) => {
    const newFields = register.fields.filter(
      (_: any, i: number) => i !== fieldIndex,
    );
    onChange({ ...register, fields: newFields });
  };

  const addNewField = () => {
    onChange({
      ...register,
      fields: [
        ...register.fields,
        {
          name: "",
          bits: "",
          access: "RW",
          description: "",
        },
      ],
    });
  };

  const getFieldKey = (field: string) => `registers.${register.id}.${field}`;

  return (
    <div className="relative">
      <AccordionItem
        value={register.id || "new"}
        className="border rounded-lg mb-4"
      >
        <AccordionTrigger className="px-4">
          <div className="flex items-center justify-between w-full">
            <span>{register.name || "New Register"}</span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="p-4">
          <div className="space-y-4">
            {/* Register Properties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${register.id}-name`}>Register Name</Label>
                <Input
                  id={`${register.id}-name`}
                  value={register.name}
                  onChange={(e) =>
                    onChange({ ...register, name: e.target.value })
                  }
                  onBlur={() => onBlur(getFieldKey("name"))}
                  className={errors?.name ? "border-red-500" : ""}
                />
                {touched.has(getFieldKey("name")) && errors?.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${register.id}-address`}>Address (Hex)</Label>
                <Input
                  id={`${register.id}-address`}
                  value={register.address}
                  onChange={(e) =>
                    onChange({ ...register, address: e.target.value })
                  }
                  onBlur={() => onBlur(getFieldKey("address"))}
                  placeholder="0x00"
                  className={errors?.address ? "border-red-500" : ""}
                />
                {touched.has(getFieldKey("address")) && errors?.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${register.id}-width`}>Width (bits)</Label>
                <Select
                  value={register.width.toString()}
                  onValueChange={(value) => {
                    onChange({ ...register, width: parseInt(value) });
                    onBlur(getFieldKey("width"));
                  }}
                >
                  <SelectTrigger
                    className={errors?.width ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                  <SelectContent>
                    {acceptedWidths.map((width) => (
                      <SelectItem key={width} value={width.toString()}>
                        {width}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.has(getFieldKey("width")) && errors?.width && (
                  <p className="text-sm text-red-500">{errors.width}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${register.id}-description`}>
                  Description
                </Label>
                <Input
                  id={`${register.id}-description`}
                  value={register.description}
                  onChange={(e) =>
                    onChange({ ...register, description: e.target.value })
                  }
                  onBlur={() => onBlur(getFieldKey("description"))}
                />
              </div>
            </div>

            {/* Fields Section */}
            <div className="space-y-4">
              <h4 className="font-semibold">Fields</h4>
              {register.fields.map((field: any, index: number) => (
                <FieldEditor
                  key={index}
                  field={field}
                  onChange={(updatedField) =>
                    handleFieldChange(index, updatedField)
                  }
                  onDelete={() => handleFieldDelete(index)}
                  errors={errors?.fields ? errors.fields[index] : undefined}
                  touched={touched}
                  onBlur={(fieldName) =>
                    onBlur(getFieldKey(`fields.${index}.${fieldName}`))
                  }
                />
              ))}

              <Button variant="outline" onClick={addNewField}>
                Add Field
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <div className="absolute right-4 top-3">
            <div
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
          </div>
        </AlertDialogTrigger>
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
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
