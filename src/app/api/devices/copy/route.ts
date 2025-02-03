import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the device ID from the request body
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, fetch the original device with all its related data
    const originalDevice = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        peripherals: {
          include: {
            registers: {
              include: {
                fields: {
                  include: {
                    enumeratedValues: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!originalDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Create a new device with all its related data
    const newDevice = await prisma.device.create({
      data: {
        name: `${originalDevice.name} (Copy)`,
        description: originalDevice.description,
        isPublic: false, // Set to false by default for copied devices
        littleEndian: originalDevice.littleEndian,
        defaultClockFreq: originalDevice.defaultClockFreq,
        version: originalDevice.version,
        ownerId: user.id,
        originalDeviceId: originalDevice.id,
        peripherals: {
          create: originalDevice.peripherals.map((peripheral) => ({
            name: peripheral.name,
            baseAddress: peripheral.baseAddress,
            description: peripheral.description,
            size: peripheral.size,
            registers: {
              create: peripheral.registers.map((register) => ({
                name: register.name,
                addressOffset: register.addressOffset,
                description: register.description,
                access: register.access,
                width: register.width,
                fields: {
                  create: register.fields.map((field) => ({
                    name: field.name,
                    description: field.description,
                    bitOffset: field.bitOffset,
                    bitWidth: field.bitWidth,
                    access: field.access,
                    enumeratedValues: {
                      create: field.enumeratedValues.map((enumValue) => ({
                        name: enumValue.name,
                        description: enumValue.description,
                        value: enumValue.value,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(newDevice);
  } catch (error) {
    console.error("Error copying device:", error);
    return NextResponse.json(
      { error: "Failed to copy device" },
      { status: 500 },
    );
  }
}
