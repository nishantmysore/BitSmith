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

    // Add device count check
    const deviceCount = await prisma.device.count({
      where: {
        ownerId: user.id,
      },
    });

    if (deviceCount >= 100) {
      return NextResponse.json(
        {
          error: "Device limit reached. Maximum 100 devices allowed per user.",
        },
        { status: 403 },
      );
    }

    // First, fetch the original device
    const originalDevice = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!originalDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Use a transaction to ensure data consistency
    const newDevice = await prisma.$transaction(async (tx) => {
      // 1. Create a new device with basic properties from the original
      const device = await tx.device.create({
        data: {
          name: `${originalDevice.name} (Copy)`,
          description: originalDevice.description,
          isPublic: false, // Set to private as requested
          littleEndian: originalDevice.littleEndian,
          defaultClockFreq: originalDevice.defaultClockFreq,
          version: originalDevice.version,
          ownerId: user.id, // Set the new owner as requested
          originalDeviceId: deviceId, // Track the original device
        },
      });

      // 2. Get all peripherals from the original device
      const peripherals = await tx.peripheral.findMany({
        where: { deviceId: deviceId },
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
      });

      // 3. Create peripherals for the new device
      for (const peripheral of peripherals) {
        const newPeripheral = await tx.peripheral.create({
          data: {
            deviceId: device.id,
            name: peripheral.name,
            description: peripheral.description,
            baseAddress: peripheral.baseAddress,
            size: peripheral.size,
          },
        });

        // 4. Create registers for each peripheral
        for (const register of peripheral.registers) {
          const newRegister = await tx.register.create({
            data: {
              peripheralId: newPeripheral.id,
              name: register.name,
              description: register.description,
              width: register.width,
              addressOffset: register.addressOffset,
              resetValue: register.resetValue,
              resetMask: register.resetMask,
              readAction: register.readAction,
              writeAction: register.writeAction,
              modifiedWriteValues: register.modifiedWriteValues,
              access: register.access,
              isArray: register.isArray,
              arraySize: register.arraySize,
              arrayStride: register.arrayStride,
              namePattern: register.namePattern,
            },
          });

          // 5. Create fields for each register
          for (const field of register.fields) {
            const newField = await tx.field.create({
              data: {
                registerId: newRegister.id,
                name: field.name,
                description: field.description,
                bitOffset: field.bitOffset,
                bitWidth: field.bitWidth,
                readAction: field.readAction,
                writeAction: field.writeAction,
                access: field.access,
              },
            });

            // 6. Create enumerated values for each field
            if (field.enumeratedValues.length > 0) {
              await tx.fieldEnum.createMany({
                data: field.enumeratedValues.map(enumValue => ({
                  fieldId: newField.id,
                  name: enumValue.name,
                  description: enumValue.description || null,
                  value: enumValue.value,
                })),
              });
            }
          }
        }
      }

      return device;
    }, {
      timeout: 30000, // Increase timeout to 30 seconds
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
