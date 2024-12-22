"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { Register } from "@prisma/client";
import { useSession } from "next-auth/react";
import { CACHE_KEY, CACHE_DURATION } from "@/utils/cache";
import { DeviceWithRelations, CachedData } from "./types/device";

type DeviceContextType = {
  devices: DeviceWithRelations[];
  selectedDevice: DeviceWithRelations | null;
  setSelectedDevice: (device: DeviceWithRelations) => void;
  getRegisterByAddress: (
    peripheralId: string,
    offset: BigInt,
  ) => Register | null;
  loading: boolean;
  error: string | null;
  refreshDevices: () => Promise<void>; // New function to force refresh
};

const DeviceContext = createContext<DeviceContextType | null>(null);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [devices, setDevices] = useState<DeviceWithRelations[]>([]);
  const [selectedDevice, setSelectedDevice] =
    useState<DeviceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  console.log("session is: ", session);

  const fetchDevices = async () => {
    try {
      console.log("Fetching fresh devices data");
      const response = await fetch("/api/devices");

      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch devices");
      }

      // Call json() only once and match the property name from backend
      const { devices } = await response.json();

      console.log("GOT DEVICES", devices);

      // Store in cache
      const cacheData: CachedData = {
        timestamp: Date.now(),
        devices, // Now using the correct devices array
      };
      localStorage.setItem(
        CACHE_KEY(session.user.id),
        JSON.stringify(cacheData),
      );

      return devices;
    } catch (err) {
      console.error("Error fetching devices:", err);
      throw err;
    }
  };

  const refreshDevices = async () => {
    setLoading(true);
    try {
      const data = await fetchDevices();
      setDevices(data);
      if (data.length > 0 && !selectedDevice) {
        setSelectedDevice(data[0]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const initializeDevices = async () => {
      try {
        // Try to get cached data
        const cachedDataStr = localStorage.getItem(CACHE_KEY(session.user.id));
        if (cachedDataStr) {
          const cachedData: CachedData = JSON.parse(cachedDataStr);

          // Check if cache is still valid
          if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
            console.log("Using cached devices data");
            setDevices(cachedData.devices);
            if (cachedData.devices.length > 0 && !selectedDevice) {
              setSelectedDevice(cachedData.devices[0]);
            }
            setLoading(false);
            return;
          }
        }

        // If no cache or cache expired, fetch fresh data
        const data = await fetchDevices();
        setDevices(data);
        if (data.length > 0 && !selectedDevice) {
          setSelectedDevice(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    initializeDevices();
  }, [session]);

  const getRegisterByAddress = (
    peripheralId: string,
    offset: BigInt,
  ): Register | null => {
    if (!selectedDevice) return null;
    const peripheral = selectedDevice.peripherals.find(
      (p) => p.id === peripheralId,
    );
    if (!peripheral) return null;

    return (
      peripheral.registers.find(
        (register) => register.addressOffset === offset,
      ) || null
    );
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        selectedDevice,
        setSelectedDevice,
        getRegisterByAddress,
        loading,
        error,
        refreshDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
};
