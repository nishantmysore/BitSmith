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
import { Register, Field, FieldEnum } from "@prisma/client";

interface RegisterData {
  peripheralName: string;
  name: string;
  description: string;
  width: number;
  addressOffset: string;
  register: Register & {
    fields: (Field & {
      enumeratedValues?: FieldEnum[];
    })[];
  };
  resetValue: string;
  baseAddr: bigint;
}

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

  function flattenRegisters(device: any): RegisterData[] {
    return device.peripherals.flatMap((peripheral: any) =>
      peripheral.registers.flatMap((register: any) => {
        // If register is not an array, return single register data
        if (!register.isArray) {
          const totalOffset =
            BigInt(peripheral.baseAddress) + BigInt(register.addressOffset);
          return [
            {
              peripheralName: peripheral.name,
              name: register.name,
              description: register.description,
              width: register.width,
              addressOffset: convertToHexString(totalOffset),
              resetValue: convertToHexString(register.resetValue),
              register: register, // Pass through the original register
              baseAddr: BigInt(peripheral.baseAddress),
            },
          ];
        }

        // If register is an array, create entry for each element
        return Array.from({ length: register.arraySize || 0 }, (_, index) => {
          const arrayOffset = register.arrayStride
            ? BigInt(register.arrayStride) * BigInt(index)
            : BigInt(0);

          const totalOffset =
            BigInt(peripheral.baseAddress) +
            BigInt(register.addressOffset) +
            arrayOffset;

          // Format name according to namePattern or fall back to array index
          const elementName = register.namePattern
            ? register.namePattern
                .replace(/%s/g, register.name)
                .replace(/%d/g, String(index))
            : `${register.name}[${index}]`;

          // Create a new register object for array element
          const arrayRegister = {
            ...register,
            name: elementName,
            addressOffset: BigInt(register.addressOffset) + BigInt(arrayOffset),
            id: `${register.id}_${index}`, // Create unique ID for array elements
          };

          return {
            peripheralName: peripheral.name,
            name: elementName,
            description: register.description,
            width: register.width,
            addressOffset: convertToHexString(totalOffset),
            resetValue: convertToHexString(register.resetValue),
            register: arrayRegister, // Pass through the modified register
            baseAddr: BigInt(peripheral.baseAddress),
          };
        });
      }),
    );
  }
  const flattenedRegisters: RegisterData[] = flattenRegisters(selectedDevice);

  return (
    <div className="space-y-4 py-10">
      <Separator />
      <h1 className="text-xl font-semibold px-2 pt-10">Register List</h1>
      <ScrollArea>
        <div className="px-2">
          <DataTable columns={columns} data={flattenedRegisters} />
        </div>
      </ScrollArea>
      <div className="pb-10">
        <Separator />
      </div>
      {flattenedRegisters.map((registerData: RegisterData) => (
        <RegisterVisualizer
          key={registerData.register.id}
          register={registerData.register}
          baseAddr={registerData.baseAddr}
        />
      ))}
    </div>
  );
};

export default RegisterList;
