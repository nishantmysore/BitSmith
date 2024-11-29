"use client";
import React from "react";
import RegisterVisualizer from "./RegisterVisualizer";
import { useDevice } from "@/DeviceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Device, Register, Field } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type for the device with its relations
type DeviceWithRegisters = Device & {
  registers: (Register & {
    fields: Field[];
  })[];
};

// Type for the context
type DeviceContextType = {
  selectedDevice: DeviceWithRegisters | null;
  baseAddr: string;
  offsetBaseAddr: boolean;
};

const RegisterList = () => {
  // Update the useDevice hook to use the proper type
  const { selectedDevice, baseAddr, offsetBaseAddr } =
    useDevice() as DeviceContextType;

  if (!selectedDevice) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">
            No device selected
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea>
        {" "}
        {/* Add this line */}
        {selectedDevice.registers.map((register) => (
          <RegisterVisualizer
            key={register.id} // Using id instead of address for key is generally better
            register={register}
            baseAddr={baseAddr}
            offsetBaseAddr={offsetBaseAddr}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

export default RegisterList;
