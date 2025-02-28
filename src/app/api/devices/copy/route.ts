import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

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

    // Create the new device with basic properties from the original
    // but reference the original device ID instead of copying peripherals
    const newDevice = await prisma.device.create({
      data: {
        name: `${originalDevice.name} (Copy)`,
        description: originalDevice.description,
        isPublic: false, // Set to private as requested
        littleEndian: originalDevice.littleEndian,
        defaultClockFreq: originalDevice.defaultClockFreq,
        version: originalDevice.version,
        ownerId: user.id, // Set the new owner as requested
        originalDeviceId: deviceId, // Reference the original device
      },
    });

    // Revalidate paths to update the UI
    revalidatePath(`/devices/${newDevice.id}`);
    revalidatePath(`/api/devices/${newDevice.id}`);
    revalidateTag(`device-${newDevice.id}`);
    revalidatePath('/devices');
    revalidatePath('/api/devices');
    revalidatePath('/api/my-devices');
    revalidateTag('devices-list');
    
    // Check if the original device was public, and if so, revalidate public devices list
    if (originalDevice.isPublic) {
      revalidatePath('/api/public-devices');
      revalidateTag('public-devices-list');
    }

    return NextResponse.json({
      ...newDevice,
      message: "Device copied successfully. The copy references the original device structure.",
    });
  } catch (error) {
    console.error("Error copying device:", error);
    return NextResponse.json(
      { error: "Failed to copy device" },
      { status: 500 },
    );
  }
}
