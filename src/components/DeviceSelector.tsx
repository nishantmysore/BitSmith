"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDevice } from "../DeviceContext";

const isValidHex = (value: string): boolean => {
  // Allow empty input or partial hex values
  if (!value || value === "0x") return true;

  // Check if it's a valid hex format
  const hexRegex = /^0x[0-9A-Fa-f]{1,16}$/;
  return hexRegex.test(value);
};

const formatHexInput = (value: string): string => {
  // Remove any non-hex characters
  let cleaned = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();

  // Handle special cases
  if (!value.startsWith("0x")) {
    // If input doesn't start with 0x, add it
    cleaned = `0x${cleaned}`;
  } else {
    // If it starts with 0x, preserve it and clean the rest
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
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Device Selection
          </CardTitle>
          <Select
            value={selectedDevice?.id}
            onValueChange={(deviceId) => {
              const device = devices.find((d) => d.id === deviceId);
              if (device) setSelectedDevice(device);
            }}
          >
            <SelectTrigger className="w-[280px]">
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
        <div className="flex items-center justify-end gap-4">
          <Label htmlFor="base-addr-input">Base Address</Label>
          <div className="flex flex-col gap-1">
            <Input
              id="base-addr-input"
              className={`w-36 font-mono text-sm ${!isValid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              value={baseAddr}
              onChange={(e) => handleBaseAddrChange(e.target.value)}
              placeholder="0x00000000"
            />
            {!isValid && (
              <Alert variant="destructive" className="p-2">
                <AlertDescription className="text-xs">
                  Please enter a valid hex address (0x00000000 - 0xFFFFFFFF)
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Label htmlFor="offset-base-addr">Offset Registers</Label>
          <Switch
            id="offset-base-addr"
            checked={offsetBaseAddr}
            onCheckedChange={setOffsetBaseAddr}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
