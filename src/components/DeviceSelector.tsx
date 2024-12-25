"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDevice } from "../DeviceContext";
import { Button } from "@/components/ui/button";
import { DeviceWithRelations } from "@/types/device";
import { ReactNode } from "react";
import { ClockIcon, FolderLock, GitFork } from "lucide-react";
import { MemoryMap } from "./MemoryMap";

interface PropertyItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

const PropertyItem = ({ icon, label, value }: PropertyItemProps) => (
  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20 transition-colors duration-200">
    <div className="text-muted-foreground">{icon}</div>
    <div className="min-w-0 flex-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  </div>
);

export const DeviceSelector = () => {
  const {
    selectedDevice,
    setSelectedDevice,
    devices,
  }: {
    selectedDevice: DeviceWithRelations | null;
    setSelectedDevice: (device: DeviceWithRelations) => void;
    devices: DeviceWithRelations[];
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
        peripherals: selectedDevice.peripherals.map((peripheral) => ({
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
        })),
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
    <div>
      <div className="text-xl font-semibold">
        <div className="flex justify-between">
          Device Selection
          <Button onClick={exportDevice}> Export to JSON </Button>
        </div>
      </div>
      <div className="space-y-6 mt-4">
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
              {devices?.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Device Description */}
          {selectedDevice?.description && (
            <p className="text-lg text-muted-foreground">
              {selectedDevice.description}
            </p>
          )}
        </div>

        {/* Configuration Controls */}
        <div className="space-y-4">
          {/* Base Address Input */}
          <div className="flex flex-col space-y-2">
            {
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {selectedDevice?.version !== undefined && (
                  <PropertyItem
                    icon={<GitFork />}
                    label="Version"
                    value={`${selectedDevice?.version}`}
                  />
                )}
                <PropertyItem
                  icon={<ClockIcon />}
                  label="Clock Frequency"
                  value={`${(selectedDevice?.defaultClockFreq ?? 0) / 1e6} MHz`}
                />
                <PropertyItem
                  icon={<FolderLock />}
                  label="Public"
                  value={`${selectedDevice?.isPublic}` ? "Yes" : "No"}
                />
              </div>
            }
          </div>
        </div>
        {selectedDevice && selectedDevice.peripherals && (
          <div className="mt-4">
            <MemoryMap
              peripherals={selectedDevice.peripherals.map((peripheral) => ({
                name: peripheral.name,
                baseAddress: peripheral.baseAddress, // Already BigInt
                size: peripheral.size, // Already BigInt
                description: peripheral.description,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
