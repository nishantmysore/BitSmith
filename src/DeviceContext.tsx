'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Device, Register, AccessType} from '@prisma/client';

// Extended types to include nested relations
type DeviceWithRelations = Device & {
  registers: (Register & {
    fields: {
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
};

const DeviceContext = createContext<DeviceContextType | null>(null);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<DeviceWithRelations[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseAddr, setBaseAddr] = useState('');
  const [offsetBaseAddr, setOffsetBaseAddr] = useState(false);

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        const data = await response.json();
        console.log(data)
        setDevices(data);
        // Set the first device as selected if we have devices and no device is selected
        if (data.length > 0 && !selectedDevice) {
          setSelectedDevice(data[0]);
        }
        setError(null);
        if (selectedDevice?.base_address) {
          setBaseAddr(selectedDevice.base_address);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [selectedDevice]);

  const getRegisterByAddress = (address: string): Register | null => {
    if (!selectedDevice) return null;
    
    return selectedDevice.registers.find(
      register => register.address === address
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
        setOffsetBaseAddr
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
