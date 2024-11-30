"use client";

import { useDevice } from "@/DeviceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import {
  DeviceFormData,
  DeviceValidateSchema,
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
import { Trash2 } from "lucide-react";
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
import FormErrors from "./FormErrors"; //

export function DeviceEditForm() {
  const { selectedDevice, setSelectedDevice, devices } = useDevice();
  const [registerToDelete, setRegisterToDelete] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
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
    console.log("Resetting: ", isSubmitting);
    if (selectedDevice && !isSubmitting) {
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
  }, [selectedDevice, reset, isSubmitting]);

  const onError = (errors: any) => {
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
      const response = await fetch(`/api/devices/${selectedDevice?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update device");
      }

      const updatedDevice = await response.json();
      console.log(updatedDevice);
      // You might want to refresh your devices list here as well
    } catch (error) {
      console.error("Error updating device:", error);
      // Handle error appropriately (e.g., show error message to user)
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Select a Device
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
          <FileUpload />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Device Information
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
