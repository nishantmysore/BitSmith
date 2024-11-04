"use client"
import React from 'react';
import RegisterVisualizer from './RegisterVisualizer';
import { useDevice } from "@/DeviceContext";
import { Card, CardContent } from "@/components/ui/card";

const RegisterList = () => {
  const { selectedDevice } = useDevice();

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
      {Object.values(selectedDevice.registers).map((register) => (
        <RegisterVisualizer 
          key={register.address} 
          register={register} 
        />
      ))}
    </div>
  );
};

export default RegisterList;
