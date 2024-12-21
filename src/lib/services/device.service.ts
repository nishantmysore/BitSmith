import { prisma } from "../prisma";
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
        peripherals: {
          include: {
            registers: {
              include: {
                fields: {
                  include: {
                    enumeratedValues: true
                  }
              }
            }
            }
          },
        },
      },
    });
  }

}
