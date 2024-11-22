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

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Device Selection
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
                <Label htmlFor="offset-base-addr">Offset Registers</Label>
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
