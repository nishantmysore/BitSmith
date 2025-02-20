"use client";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTheme } from "next-themes";
import { DeviceFormData, DeviceValidateSchema } from "@/types/validation";
import { Upload } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const ReactJsonView = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

interface DeviceEditFormProps {
  newDevice?: boolean;
}

export function DeviceEditForm({ newDevice = false }: DeviceEditFormProps) {
  const { toast } = useToast();
  const [data, setData] = useState<DeviceFormData | null>(null);
  const { theme } = useTheme();
  console.log(theme)
  const [isUploading, setIsUploading] = useState(false);

  const handleJsonChange = (updatedSrc: DeviceFormData) => {
    setData(updatedSrc);
  };

  interface ValidationErrorDetail {
    path: (string | number)[];
    message: string;
    /* eslint-disable @typescript-eslint/no-explicit-any */
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

    const result = DeviceValidateSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
        invalidValue:
          issue.path.length > 0
            ? /* eslint-disable @typescript-eslint/no-explicit-any */
              issue.path.reduce((obj, key) => (obj as any)?.[key], data)
            : undefined,
        friendlyPath: getFriendlyErrorPath(issue.path, data),
      }));
      setValidationErrors(formattedErrors);
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/device-upload", {
        method: newDevice ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update device");
      }

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
    } finally {
      setIsUploading(false);
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
                ? issue.path.reduce((obj, key) => (obj as any)?.[key], jsonData)
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
        setData(jsonData);

        toast({
          title: "Success",
          description: "Configuration file loaded successfully!",
        });
        
        // Scroll to bottom after a short delay to ensure content is rendered
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      } catch {
        toast({
          title: "Error",
          description: "Failed to parse the JSON file",
          variant: "destructive",
        });
      }
    };

    // Trigger the file input click
    fileInput.click();
  };

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
            <Button onClick={onSubmit} disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
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
      <Toaster />
    </div>
  );
}
