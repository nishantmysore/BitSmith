"use client";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DeviceWithRelations } from "@/types/device";
import { ReactNode } from "react";
import { ClockIcon, ArrowLeftRight, GitFork, Loader2 } from "lucide-react";
import { MemoryMap } from "./MemoryMap";
import RegisterList from "./RegisterList"; // Add this at the top with other imports
import useSWR from "swr";
import { preload } from "swr";

const SELECTED_DEVICE_KEY = "selectedDeviceId";

interface PropertyItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

// Memoize PropertyItem component since it's used multiple times
const PropertyItem = React.memo(({ icon, label, value }: PropertyItemProps) => (
  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20 transition-colors duration-200">
    <div className="text-muted-foreground">{icon}</div>
    <div className="min-w-0 flex-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  </div>
));
PropertyItem.displayName = "PropertyItem";

interface BasicDevice {
  id: string;
  name: string;
}

// Modify the fetcher to include more detailed logging
const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// Modify the prefetch function to include logging
const prefetchDevices = () => {
  preload("/api/devices/getdevices", fetcher);
};

// Add this configuration object
const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 3600000, // 1 hour
};

export const DeviceSelector = () => {
  // Add logging to the initial useEffect
  useEffect(() => {
    prefetchDevices();
  }, []);

  const {
    data: devicesData,
    isLoading: isLoadingDevices,
    error,
  } = useSWR<{ devices: BasicDevice[] }>("/api/devices", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
    loadingTimeout: 3000,
  });

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Keep the existing selectedDevice SWR hook
  const { data: selectedDevice, isLoading } = useSWR<DeviceWithRelations>(
    selectedDeviceId ? `/api/devices/${selectedDeviceId}` : null,
    fetcher,
    swrConfig,
  );

  // Check for saved device ID on mount
  useEffect(() => {
    const savedDeviceId = localStorage.getItem(SELECTED_DEVICE_KEY);
    if (savedDeviceId) {
      setSelectedDeviceId(savedDeviceId);
    }
  }, []);

  // Add a log in the selection handler
  const handleDeviceSelection = (value: string) => {
    setSelectedDeviceId(value);
    localStorage.setItem(SELECTED_DEVICE_KEY, value);
  };

  // Memoize the exportDevice function
  const exportDevice = React.useCallback((): void => {
    if (selectedDevice) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanObject = (obj: any): any => {
        return Object.fromEntries(
          Object.entries(obj).filter(([, value]) => value != null),
        );
      };

      const exportedDeviceObject = cleanObject({
        name: selectedDevice.name,
        description: selectedDevice.description,
        littleEndian: selectedDevice.littleEndian,
        isPublic: selectedDevice.isPublic,
        defaultClockFreq: selectedDevice.defaultClockFreq,
        version: selectedDevice.version,
        peripherals: selectedDevice.peripherals.map((peripheral) =>
          cleanObject({
            name: peripheral.name,
            description: peripheral.description,
            baseAddress: peripheral.baseAddress,
            size: peripheral.size,
            registers: peripheral.registers.map((register) =>
              cleanObject({
                name: register.name,
                description: register.description,
                width: register.width,
                addressOffset: register.addressOffset,
                resetValue: register.resetValue,
                resetMask: register.resetMask,
                readAction: register.readAction,
                writeAction: register.writeAction,
                modifiedWriteValues: register.modifiedWriteValues,
                isArray: register.isArray,
                arraySize: register.arraySize,
                arrayStride: register.arrayStride,
                namePattern: register.namePattern,
                access: register.access,
                fields: register.fields.map((field) =>
                  cleanObject({
                    name: field.name,
                    description: field.description,
                    access: field.access,
                    bitOffset: field.bitOffset,
                    bitWidth: field.bitWidth,
                    readAction: field.readAction,
                    writeAction: field.writeAction,
                    enumeratedValues: field.enumeratedValues.map((enumVal) =>
                      cleanObject({
                        name: enumVal.name,
                        value: enumVal.value,
                        description: enumVal.description,
                      }),
                    ),
                  }),
                ),
              }),
            ),
          }),
        ),
      });

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
  }, [selectedDevice]);

  // Memoize complex derived values
  const propertyItems = React.useMemo(() => {
    if (!selectedDevice) return [];

    return [
      selectedDevice.version && {
        icon: <GitFork />,
        label: "Version",
        value: `${selectedDevice.version}`,
      },
      selectedDevice.defaultClockFreq !== undefined &&
        selectedDevice.defaultClockFreq !== 0 && {
          icon: <ClockIcon />,
          label: "Clock Frequency",
          value: `${selectedDevice.defaultClockFreq ?? 0 / 1e6} MHz`,
        },
      selectedDevice.littleEndian && {
        icon: <ArrowLeftRight />,
        label: "Endianness",
        value: selectedDevice.littleEndian ? "Little" : "Big",
      },
    ].filter(Boolean);
  }, [selectedDevice]);

  // Memoize peripherals data for MemoryMap
  const memoryMapPeripherals = React.useMemo(() => {
    return (
      selectedDevice?.peripherals.map((peripheral) => ({
        name: peripheral.name,
        baseAddress: peripheral.baseAddress,
        size: peripheral.size,
        description: peripheral.description,
      })) ?? []
    );
  }, [selectedDevice?.peripherals]);

  return (
    <div className="w-full">
      <div className="text-xl font-semibold w-full">
        <div className="flex justify-between">
          Device Selection
          <Button onClick={exportDevice}> Export to JSON </Button>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        {/* Device Selection Section */}
        <div className="space-y-3">
          <Select
            value={selectedDeviceId ?? undefined}
            onValueChange={handleDeviceSelection}
            onOpenChange={(open) => {
              if (open) {
                prefetchDevices(); // Prefetch when dropdown is opened
              }
            }}
          >
            <SelectTrigger disabled={isLoadingDevices}>
              <SelectValue
                placeholder={isLoadingDevices ? "Loading..." : "Select device"}
              />
            </SelectTrigger>
            <SelectContent>
              {devicesData?.devices?.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Device Description */}
              {selectedDevice?.description && (
                <p className="text-lg text-muted-foreground">
                  {selectedDevice.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Configuration Controls */}
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {propertyItems.filter(Boolean).map((item, index) => (
              <PropertyItem key={index} {...(item as PropertyItemProps)} />
            ))}
          </div>
        </div>

        {selectedDevice?.peripherals && (
          <div className="mt-4">
            <MemoryMap peripherals={memoryMapPeripherals} />
          </div>
        )}
      </div>
      {selectedDevice && <RegisterList selectedDevice={selectedDevice} />}

      {error && (
        <div className="text-red-500">
          Error loading devices: {error.message}
        </div>
      )}
    </div>
  );
};
