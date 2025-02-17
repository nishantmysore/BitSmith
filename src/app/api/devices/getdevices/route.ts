import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("[Devices API] Route hit - starting request");
  const startTime = performance.now();

  // Add more granular timing for connection
  const prismaConnectStart = performance.now();
  await prisma.$connect();
  console.log(
    `[Devices API] Prisma connection took ${performance.now() - prismaConnectStart}ms`,
  );

  try {
    const sessionStart = performance.now();
    console.log("[Devices API] Attempting to get server session");
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("[Devices API] No session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!session.user?.id) {
      console.log("[Devices API] Session found but no user ID");
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    console.log(
      `[Devices API] Session fetch took ${performance.now() - sessionStart}ms`,
    );
    console.log("[Devices API] Session user ID:", session.user.id);

    const prismaStart = performance.now();
    const devices = await prisma.device.findMany({
      where: {
        OR: [{ ownerId: session.user.id }, { isPublic: true }],
      },
      select: {
        id: true,
        name: true,
      },
    });
    console.log(
      `[Devices API] Prisma query took ${performance.now() - prismaStart}ms`,
    );
    console.log(
      `[Devices API] Total request time: ${performance.now() - startTime}ms`,
    );

    console.log("Devices fetched:", devices.length);
    return NextResponse.json(
      { devices },
      {
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          Vary: "Accept, Cookie",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 },
    );
  }
}
