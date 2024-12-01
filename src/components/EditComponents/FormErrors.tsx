import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FieldErrors } from "react-hook-form";
import { DeviceFormData } from "@/types/validation";

interface FormErrorProps {
  errors: FieldErrors<DeviceFormData>;
  title?: string;
}

const getErrorPath = (path: string[]): string => {
  if (path.length === 0) return "";

  // Handle array indices for registers and fields
  const formattedPath = path.map((segment, index) => {
    const nextSegment = path[index + 1];

    // Check if we're dealing with registers array
    if (segment === "registers" && !isNaN(Number(nextSegment))) {
      return `Register ${Number(nextSegment) + 1}`;
    }
    // Check if we're dealing with fields array
    if (segment === "fields" && !isNaN(Number(nextSegment))) {
      return `Field ${Number(nextSegment) + 1}`;
    }
    // Skip numeric indices as they've been handled
    if (!isNaN(Number(segment))) {
      return "";
    }
    // Format regular path segments
    return segment.replace(/([A-Z])/g, " $1").toLowerCase();
  });

  return formattedPath.filter(Boolean).join(" → ");
};

const flattenErrors = (
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  errors: Record<string,any>,
  path: string[] = [],
): { message: string; path: string }[] => {
  let result: { message: string; path: string }[] = [];

  for (const [key, value] of Object.entries(errors)) {
    const currentPath = [...path, key];

    if (value && typeof value === "object") {
      if ("message" in value) {
        // This is a Zod error
        result.push({
          message: value.message as string,
          path: getErrorPath(currentPath),
        });
      } else if (Array.isArray(value)) {
        // Handle array errors (e.g., registers array)
        value.forEach((item, index) => {
          if (item && typeof item === "object") {
            result = result.concat(
              flattenErrors(item, [...currentPath, index.toString()]),
            );
          }
        });
      } else {
        // Recursive case for nested objects
        result = result.concat(flattenErrors(value, currentPath));
      }
    } else if (typeof value === "string") {
      // Direct error message
      result.push({
        message: value,
        path: getErrorPath(currentPath),
      });
    }
  }

  return result;
};

const FormErrors = ({
  errors,
  title = "Submission Errors",
}: FormErrorProps) => {
  const errorMessages = flattenErrors(errors);

  if (errorMessages.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="mb-2">{title}</AlertTitle>
      <AlertDescription>
        <ScrollArea className="max-h-48 w-full rounded-md">
          <ul className="list-disc pl-4 space-y-2">
            {errorMessages.map((error, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{error.path}: </span>
                {error.message}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </AlertDescription>
    </Alert>
  );
};

export default FormErrors;
