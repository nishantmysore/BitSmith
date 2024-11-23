"use client";

import { useDevice } from "@/DeviceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { DeviceFormData, DeviceValidateSchema } from "@/types/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DeviceFormField from "./DeviceFormField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DeviceEditForm() {
  const { selectedDevice, setSelectedDevice, devices } = useDevice();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    setError,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(DeviceValidateSchema),
    defaultValues: {
      name: "",
      description: "",
      base_address: "",
      isPublic: false,
    }
  });

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

  const onSubmit = async (data: DeviceFormData) => {
    console.log("SUCCESS", data);
  };

  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Device Selection
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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                  <Label
                    htmlFor="isPublic"
                    className="text-sm font-medium"
                  >
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
