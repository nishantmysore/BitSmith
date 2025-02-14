import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Remove the extra user lookup since we already have the user ID
    // Query only the most essential fields for the dropdown
    const devices = await prisma.device.findMany({
      where: {
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 },
    );
  }
}
