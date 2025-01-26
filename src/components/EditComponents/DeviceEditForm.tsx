"use client";
import ReactJsonView from "@microlink/react-json-view";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTheme } from "next-themes";
import {
  DeviceFormData,
  DeviceValidateSchema,
  RegisterValidateSchema,
  FieldValidateSchema,
  PeripheralValidateSchema,
  FieldEnumValidateSchema,
} from "@/types/validation";
import { Upload } from "lucide-react";
import { useState } from "react";
import { SchemaDoc } from "./SchemaDocs";

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface DeviceEditFormProps {
  newDevice?: boolean;
}

const lightTheme = {
  base00: "#ffffff",
  base01: "#e5e5e5",
  base02: "#f3f3f3",
  base03: "#767676",
  base04: "#1a1a1a",
  base05: "#0a0a0a",
  base06: "#fafafa",
  base07: "#f3f3f3",
  base08: "#d62424",
  base09: "#ff9e45",
  base0A: "#f1c15a",
  base0B: "#28a745",
  base0C: "#165478",
  base0D: "#1a1a1a",
  base0E: "#d76262",
  base0F: "#242424",
};

const darkTheme = {
  base00: "#09090b", //background
  base01: "#09090b", //card
  base02: "#FFFFFF", //muted
  base03: "#fafafa", //secondary
  base04: "#fafafa", //border
  base05: "#fafafa", //foreground
  base06: "#fafafa", //primary
  base07: "#fafafa", //brightest-foreground
  base08: "#7f1d1d", //destructive
  base09: "#27272a", //accent
  base0A: "#FFFFFF",
  base0B: "#FFFFFF",
  base0C: "#FFFFFF",
  base0D: "#FFFFFF",
  base0E: "#e23670",
  base0F: "#FFFFFF",
};

export function DeviceEditForm({ newDevice = false }: DeviceEditFormProps) {
  const { toast } = useToast();
  const [data, setData] = useState<DeviceFormData | null>(null);
  const { theme } = useTheme();

  const handleJsonChange = (updatedSrc: DeviceFormData) => {
    setData(updatedSrc);
  };

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
    console.log(data);

    const result = DeviceValidateSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
        invalidValue:
          issue.path.length > 0
            ? issue.path.reduce((obj, key) => obj?.[key], data)
            : undefined,
        friendlyPath: getFriendlyErrorPath(issue.path, data),
      }));
      console.log(formattedErrors);
      setValidationErrors(formattedErrors);
    }
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
          console.log(formattedErrors);
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
        <CardContent>
          <div className="w-full">
            {/* JsonView takes the full width */}
            <ReactJsonView
              src={data ?? {}}
              theme={
                theme === "dark" ? "shapeshifter" : "shapeshifter:inverted"
              }
              style={{
                backgroundColor: theme === "dark" ? "#09090b" : "#ffffff",
              }}
              onEdit={({ updated_src }) =>
                handleJsonChange(updated_src as DeviceFormData)
              }
              onAdd={({ updated_src }) =>
                handleJsonChange(updated_src as DeviceFormData)
              }
              onDelete={({ updated_src }) =>
                handleJsonChange(updated_src as DeviceFormData)
              }
              name={"Device"}
              collapseStringsAfterLength={100}
              collapsed={4}
            />
          </div>
          {/* Button below the JsonView */}
          <div className="flex justify-center mt-4">
            <Button onClick={onSubmit}>Upload</Button>
          </div>
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
      <div className="space-y-8">
        <SchemaDoc schema={DeviceValidateSchema} title="Device Schema" />
        <SchemaDoc
          schema={PeripheralValidateSchema}
          title="Peripheral Schema"
        />
        <SchemaDoc schema={RegisterValidateSchema} title="Register Schema" />
        <SchemaDoc schema={FieldValidateSchema} title="Field Schema" />
        <SchemaDoc schema={FieldEnumValidateSchema} title="Field Enum Schema" />
      </div>
      <Toaster />
    </div>
  );
}
