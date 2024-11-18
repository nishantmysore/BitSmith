"use client"
import React from 'react';
import RegisterVisualizer from './RegisterVisualizer';
import { useDevice } from "@/DeviceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Device, Register, Field } from "@prisma/client";

// Type for the device with its relations
type DeviceWithRegisters = Device & {
  registers: (Register & {
    fields: Field[]
  })[];
};

// Type for the context
type DeviceContextType = {
  selectedDevice: DeviceWithRegisters | null;
};

const RegisterList = () => {
  // Update the useDevice hook to use the proper type
  const { selectedDevice } = useDevice() as DeviceContextType;

  if (!selectedDevice) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">No device selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {selectedDevice.registers.map((register) => (
        <RegisterVisualizer 
          key={register.id} // Using id instead of address for key is generally better
          register={register}
        />
      ))}
    </div>
  );
};

export default RegisterList;
