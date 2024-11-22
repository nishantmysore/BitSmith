// src/app/api/devices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AccessType } from "@prisma/client";

const acceptedWidths = [1, 2, 4, 8, 16, 24, 32, 64, 128, 256];

// Validation helpers
const isValidHex = (value: string): boolean => {
  const hexRegex = /^0x[0-9A-Fa-f]+$/;
  return hexRegex.test(value);
};

const isValidBitRange = (bits: string): boolean => {
  // Accept single bit (e.g., "0") or bit range (e.g., "7:0")
  const singleBitRegex = /^\d+$/;
  const bitRangeRegex = /^\d+:\d+$/;

  if (singleBitRegex.test(bits)) {
    return true;
  }

  if (bitRangeRegex.test(bits)) {
    const [high, low] = bits.split(":").map(Number);
    return high >= low;
  }

  return false;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get device and verify ownership
    const device = await prisma.device.findUnique({
      where: { id: params.id },
      include: { owner: true },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    if (device.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const data = await request.json();

    // Validate basic device info
    if (!data.name?.trim()) {
      return NextResponse.json(
        { error: "Device name is required" },
        { status: 400 }
      );
    }

    if (!data.description?.trim()) {
      return NextResponse.json(
        { error: "Device description is required" },
        { status: 400 }
      );
    }

    if (!isValidHex(data.base_address)) {
      return NextResponse.json(
        { error: "Invalid base address format" },
        { status: 400 }
      );
    }

    // Validate registers
    if (!Array.isArray(data.registers)) {
      return NextResponse.json(
        { error: "Registers must be an array" },
        { status: 400 }
      );
    }

    for (const register of data.registers) {
      if (!register.name?.trim()) {
        return NextResponse.json(
          { error: "Register name is required" },
          { status: 400 }
        );
      }

      if (!isValidHex(register.address)) {
        return NextResponse.json(
          { error: "Invalid register address format" },
          { status: 400 }
        );
      }

      if (!acceptedWidths.includes(register.width)) {
        return NextResponse.json(
          { error: "Invalid register width" },
          { status: 400 }
        );
      }

      // Validate fields
      if (!Array.isArray(register.fields)) {
        return NextResponse.json(
          { error: "Fields must be an array" },
          { status: 400 }
        );
      }

      for (const field of register.fields) {
        if (!field.name?.trim()) {
          return NextResponse.json(
            { error: "Field name is required" },
            { status: 400 }
          );
        }

        if (!isValidBitRange(field.bits)) {
          return NextResponse.json(
            { error: "Invalid bit range format" },
            { status: 400 }
          );
        }

        if (!Object.values(AccessType).includes(field.access)) {
          return NextResponse.json(
            { error: "Invalid access type" },
            { status: 400 }
          );
        }
      }
    }

    // Update device using transaction
    const updatedDevice = await prisma.$transaction(async (tx) => {
      // Update basic device info
      const device = await tx.device.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description,
          base_address: data.base_address,
          isPublic: data.isPublic,
        },
      });

      // Delete existing registers and fields
      await tx.field.deleteMany({
        where: {
          register: {
            deviceId: params.id,
          },
        },
      });

      await tx.register.deleteMany({
        where: {
          deviceId: params.id,
        },
      });

      // Create new registers and fields
      for (const register of data.registers) {
        const newRegister = await tx.register.create({
          data: {
            deviceId: params.id,
            name: register.name,
            description: register.description,
            address: register.address,
            width: register.width,
          },
        });

        // Create fields for this register
        await tx.field.createMany({
          data: register.fields.map((field: any) => ({
            registerId: newRegister.id,
            name: field.name,
            bits: field.bits,
            access: field.access,
            description: field.description,
          })),
        });
      }

      return device;
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("Error updating device:", error);
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    );
  }
}

