"use client";

import { useDevice } from "@/DeviceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldErrors } from "react-hook-form";
import {
  DeviceFormData,
  DeviceValidateSchema,
  FieldFormData,
  RegisterFormData,
  Status,
} from "@/types/validation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DeviceFormField from "./DeviceFormField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import RegisterEditForm from "./RegisterEditForm";
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
import { useState, MouseEvent } from "react";

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import FormErrors from "./FormErrors"; //

interface DeviceEditFormProps {
  newDevice?: boolean;
}

export function DeviceEditForm({ newDevice = false }: DeviceEditFormProps) {
  const { selectedDevice, setSelectedDevice, devices, refreshDevices } =
    useDevice();
  const [registerToDelete, setRegisterToDelete] = useState<number | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<boolean>(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(DeviceValidateSchema),
    defaultValues: {
      name: "",
      description: "",
      base_address: "",
      isPublic: false,
      registers: [],
    },
  });

  const handleDelete = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    setRegisterToDelete(index);
  };

  const handleConfirmDelete = () => {
    if (registerToDelete === null) return;

    const registerIndex = registerToDelete;
    const register = fields[registerIndex];

    if (!register) {
      console.error("Register not found");
      setRegisterToDelete(null);
      return;
    }

    // If register has an ID, it exists in database
    if (register.db_id) {
      update(registerIndex, {
        ...register,
        status: "deleted" as Status,
      });
    } else {
      // For new registers, remove them completely
      remove(registerIndex);
    }

    setRegisterToDelete(null);
  };

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "registers",
  });

  const handleRegisterChange = (index: number) => {
    console.log("Handling register Change: ", fields[index]);
    const register = fields[index];
    if (register.status === "unchanged") {
      update(index, { ...register, status: "modified" as Status });
    }
  };

  const handleRegisterAdd = () => {
    append({
      name: "",
      description: "",
      width: "32",
      address: "",
      status: "added" as Status,
      fields: [],
    });
  };

  // Reset form when selectedDevice changes
  useEffect(() => {
    if (newDevice) {
      reset({
        name: "",
        description: "",
        base_address: "",
        isPublic: false,
        registers: [],
      });
    } else if (selectedDevice) {
      const formData = {
        name: selectedDevice.name,
        description: selectedDevice.description,
        base_address: selectedDevice.base_address,
        isPublic: selectedDevice.isPublic,
        registers: selectedDevice.registers.map((reg) => ({
          db_id: reg.id,
          name: reg.name,
          description: reg.description,
          width: reg.width.toString(),
          address: reg.address,
          status: "unchanged" as Status,
          fields: reg.fields.map((field) => ({
            db_id: field.id,
            name: field.name,
            description: field.description,
            bits: field.bits,
            access: field.access,
            status: "unchanged" as Status,
          })),
        })),
      };

      reset(formData);
    }
  }, [selectedDevice, reset, newDevice]);

  const onError = (errors: FieldErrors<DeviceFormData>) => {
    toast({
      title: "Error Updating Device",
      description: "There was an error updating the device",
      variant: "destructive",
    });
    console.log("Submit Error:", errors);
  };

  const onSubmit = async (data: DeviceFormData) => {
    const transformedData = {
      ...data,
      registers: data.registers?.map((register) => {
        // Keep existing status for added/deleted registers
        if (register.status === "added" || register.status === "deleted") {
          return register;
        }

        // Find the original register from selectedDevice
        const originalRegister = selectedDevice?.registers.find(
          (r) => r.id === register.db_id,
        );

        // Check if register was actually modified
        const isModified =
          register.db_id &&
          (register.name !== originalRegister?.name ||
            register.description !== originalRegister?.description ||
            register.width !== originalRegister?.width.toString() ||
            register.address !== originalRegister?.address);

        return {
          ...register,
          status: isModified ? "modified" : "unchanged",
          fields: register.fields?.map((field) => {
            if (field.status === "added" || field.status === "deleted") {
              return field;
            }

            // Find original field
            const originalField = originalRegister?.fields.find(
              (f) => f.id === field.db_id,
            );

            // Check if field was modified
            const isFieldModified =
              field.db_id &&
              (field.name !== originalField?.name ||
                field.description !== originalField?.description ||
                field.bits !== originalField?.bits ||
                field.access !== originalField?.access);

            return {
              ...field,
              status: isFieldModified ? "modified" : "unchanged",
            };
          }),
        };
      }),
    };

    console.log(transformedData);
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
          body: JSON.stringify(newDevice ? data : transformedData),
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
        jsonData.registers = jsonData.registers.map(
          (register: RegisterFormData) => ({
            ...register,
            status: "added",
            fields:
              register.fields?.map((field: FieldFormData) => ({
                ...field,
                status: "added",
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

        // Transform the data to match your form structure
        const formData: DeviceFormData = {
          name: jsonData.name || "",
          description: jsonData.description || "",
          base_address: jsonData.base_address || "",
          isPublic: jsonData.isPublic || false,
          registers: (jsonData.registers || []).map(
            (register: RegisterFormData) => ({
              name: register.name || "",
              description: register.description || "",
              width: register.width?.toString() || "32",
              address: register.address || "",
              status: register.status,
              fields: (register.fields || []).map((field: FieldFormData) => ({
                name: field.name || "",
                description: field.description || "",
                bits: field.bits || "",
                access: field.access || "RW",
                status: register.status,
              })),
            }),
          ),
        };

        // Reset the form with the new data
        reset(formData);
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
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <FormErrors errors={errors} />
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="grid gap-6 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name</Label>
                  <DeviceFormField
                    type="text"
                    placeholder="Device Name"
                    name="name"
                    register={register}
                    error={errors.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Device Description</Label>
                  <DeviceFormField
                    type="text"
                    placeholder="Device Description"
                    name="description"
                    register={register}
                    error={errors.description}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_address">Base Address</Label>
                  <DeviceFormField
                    type="text"
                    placeholder="0x00000000"
                    name="base_address"
                    register={register}
                    error={errors.base_address}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isPublic" className="text-sm font-medium">
                    Public
                  </Label>
                  <Switch
                    id="isPublic"
                    {...register("isPublic")}
                    checked={watch("isPublic")}
                    onCheckedChange={(checked) => setValue("isPublic", checked)}
                  />
                </div>
              </div>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Registers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full border rounded-lg p-4"
                  >
                    {fields.map(
                      (field, index) =>
                        field.status !== "deleted" && (
                          <AccordionItem
                            key={field.id || index}
                            value={`register-${index}`}
                          >
                            <div className="flex items-center justify-between">
                              <AccordionTrigger className="flex-1 text-xl">
                                {index + 1}.{" "}
                                {watch(`registers.${index}.name`) ||
                                  "New Register"}
                              </AccordionTrigger>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => handleDelete(e, index)}
                                className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            </div>
                            <AccordionContent>
                              <RegisterEditForm
                                key={field.id || index}
                                index={index}
                                register={register}
                                control={control}
                                onChanged={() => handleRegisterChange(index)}
                                errors={errors.registers?.[index]}
                                watch={watch}
                                setValue={setValue}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        ),
                    )}
                  </Accordion>
                  <div className="flex justify-end">
                    <Button type="button" onClick={handleRegisterAdd}>
                      Add Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-center">
                <Button type="submit">Update Device</Button>
              </div>
            </form>
          </div>
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

      <AlertDialog
        open={registerToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRegisterToDelete(null);
        }}
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
}
