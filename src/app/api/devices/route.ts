import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Utility function to transform BigInts
const transformBigInts = (data: any): any => {
  if (data === null || data === undefined) return data;

  if (typeof data === "bigint") {
    return Number(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => transformBigInts(item));
  }

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

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
    console.log("User:", user);
    console.log("About to query devices with ownerId:", session.user.id);

    // Query the devices
    const devices = await prisma.device.findMany({
      where: {
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
    console.log("finished query!");

    // Transform BigInts before sending response
    const transformedDevices = transformBigInts(devices);
    console.log(transformedDevices);

    return NextResponse.json({ devices: transformedDevices });
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 },
    );
  }
}
