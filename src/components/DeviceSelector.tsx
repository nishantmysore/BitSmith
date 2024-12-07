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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDevice } from "../DeviceContext";
import { Button } from "@/components/ui/button";
import { Register, Field, AccessType } from "@prisma/client";

type FieldExport = {
  name: string;
  description: string;
  bits: string;
  access: AccessType;
};

type RegisterWithFields = Register & {
  fields: {
    name: string;
    description: string;
    bits: string;
    access: AccessType;
  }[];
};

// Hex validation functions remain the same
const isValidHex = (value: string): boolean => {
  if (!value || value === "0x") return true;
  const hexRegex = /^0x[0-9A-Fa-f]{1,16}$/;
  return hexRegex.test(value);
};

const formatHexInput = (value: string): string => {
  let cleaned = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  if (!value.startsWith("0x")) {
    cleaned = `0x${cleaned}`;
  } else {
    cleaned = `0x${value
      .slice(2)
      .replace(/[^0-9A-Fa-f]/g, "")
      .toUpperCase()}`;
  }
  return cleaned;
};

export const DeviceSelector = () => {
  const {
    selectedDevice,
    setSelectedDevice,
    devices,
    baseAddr,
    setBaseAddr,
    offsetBaseAddr,
    setOffsetBaseAddr,
  } = useDevice();

  const [isTouched, setIsTouched] = React.useState(false);
  const isValid = !isTouched || isValidHex(baseAddr);

  const handleBaseAddrChange = (value: string) => {
    setIsTouched(true);
    const formattedValue = formatHexInput(value);
    setBaseAddr(formattedValue);
  };

  const exportDevice = (): void => {
    if (selectedDevice) {
      const exportedDeviceObject = {
        name: selectedDevice.name,
        description: selectedDevice.description,
        base_address: selectedDevice.base_address,
        isPublic: selectedDevice.isPublic,
        registers: selectedDevice.registers.map(
          (register: RegisterWithFields) => ({
            name: register.name,
            description: register.description,
            address: register.address,
            width: register.width.toString(),
            fields: register.fields.map((field: FieldExport) => ({
              name: field.name,
              description: field.description,
              bits: field.bits,
              access: field.access,
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
                <Input
                  id="base-addr-input"
                  className={`w-36 font-mono text-sm ${
                    !isValid ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  value={baseAddr}
                  onChange={(e) => handleBaseAddrChange(e.target.value)}
                  placeholder="0x00000000"
                />
                {/* Offset Registers Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="offset-base-addr"
                    checked={offsetBaseAddr}
                    onCheckedChange={setOffsetBaseAddr}
                  />
                  <Label htmlFor="offset-base-addr">
                    Offset Registers by Base Address
                  </Label>
                </div>
              </div>
            </div>
            {!isValid && (
              <p className="text-xs text-red-500">
                Please enter a valid hex address (0x00000000 - 0xFFFFFFFF)
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
