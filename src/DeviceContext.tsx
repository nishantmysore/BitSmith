"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { Device, Register, AccessType } from "@prisma/client";

type DeviceWithRelations = Device & {
  registers: (Register & {
    fields: {
      id: string;
      name: string;
      bits: string;
      access: AccessType;
      description: string;
    }[];
  })[];
};

type DeviceContextType = {
  devices: DeviceWithRelations[];
  selectedDevice: DeviceWithRelations | null;
  setSelectedDevice: (device: DeviceWithRelations) => void;
  getRegisterByAddress: (address: string) => Register | null;
  loading: boolean;
  error: string | null;
  baseAddr: string;
  setBaseAddr: (addr: string) => void;
  offsetBaseAddr: boolean;
  setOffsetBaseAddr: (offset: boolean) => void;
  refreshDevices: () => Promise<void>; // New function to force refresh
};

const CACHE_KEY = 'deviceData';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

type CachedData = {
  timestamp: number;
  devices: DeviceWithRelations[];
};

const DeviceContext = createContext<DeviceContextType | null>(null);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [devices, setDevices] = useState<DeviceWithRelations[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseAddr, setBaseAddr] = useState("");
  const [offsetBaseAddr, setOffsetBaseAddr] = useState(false);

  const fetchDevices = async () => {
    try {
      console.log("Fetching fresh devices data");
      const response = await fetch("/api/devices");
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      const data = await response.json();
      
      // Store in cache
      const cacheData: CachedData = {
        timestamp: Date.now(),
        devices: data
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      return data;
    } catch (err) {
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
    const initializeDevices = async () => {
      try {
        // Try to get cached data
        const cachedDataStr = localStorage.getItem(CACHE_KEY);
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
  }, []);

  useEffect(() => {
    if (selectedDevice?.base_address) {
      setBaseAddr(selectedDevice.base_address);
    }
  }, [selectedDevice]);

  const getRegisterByAddress = (address: string): Register | null => {
    if (!selectedDevice) return null;
    return selectedDevice.registers.find(
      (register) => register.address === address,
    ) || null;
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
        baseAddr,
        setBaseAddr,
        offsetBaseAddr,
        setOffsetBaseAddr,
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
