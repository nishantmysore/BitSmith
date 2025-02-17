import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ active: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        subscriptionStatus: true,
        currentPeriodEnd: true,
      },
    });
    console.log("USER____________________", user);
    console.log("STATUS____________________", user?.subscriptionStatus);
    const isActive =
      (user?.subscriptionStatus === "active" ||
        user?.subscriptionStatus === "active_canceling" || user?.subscriptionStatus === "trialing") &&
      user?.currentPeriodEnd &&
      user.currentPeriodEnd > new Date();

    return NextResponse.json(
      { active: isActive },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
