"use client";
import React from "react";
import RegisterVisualizer from "./RegisterVisualizer";
import { useDevice } from "@/DeviceContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/Table/DataTable";
import { columns } from "@/components/Table/TableColumns";

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
            data={selectedDevice.peripherals[0].registers.map(
              ({ name, description, width, addressOffset }) => ({
                name,
                description,
                width,
                addressOffset,
              }),
            )}
          />
        </div>
      </ScrollArea>
      <div className="pb-10">
        <Separator />
      </div>
      
      {/*selectedDevice.registers.map((register) => (
        <RegisterVisualizer
          key={register.id} // Using id instead of address for key is generally better
          register={register}
          baseAddr={baseAddr}
          offsetBaseAddr={offsetBaseAddr}
        />
      ))*/}
    </div>
  );
};

export default RegisterList;
