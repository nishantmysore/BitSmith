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
    const newDevice = await prisma.$transaction(
      async (tx) => {
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
        },
      },
      {
        timeout: 20000, // Increase timeout to 20 seconds
        maxWait: 25000, // Maximum time to wait for transaction to start (optional)
      }
    );

    return NextResponse.json(newDevice);
  } catch (error) {
    console.error("Error copying device:", error);
    return NextResponse.json(
      { error: "Failed to copy device" },
      { status: 500 },
    );
  }
}
