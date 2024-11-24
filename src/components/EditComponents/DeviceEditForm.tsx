"use client";

import { useDevice } from "@/DeviceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export function DeviceEditForm() {
  const { selectedDevice, setSelectedDevice, devices } = useDevice();

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

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "registers",
  });

  const handleRegisterChange = (index: number) => {
    const register = fields[index];
    if (register.status === "unchanged") {
      update(index, { ...register, status: "modified" as Status });
    }
  };

  const handleRegisterRemove = (index: number) => {
    const register = fields[index];
    if (register.id) {
      // If it exists in database, mark as deleted instead of removing
      update(index, { ...register, status: "deleted" as Status });
    } else {
      // If it's new, just remove it
      remove(index);
    }
  };

  const handleRegisterAdd = () => {
    append({
      name: "",
      description: "",
      width: "32",
      address: "",
      status: "added" as Status,
    });
  };

  // Reset form when selectedDevice changes
  useEffect(() => {
    if (selectedDevice) {
      reset({
        name: selectedDevice.name,
        description: selectedDevice.description,
        base_address: selectedDevice.base_address,
        isPublic: selectedDevice.isPublic,
      });
    }
  }, [selectedDevice, reset]);

  const onError = (errors: any) => {
    console.log("Submit Error:", errors);
  };

  const onSubmit = async (data: DeviceFormData) => {
    console.log(data)
    try {
      const response = await fetch(`/api/devices/${selectedDevice?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update device");
      }

      const updatedDevice = await response.json();
      // Update your local state/context with the updated device
      setSelectedDevice(updatedDevice);
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
            <form onSubmit={handleSubmit(onSubmit,onError)}>
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
                  {fields.map(
                    (field: any, index: number) =>
                      field.status !== "deleted" && (
                        <RegisterEditForm
                          key={field.id || index}
                          index={index}
                          register={register}
                          onChanged={() => handleRegisterChange(index)}
                          onRemove={() => handleRegisterRemove(index)}
                        />
                      ),
                  )}

                  <Button type="button" onClick={handleRegisterAdd}>
                    Add Register
                  </Button>
                </CardContent>
              </Card>
              <div className="flex justify-center">
                <Button type="submit">Update Device</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
