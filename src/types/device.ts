import {Device, Peripheral, Register, Field, FieldEnum} from "@prisma/client"

export type DeviceWithRelations = Device & {
  peripherals: (Peripheral & {
    registers: (Register & {
      fields: (Field & {
        enumeratedValues: FieldEnum[]
      })[]
    })[]
  })[]
}


export type CachedData = {
  timestamp: number;
  devices: DeviceWithRelations[];
};
