'use client';

import React, { createContext, useContext, useState } from 'react';
import { Device } from './device';
import { deviceConfigs } from './devices';

type DeviceContextType = {
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device) => void;
  getRegisterByAddress: (address: string) => [string, Device['registers'][string]] | null;
};

const DeviceContext = createContext<DeviceContextType | null>(null);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with the first device in the config
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(
    deviceConfigs.length > 0 ? deviceConfigs[0] : null
  );

  const getRegisterByAddress = (address: string): [string, Device['registers'][string]] | null => {
    if (!selectedDevice) return null;
    
    const entry = Object.entries(selectedDevice.registers).find(
      ([_, register]) => register.address === address
    );
    
    return entry || null;
  };

  return (
    <DeviceContext.Provider value={{ selectedDevice, setSelectedDevice, getRegisterByAddress }}>
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
