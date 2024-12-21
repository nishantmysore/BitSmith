"use client";

import { useDevice } from "@/DeviceContext";
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
import { useState} from "react";

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface DeviceEditFormProps {
  newDevice?: boolean;
}

export function DeviceEditForm({ newDevice = false }: DeviceEditFormProps) {
  const { selectedDevice, setSelectedDevice, devices, refreshDevices } =
    useDevice();
  const [deviceToDelete, setDeviceToDelete] = useState<boolean>(false);
  const { toast } = useToast();


  const onSubmit = async (data: DeviceFormData) => {

    console.log(data);
    try {
      const response = await fetch(
        newDevice
          ? "/api/device-upload/"
          : `/api/devices/${selectedDevice?.id}`,
        {
          method: newDevice ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update device");
      }

      await response.json();

      toast({
        title: "Success",
        description: "Device updated successfully!",
      });
      await refreshDevices();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating device:", error);
      toast({
        title: "Error Updating Device",
        description: "There was an error updating the device: " + error,
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
                    fieldEnums:
                      field.fieldEnums?.map((fieldEnum: FieldEnumFormData) => ({
                        ...fieldEnum,
                        status: "added",
                      })) || [],
                  })) || [],
              })) || [],
          }),
        );

        // Validate the JSON data against your schema
        const result = DeviceValidateSchema.safeParse(jsonData);

        if (!result.success) {
          toast({
            title: "Invalid configuration",
            description: "The uploaded file does not match the expected format",
            variant: "destructive",
          });
          console.error("Validation errors:", result.error);
          return;
        }

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
        console.error("Error processing file:", error);
      }
    };

    // Trigger the file input click
    fileInput.click();
  };

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

  return (
    <div className="space-y-6">
      {!newDevice && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              <div className="flex justify-between">
                Select a Device
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeviceToDelete(true);
                  }}
                >
                  {" "}
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Select
                value={selectedDevice?.id}
                onValueChange={(deviceId) => {
                  const device = devices.find((d) => d.id === deviceId);
                  if (device) setSelectedDevice(device);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
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
        
        <Button> Upload </Button>
        </CardContent>
      </Card>

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
