"use client";
import React from "react";
import RegisterVisualizer from "./RegisterVisualizer";
import { useDevice } from "@/DeviceContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/Table/DataTable";
import { columns } from "@/components/Table/TableColumns";
import { convertToHexString } from "@/utils/validation";

const RegisterList = () => {
  // Update the useDevice hook to use the proper type
  const { selectedDevice } = useDevice();

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
    <div className="space-y-4 py-10">
      <Separator />
      <h1 className="text-xl font-semibold px-2 pt-10">Register List</h1>
      <ScrollArea>
        <div className="px-2">
          <DataTable
            columns={columns}
            data={selectedDevice.peripherals.flatMap((peripheral) =>
              peripheral.registers.map(
                ({ name, description, width, addressOffset, resetValue }) => ({
                  peripheralName: peripheral.name, // Include peripheral info
                  name,
                  description,
                  width,
                  addressOffset: convertToHexString(
                    peripheral.baseAddress + addressOffset,
                  ),
                  resetValue: convertToHexString(resetValue),
                }),
              ),
            )}
          />
        </div>
      </ScrollArea>
      <div className="pb-10">
        <Separator />
      </div>

      {selectedDevice.peripherals.flatMap((peripheral) =>
        peripheral.registers.map((register) => (
          <RegisterVisualizer
            key={register.id}
            register={register}
            baseAddr={peripheral.baseAddress}
          />
        )),
      )}
    </div>
  );
};

export default RegisterList;
