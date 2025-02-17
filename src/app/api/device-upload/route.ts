import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DeviceValidateSchema, DeviceFormData } from "@/types/validation";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 100; // Adjust based on your needs

async function createPeripheralsInBatches(deviceId: string, peripherals: any[]) {
  for (let i = 0; i < peripherals.length; i += BATCH_SIZE) {
    const batch = peripherals.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (peripheral) => {
        const createdPeripheral = await prisma.peripheral.create({
          data: {
            deviceId,
            name: peripheral.name,
            description: peripheral.description,
            baseAddress: peripheral.baseAddress,
            size: peripheral.size,
          },
        });

        if (peripheral.registers?.length) {
          await createRegistersInBatches(createdPeripheral.id, peripheral.registers);
        }
      })
    );
  }
}

async function createRegistersInBatches(peripheralId: string, registers: any[]) {
  for (let i = 0; i < registers.length; i += BATCH_SIZE) {
    const batch = registers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (register) => {
        const createdRegister = await prisma.register.create({
          data: {
            peripheralId,
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
          },
        });

        if (register.fields?.length) {
          await createFieldsInBatches(createdRegister.id, register.fields);
        }
      })
    );
  }
}

async function createFieldsInBatches(registerId: string, fields: any[]) {
  for (let i = 0; i < fields.length; i += BATCH_SIZE) {
    const batch = fields.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (field) => {
        const createdField = await prisma.field.create({
          data: {
            registerId,
            name: field.name,
            description: field.description,
            bitOffset: field.bitOffset,
            bitWidth: field.bitWidth,
            readAction: field.readAction,
            writeAction: field.writeAction,
            access: field.access,
          },
        });

        if (field.enumeratedValues?.length) {
          await createEnumValuesInBatches(createdField.id, field.enumeratedValues);
        }
      })
    );
  }
}

async function createEnumValuesInBatches(fieldId: string, enumValues: any[]) {
  for (let i = 0; i < enumValues.length; i += BATCH_SIZE) {
    const batch = enumValues.slice(i, i + BATCH_SIZE);
    await prisma.fieldEnum.createMany({
      data: batch.map((enumVal) => ({
        fieldId,
        name: enumVal.name,
        description: enumVal.description,
        value: enumVal.value,
      })),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const deviceCount = await prisma.device.count({
      where: {
        ownerId: session.user.id,
      },
    });

    if (deviceCount >= 100) {
      return NextResponse.json(
        {
          error: "Device limit reached. Maximum 100 devices allowed per user.",
        },
        { status: 403 },
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

    // Create the base device first
    const device = await prisma.device.create({
      data: {
        name: validatedData.data.name,
        description: validatedData.data.description,
        isPublic: validatedData.data.isPublic,
        littleEndian: validatedData.data.littleEndian,
        defaultClockFreq: validatedData.data.defaultClockFreq,
        version: validatedData.data.version,
        ownerId: session.user.id,
      },
    });

    // Process peripherals and their nested data in batches
    if (validatedData.data.peripherals?.length) {
      await createPeripheralsInBatches(device.id, validatedData.data.peripherals);
    }

    return NextResponse.json({ success: true, deviceId: device.id });
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
