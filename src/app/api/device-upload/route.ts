import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DeviceValidateSchema, DeviceFormData } from "@/types/validation";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const validatedData = DeviceValidateSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.format() },
        { status: 400 },
      );
    }

    console.log("Validated data!");
    const deviceData = prepareDeviceData(validatedData.data, session.user.id);

    const device = await prisma.device.create({
      data: deviceData,
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
    console.log("Device created successfully:", device); // Confirm transaction success
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function prepareDeviceData(data: DeviceFormData, userId: string) {
  return {
    name: data.name,
    description: data.description,
    isPublic: data.isPublic,
    littleEndian: data.littleEndian,
    defaultClockFreq: data.defaultClockFreq,
    version: data.version,
    ownerId: userId,
    peripherals: {
      create: data.peripherals?.map((peripheral) => ({
        name: peripheral.name,
        description: peripheral.description,
        baseAddress: peripheral.baseAddress,
        size: peripheral.size,
        registers: {
          create: peripheral.registers?.map((register) => ({
            name: register.name,
            description: register.description,
            width: register.width,
            addressOffset: register.addressOffset,
            resetValue: register.resetValue,
            resetMask: register.resetMask,
            readAction: register.readAction,
            writeAction: register.writeAction,
            modifiedWriteValues: register.modifiedWriteValues,
            access: register.access,
            isArray: register.isArray,
            arraySize: register.arraySize,
            arrayStride: register.arrayStride,
            namePattern: register.namePattern,
            fields: {
              create: register.fields?.map((field) => ({
                name: field.name,
                description: field.description,
                bitOffset: field.bitOffset,
                bitWidth: field.bitWidth,
                readAction: field.readAction,
                writeAction: field.writeAction,
                access: field.access,
                enumeratedValues: {
                  create: field.enumeratedValues?.map((enumVal) => ({
                    name: enumVal.name,
                    description: enumVal.description,
                    value: enumVal.value,
                  })),
                },
              })),
            },
          })),
        },
      })),
    },
  };
}
