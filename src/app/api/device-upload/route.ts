import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { DeviceValidateSchema } from "@/types/validation";
import { NextRequest, NextResponse } from "next/server";

const BATCH_SIZE = 100; // Adjust based on your needs

function logTiming(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`[Performance] ${operation}: ${duration}ms`);
  return duration;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function createPeripheralsInBatches(deviceId: string, peripherals: any[]) {
  const startTime = Date.now();
  let totalRegisters = 0;
  
  for (let i = 0; i < peripherals.length; i += BATCH_SIZE) {
    const batchStartTime = Date.now();
    const batch = peripherals.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (peripheral) => {
        try {
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
            totalRegisters += peripheral.registers.length;
            await createRegistersInBatches(createdPeripheral.id, peripheral.registers);
          }
        } catch (error) {
          console.error(`Failed to create peripheral ${peripheral.name}:`, error);
          throw new Error(`Failed to create peripheral ${peripheral.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })
    );
    console.log(`[Performance] Processed batch of ${batch.length} peripherals in ${Date.now() - batchStartTime}ms`);
  }
  
  logTiming(`Created ${peripherals.length} peripherals with ${totalRegisters} registers`, startTime);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function createRegistersInBatches(peripheralId: string, registers: any[]) {
  const startTime = Date.now();
  let totalFields = 0;

  for (let i = 0; i < registers.length; i += BATCH_SIZE) {
    const batchStartTime = Date.now();
    const batch = registers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (register) => {
        try {
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
            totalFields += register.fields.length;
            await createFieldsInBatches(createdRegister.id, register.fields);
          }
        } catch (error) {
          console.error(`Failed to create register ${register.name}:`, error);
          throw new Error(`Failed to create register ${register.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })
    );
    console.log(`[Performance] Processed batch of ${batch.length} registers in ${Date.now() - batchStartTime}ms`);
  }

  logTiming(`Created ${registers.length} registers with ${totalFields} fields`, startTime);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function createFieldsInBatches(registerId: string, fields: any[]) {
  const startTime = Date.now();
  let totalEnumValues = 0;

  for (let i = 0; i < fields.length; i += BATCH_SIZE) {
    const batchStartTime = Date.now();
    const batch = fields.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (field) => {
        try {
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
            totalEnumValues += field.enumeratedValues.length;
            await createEnumValuesInBatches(createdField.id, field.enumeratedValues);
          }
        } catch (error) {
          console.error(`Failed to create field ${field.name}:`, error);
          throw new Error(`Failed to create field ${field.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })
    );
    console.log(`[Performance] Processed batch of ${batch.length} fields in ${Date.now() - batchStartTime}ms`);
  }

  logTiming(`Created ${fields.length} fields with ${totalEnumValues} enum values`, startTime);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function createEnumValuesInBatches(fieldId: string, enumValues: any[]) {
  const startTime = Date.now();

  for (let i = 0; i < enumValues.length; i += BATCH_SIZE) {
    const batchStartTime = Date.now();
    const batch = enumValues.slice(i, i + BATCH_SIZE);
    try {
      await prisma.fieldEnum.createMany({
        data: batch.map((enumVal) => ({
          fieldId,
          name: enumVal.name,
          description: enumVal.description,
          value: enumVal.value,
        })),
      });
      console.log(`[Performance] Processed batch of ${batch.length} enum values in ${Date.now() - batchStartTime}ms`);
    } catch (error) {
      console.error(`Failed to create enum values batch:`, error);
      throw new Error(`Failed to create enum values: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  logTiming(`Created ${enumValues.length} enum values`, startTime);
}

export async function POST(request: NextRequest) {
  const apiStartTime = Date.now();
  try {
    // Authentication check
    const authStartTime = Date.now();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    logTiming('Authentication check', authStartTime);

    // Device count check
    const countStartTime = Date.now();
    const deviceCount = await prisma.device.count({
      where: {
        ownerId: session.user.id,
      },
    });
    logTiming('Device count check', countStartTime);

    if (deviceCount >= 100) {
      return NextResponse.json(
        {
          error: "Device limit reached",
          message: "Maximum 100 devices allowed per user. Please delete some devices before creating new ones.",
          currentCount: deviceCount,
        },
        { status: 403 },
      );
    }

    // Parse request body
    const parseStartTime = Date.now();
    const body = await request.json().catch((error) => {
      console.error('JSON parse error:', error);
      return null;
    });
    if (!body) {
      return NextResponse.json(
        { 
          error: "Invalid JSON",
          message: "The request body could not be parsed as valid JSON. Please check the request format.",
        },
        { status: 400 },
      );
    }
    logTiming('Request body parsing', parseStartTime);

    // Validate data
    const validateStartTime = Date.now();
    const validatedData = DeviceValidateSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          message: "The provided data does not match the required schema.",
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }
    logTiming('Data validation', validateStartTime);

    // Create base device
    const deviceStartTime = Date.now();
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
    logTiming('Base device creation', deviceStartTime);

    // Process peripherals
    if (validatedData.data.peripherals?.length) {
      const peripheralsStartTime = Date.now();
      await createPeripheralsInBatches(device.id, validatedData.data.peripherals);
      logTiming('Peripherals processing', peripheralsStartTime);
    }

    const totalDuration = logTiming('Total API execution', apiStartTime);
    return NextResponse.json({ 
      success: true, 
      deviceId: device.id,
      timing: {
        totalDuration,
        message: `Successfully created device with ${validatedData.data.peripherals?.length || 0} peripherals in ${totalDuration}ms`
      }
    });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    console.error("Unexpected error during device creation:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "An unexpected error occurred while processing your request",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
