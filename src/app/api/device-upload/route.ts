import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DeviceValidateSchema } from "@/types/validation";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Define explicit types for session
interface SessionUser {
  id: string;
  email: string;
}

interface Session {
  user: SessionUser;
}

// Define explicit types for the validation schema result
type ValidatedData = z.infer<typeof DeviceValidateSchema>;

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Valid authentication required" },
        { status: 401 },
      );
    }

    // Get the current user with error handling
    await prisma.user
      .findUniqueOrThrow({
        where: { id: session.user.id },
      })
      .catch(() => {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      });

    // Parse request body with explicit error handling
    let body: unknown;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Validate the request data
    const validatedData = DeviceValidateSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.format() },
        { status: 400 },
      );
    }

    // Prepare the device creation data
    const deviceData = prepareDeviceData(validatedData.data, session.user.id);

    // Execute the transaction
    const device = await prisma.$transaction(
      async (tx) => {
        return await tx.device.create({
          data: deviceData,
          include: {
            registers: {
              include: {
                fields: true,
              },
            },
          },
        });
      },
      {
        timeout: 10000, // 10s timeout
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Helper function to prepare device data
function prepareDeviceData(data: ValidatedData, ownerId: string) {
  return {
    name: data.name,
    description: data.description,
    isPublic: data.isPublic ?? false,
    ownerId,
    base_address: data.base_address,
    originalDeviceId: null,
    registers: {
      create:
        data.registers?.map((register) => ({
          name: register.name,
          address: register.address,
          width: parseInt(register.width, 10),
          description: register.description,
          fields: {
            create: register.fields?.map((field) => ({
              name: field.name,
              bits: field.bits,
              access: field.access,
              description: field.description,
            })),
          },
        })) ?? [],
    },
  };
}

// Helper function to handle Prisma errors
function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          { error: "Device ID already exists" },
          { status: 409 },
        );
      case "P2003":
        return NextResponse.json(
          {
            error:
              "Invalid reference. Please check ownerId and originalDeviceId",
          },
          { status: 400 },
        );
      case "P2025":
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 },
        );
      default:
        console.error("Prisma error:", error);
        return NextResponse.json(
          { error: "Database operation failed" },
          { status: 500 },
        );
    }
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    { error: "Failed to create device" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        registers: {
          include: {
            fields: true,
          },
        },
        sharedWith: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error("Failed to fetch device:", error);
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 },
    );
  }
}
