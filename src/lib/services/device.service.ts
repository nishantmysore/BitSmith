import { prisma } from "../prisma";
import type { Device } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export class DeviceService {
  static async getAllDevices() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Session user id: ", session.user.id);
    return prisma.device.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        registers: {
          include: {
            fields: true,
          },
        },
      },
    });
  }

  static async getDeviceById(id: string) {
    return prisma.device.findUnique({
      where: { id },
      include: {
        registers: {
          include: {
            fields: true,
          },
        },
      },
    });
  }

  static async validateDevice(device: Device): Promise<boolean> {
    if (!device.id || !device.name || !device.description) {
      return false;
    }

    const deviceWithRelations = await prisma.device.findUnique({
      where: { id: device.id },
      include: {
        registers: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!deviceWithRelations?.registers.length) {
      return false;
    }

    for (const register of deviceWithRelations.registers) {
      if (!register.name || !register.address || !register.fields.length) {
        return false;
      }

      for (const field of register.fields) {
        if (!field.name || !field.bits || !field.access || !field.description) {
          return false;
        }
      }
    }

    return true;
  }
}
