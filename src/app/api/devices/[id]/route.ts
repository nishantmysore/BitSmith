import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeviceValidateSchema } from "@/types/validation";

export async function PUT(
  request: Request,
  { params }: { params: { id: any } }
) {
  try {
    const {id} = await params;

    // Get the session and verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log(id)
    if (!user) { 
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the device and verify ownership
    const existingDevice = await prisma.device.findUnique({
      where: { id: id },
      include: { owner: true },
    });

    if (!existingDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    if (existingDevice.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this device" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = DeviceValidateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.errors },
        { status: 400 }
      );
    }

    // Update the device
    const updatedDevice = await prisma.device.update({
      where: { id: id },
      data: {
        name: validatedData.data.name,
        description: validatedData.data.description,
        base_address: validatedData.data.base_address,
        isPublic: validatedData.data.isPublic,
      },
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("Error updating device:", error);
    return NextResponse.json(
      { error: "Error updating device" },
      { status: 500 }
    );
  }
}

// Optionally, add a DELETE method if you want to support device deletion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const device = await prisma.device.findUnique({
      where: { id: params.id },
      include: { owner: true },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    if (device.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this device" },
        { status: 403 }
      );
    }

    await prisma.device.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { error: "Error deleting device" },
      { status: 500 }
    );
  }
}
