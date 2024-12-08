import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DeviceValidateSchema } from "@/types/validation";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Get the session and verify authentication
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

    console.log(id);
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
        { status: 403 },
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = DeviceValidateSchema.safeParse(body);

    //console.log(validatedData.data)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.errors },
        { status: 400 },
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

    //Find deleted, added, and modified registers
    const deletedRegisters = validatedData.data.registers?.filter(
      (register) => register.status === "deleted",
    );
    const modifiedRegisters = validatedData.data.registers?.filter(
      (register) => register.status === "modified",
    );
    const addedRegisters = validatedData.data.registers?.filter(
      (register) => register.status === "added",
    );

    console.log("Deleted Registers:", deletedRegisters);
    console.log("Modified Registers: ", modifiedRegisters);
    console.log("Added Registers: ", addedRegisters);

    const deletedFields = validatedData.data.registers?.flatMap(
      (register) =>
        register.fields?.filter((field) => field.status === "deleted") || [],
    );

    const modifiedFields = validatedData.data.registers?.flatMap(
      (register) =>
        register.fields?.filter((field) => field.status === "modified") || [],
    );

    const addedFields = validatedData.data.registers?.flatMap((register) =>
      (
        (register.status !== "added" &&
          register.fields?.filter((field) => field.status === "added")) ||
        []
      ).map((field) => ({ db_id: register.db_id || "", field })),
    );

    console.log("Deleted Fields: ", deletedFields);
    console.log("Modified Fields: ", modifiedFields);
    console.log("Added Fields: ", addedFields);

    // Delete all existing registers
    await prisma.register.deleteMany({
      where: {
        id: {
          in:
            deletedRegisters
              ?.map((reg) => reg.db_id)
              .filter((db_id): db_id is string => db_id !== undefined) ?? [],
        },
        deviceId: id,
      },
    });

    await Promise.all(
      (addedRegisters ?? []).map((reg) =>
        prisma.register.create({
          data: {
            name: reg.name,
            description: reg.description,
            address: reg.address,
            width: parseInt(reg.width, 10),
            deviceId: id,
            fields: {
              create: reg.fields?.map((field) => ({
                name: field.name,
                description: field.description,
                bits: field.bits,
                access: field.access,
              })),
            },
          },
        }),
      ),
    );

    await Promise.all(
      (modifiedRegisters ?? []).map((data) =>
        prisma.register.updateMany({
          where: {
            id: data.db_id,
          },
          data: {
            name: data.name,
            description: data.description,
            width: parseInt(data.width, 10),
            address: data.address,
          },
        }),
      ),
    );

    await prisma.field.deleteMany({
      where: {
        id: {
          in:
            deletedFields
              ?.map((field) => field.db_id)
              .filter((db_id): db_id is string => db_id !== undefined) ?? [],
        },
      },
    });

    await Promise.all(
      (addedFields ?? []).map((addedReg) =>
        prisma.field.create({
          data: {
            name: addedReg.field.name,
            description: addedReg.field.description,
            bits: addedReg.field.bits,
            access: addedReg.field.access,
            registerId: addedReg.db_id,
          },
        }),
      ),
    );

    await Promise.all(
      (modifiedFields ?? []).map((field) =>
        prisma.field.updateMany({
          where: {
            id: field.db_id,
          },
          data: {
            name: field.name,
            description: field.description,
            bits: field.bits,
            access: field.access,
          },
        }),
      ),
    );

    return NextResponse.json(updatedDevice);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating device " + error },
      { status: 500 },
    );
  }
}

// Optionally, add a DELETE method if you want to support device deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const device = await prisma.device.findUnique({
      where: { id: id },
      include: { owner: true },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    if (device.ownerId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this device" },
        { status: 403 },
      );
    }

    await prisma.device.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting device " + error },
      { status: 500 },
    );
  }
}
