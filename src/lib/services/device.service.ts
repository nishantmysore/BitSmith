import { prisma } from '../prisma'
import type { Device } from '@prisma/client'

export class DeviceService {
  static async getAllDevices() {
    return prisma.device.findMany({
      include: {
        registers: {
          include: {
            fields: true
          }
        }
      }
    })
  }

  static async getDeviceById(id: string) {
    return prisma.device.findUnique({
      where: { id },
      include: {
        registers: {
          include: {
            fields: true
          }
        }
      }
    })
  }

  static async validateDevice(device: Device): Promise<boolean> {
    if (!device.id || !device.name || !device.description) {
      return false
    }

    const deviceWithRelations = await prisma.device.findUnique({
      where: { id: device.id },
      include: {
        registers: {
          include: {
            fields: true
          }
        }
      }
    })

    if (!deviceWithRelations?.registers.length) {
      return false
    }

    for (const register of deviceWithRelations.registers) {
      if (!register.name || !register.address || !register.fields.length) {
        return false
      }

      for (const field of register.fields) {
        if (!field.name || !field.bits || !field.access || !field.description) {
          return false
        }
      }
    }

    return true
  }
}
