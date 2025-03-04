// app/api/public-devices/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const devices = await prisma.device.findMany({
      where: {
        ownerId: null,
        name: {
          contains: search,
          mode: "insensitive",
        },
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        version: true,
      },
    });

    return NextResponse.json(devices);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 },
    );
  }
}
