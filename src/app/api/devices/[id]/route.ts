import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const transformBigInts = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (typeof data === "bigint") return Number(data);
  if (Array.isArray(data)) return data.map((item) => transformBigInts(item));
  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        transformBigInts(value),
      ]),
    );
  }
  return data;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Log the incoming request params for debugging
    console.log("Received request for device ID:", params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Log session user for debugging
    console.log("Session user:", session.user);

    const device = await prisma.device.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
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

    if (!device) {
      console.log("Device not found for ID:", params.id);
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(transformBigInts(device));
  } catch (error) {
    console.error("Failed to fetch device:", error);
    return NextResponse.json(
      { error: "Failed to fetch device" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log("Received DELETE request for device ID:", params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // First verify the device exists and belongs to the user
    const device = await prisma.device.findFirst({
      where: {
        id: params.id,
        ownerId: session.user.id,
      },
    });

    if (!device) {
      console.log("Device not found or unauthorized for ID:", params.id);
      return NextResponse.json(
        { error: "Device not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the device and all related data
    await prisma.device.delete({
      where: {
        id: params.id,
      },
    });

    console.log("Successfully deleted device:", params.id);
    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Failed to delete device:", error);
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 },
    );
  }
}
