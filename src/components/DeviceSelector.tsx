"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDevice } from "../DeviceContext";
import { Button } from "@/components/ui/button";

export const DeviceSelector = () => {
  const {
    selectedDevice,
    setSelectedDevice,
    devices,
  } = useDevice();

  const exportDevice = (): void => {
    if (selectedDevice) {
      const exportedDeviceObject = {
        name: selectedDevice.name,
        description: selectedDevice.description,
        littleEndian: selectedDevice.littleEndian,
        isPublic: selectedDevice.isPublic,
        defaultClockFreq: selectedDevice.defaultClockFreq,
        version: selectedDevice.version,
        peripherals: selectedDevice.peripherals.map(
          (peripheral) => ({
            name: peripheral.name,
            description: peripheral.description,
            baseAddress: peripheral.baseAddress,
            size: peripheral.size,
            registers: peripheral.registers.map((register) => ({
              name: register.name,
              description: register.description,
              width: register.width,
              addressOffset: register.addressOffset,
              resetValue: register.resetValue,
              resetMask: register.resetMask,
              readAction: register.addressOffset,
              writeAction: register.writeAction,
              modifiedWriteValues: register.modifiedWriteValues,
              isArray: register.isArray,
              arraySize: register.arraySize,
              arrayStride: register.arrayStride,
              namePattern: register.namePattern,
              access: register.access,
              fields: register.fields.map((field) => ({
                name: field.name,
                description: field.description,
                access: field.access,
                bitOffset: field.bitOffset,
                bitWidth: field.bitWidth,
                readAction: field.readAction,
                writeAction: field.writeAction,
                enumeratedValues: field.enumeratedValues.map((enumVal) => ({
                  name: enumVal.name,
                  value: enumVal.value,
                  description: enumVal.description,
                })),
              })),
            })),
          }),
        ),
      };

      // Export the object
      const jsonString = JSON.stringify(exportedDeviceObject, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${exportedDeviceObject.name.toLowerCase().replace(/\s+/g, "_")}_device.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="mb-4 px-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <div className="flex justify-between">
            Device Selection
            <Button onClick={exportDevice}> Export to JSON </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Selection Section */}
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

          {/* Device Description */}
          {selectedDevice?.description && (
            <p className="text-sm text-muted-foreground">
              {selectedDevice.description}
            </p>
          )}
        </div>

        {/* Configuration Controls */}
        <div className="space-y-4">
          {/* Base Address Input */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="base-addr-input">Base Address</Label>
            <div className="flex justify-between">
              <div className="flex items-center space-x-4">
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
