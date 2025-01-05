"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DeviceFormData,
  DeviceValidateSchema,
  FieldFormData,
  FieldEnumFormData,
  PeripheralFormData,
  RegisterFormData,
} from "@/types/validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Upload } from "lucide-react";
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
import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface DeviceEditFormProps {
  newDevice?: boolean;
}

export function DeviceEditForm({ newDevice = false }: DeviceEditFormProps) {
  const [deviceToDelete, setDeviceToDelete] = useState<boolean>(false);
  const { toast } = useToast();
  const [data, setData] = useState<DeviceFormData | null>(null);

  interface ValidationErrorDetail {
    path: (string | number)[];
    message: string;
    invalidValue?: any;
    friendlyPath?: string;
  }
  const [validationErrors, setValidationErrors] = useState<
    ValidationErrorDetail[]
  >([]);

  const getFriendlyErrorPath = (path: (string | number)[], data: any) => {
    let current = data;
    const parts: string[] = [];

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];

      if (typeof segment === "number") {
        if (current[path[i - 1]]?.[segment]?.name) {
          parts.push(current[path[i - 1]][segment].name);
        }
      } else if (segment !== "name" && segment !== "description") {
        parts.push(segment);
      }

      current = current[segment];
    }

    return parts.join(" > ");
  };

  const onSubmit = async () => {
    if (!data) {
      toast({
        title: "Error",
        description: "No data to submit",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/device-upload", {
        method: newDevice ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Finished!");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update device");
      }

      console.log("Finished!");
      const responseData = await response.json();

      toast({
        title: "Success",
        description: "Device updated successfully!",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error Updating Device",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const onUpload = async () => {
    // Create a hidden file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file type
      if (file.type !== "application/json") {
        toast({
          title: "Invalid file type",
          description: "Please upload a JSON file",
          variant: "destructive",
        });
        return;
      }

      try {
        // Read the file
        const text = await file.text();
        const jsonData = JSON.parse(text);

        jsonData.peripherals = jsonData.peripherals.map(
          (peripheral: PeripheralFormData) => ({
            ...peripheral,
            status: "added",
            registers:
              peripheral.registers?.map((register: RegisterFormData) => ({
                ...register,
                status: "added",
                fields:
                  register.fields?.map((field: FieldFormData) => ({
                    ...field,
                    status: "added",
                    enumeratedValues:
                      field.enumeratedValues?.map(
                        (fieldEnum: FieldEnumFormData) => ({
                          ...fieldEnum,
                          status: "added",
                        }),
                      ) || [],
                  })) || [],
              })) || [],
          }),
        );

        // Validate the JSON data against schema
        const result = DeviceValidateSchema.safeParse(jsonData);

        if (!result.success) {
          const formattedErrors = result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
            invalidValue:
              issue.path.length > 0
                ? issue.path.reduce((obj, key) => obj?.[key], jsonData)
                : undefined,
            friendlyPath: getFriendlyErrorPath(issue.path, jsonData),
          }));
          setValidationErrors(formattedErrors);
          toast({
            title: "Invalid configuration",
            description: "The uploaded file contains validation errors.",
            variant: "destructive",
          });
          return;
        }

        setValidationErrors([]);
        console.log(jsonData);
        setData(jsonData);

        toast({
          title: "Success",
          description: "Configuration file loaded successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to parse the JSON file",
          variant: "destructive",
        });
        //console.error("Error processing file: ", error.stack);
      }
    };

    // Trigger the file input click
    fileInput.click();
  };
  /*
  const deleteDevice = async () => {
    try {
      const response = await fetch(`/api/devices/${selectedDevice?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete device");
      }

      const updatedDevice = await response.json();
      console.log(updatedDevice);

      toast({
        title: "Success",
        description: "Device deleted successfully",
      });

      await refreshDevices();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete Device: " + error,
        variant: "destructive",
      });
    }
  };
  */

  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            <div className="flex justify-between">
              Device Information
              {newDevice && (
                <Button onClick={onUpload}>
                  <Upload /> Upload Configuration JSON{" "}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={onSubmit}> Upload </Button>
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <Card className="mb-4 border-destructive">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-destructive">
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationErrors.map((error, index) => (
                <div key={index} className="p-4 rounded-md bg-destructive/10">
                  <p className="font-medium text-destructive">
                    {error.friendlyPath}
                  </p>
                  <p className="text-sm mt-1">
                    {error.message}
                    {error.invalidValue && (
                      <span className="ml-2 font-mono">
                        (Value: {String(error.invalidValue)})
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Toaster />

      <AlertDialog
        open={deviceToDelete}
        onOpenChange={(open) => {
          if (!open) setDeviceToDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this device? This action is
              irreversible!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDevice}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
