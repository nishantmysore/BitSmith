import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterAccessType, FieldAccessType } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

// Constants for batch processing
const BATCH_SIZE = 100;

// Define interfaces based on Prisma schema
interface Peripheral {
  id: string;
  name: string;
  description: string;
  baseAddress: bigint;
  size: bigint;
  deviceId: string;
  registers: Register[];
}

interface Register {
  id: string;
  name: string;
  description: string;
  width: number;
  addressOffset: bigint;
  resetValue: bigint;
  resetMask?: bigint | null;
  readAction?: string | null;
  writeAction?: string | null;
  modifiedWriteValues?: string | null;
  access: RegisterAccessType;
  isArray: boolean;
  arraySize?: number | null;
  arrayStride?: bigint | null;
  namePattern?: string | null;
  peripheralId: string;
  fields: Field[];
}

interface Field {
  id: string;
  name: string;
  description: string;
  bitOffset: number;
  bitWidth: number;
  readAction?: string | null;
  writeAction?: string | null;
  access: FieldAccessType;
  registerId: string;
  enumeratedValues: FieldEnum[];
}

interface FieldEnum {
  id: string;
  name: string;
  description?: string | null;
  value: number;
  fieldId: string;
}


// Helper function to log timing information
function logTiming(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`[Performance] ${operation}: ${duration}ms`);
  return duration;
}

export async function POST(req: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the device ID from the request body
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add device count check
    const deviceCount = await prisma.device.count({
      where: {
        ownerId: user.id,
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

    // First, fetch the original device
    const originalDevice = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!originalDevice) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Create the new device with basic properties from the original
    const deviceStartTime = Date.now();
    const newDevice = await prisma.device.create({
      data: {
        name: `${originalDevice.name} (Copy)`,
        description: originalDevice.description,
        isPublic: false, // Set to private as requested
        littleEndian: originalDevice.littleEndian,
        defaultClockFreq: originalDevice.defaultClockFreq,
        version: originalDevice.version,
        ownerId: user.id, // Set the new owner as requested
        originalDeviceId: deviceId, // Track the original device
      },
    });
    logTiming("Base device creation", deviceStartTime);

    // Process the copy operation in the background
    // This allows us to return a response to the user quickly
    void copyDeviceStructure(deviceId, newDevice.id);

    return NextResponse.json({
      ...newDevice,
      message: "Device copy initiated. The structure will be copied in the background.",
    });
  } catch (error) {
    console.error("Error copying device:", error);
    return NextResponse.json(
      { error: "Failed to copy device" },
      { status: 500 },
    );
  }
}

// Function to copy the device structure in the background
async function copyDeviceStructure(sourceDeviceId: string, targetDeviceId: string) {
  const copyStartTime = Date.now();
  try {
    // Get all peripherals from the original device with their related data
    const peripherals = await prisma.peripheral.findMany({
      where: { deviceId: sourceDeviceId },
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
    });

    // Process peripherals in batches
    await processPeripherals(peripherals, targetDeviceId);

    // Revalidate the device path to update the ISR cache
    revalidatePath(`/devices/${targetDeviceId}`);
    revalidatePath(`/api/devices/${targetDeviceId}`);
    
    // Also revalidate using tag-based approach
    revalidateTag(`device-${targetDeviceId}`);
    
    // Revalidate the devices list pages
    revalidatePath('/devices');
    revalidatePath('/api/devices');
    revalidatePath('/api/my-devices');
    revalidateTag('devices-list');
    
    // Check if the original device was public, and if so, revalidate public devices list
    const originalDevice = await prisma.device.findUnique({
      where: { id: sourceDeviceId },
      select: { isPublic: true },
    });
    
    if (originalDevice?.isPublic) {
      revalidatePath('/api/public-devices');
      revalidateTag('public-devices-list');
    }
    
    logTiming(`Completed copying device structure from ${sourceDeviceId} to ${targetDeviceId}`, copyStartTime);
  } catch (error) {
    console.error(`Error in background copy process for device ${targetDeviceId}:`, error);
  }
}

async function processPeripherals(peripherals: Peripheral[], targetDeviceId: string) {
  const startTime = Date.now();
  
  // Create all peripherals first
  for (let i = 0; i < peripherals.length; i += BATCH_SIZE) {
    const batch = peripherals.slice(i, i + BATCH_SIZE);
    
    // Create peripherals in parallel
    const newPeripherals = await Promise.all(
      batch.map(async (peripheral) => {
        const newPeripheral = await prisma.peripheral.create({
          data: {
            deviceId: targetDeviceId,
            name: peripheral.name,
            description: peripheral.description,
            baseAddress: peripheral.baseAddress,
            size: peripheral.size,
          },
        });
        
        return {
          original: peripheral,
          new: newPeripheral,
        };
      })
    );
    
    // Process registers for each peripheral in this batch
    await Promise.all(
      newPeripherals.map(async (peripheralPair) => {
        await processRegisters(
          peripheralPair.original.registers,
          peripheralPair.new.id
        );
      })
    );
  }
  
  logTiming(`Processed ${peripherals.length} peripherals`, startTime);
}

async function processRegisters(registers: Register[], newPeripheralId: string) {
  const startTime = Date.now();
  
  // Process registers in batches
  for (let i = 0; i < registers.length; i += BATCH_SIZE) {
    const batch = registers.slice(i, i + BATCH_SIZE);
    
    // Create registers in parallel
    const newRegisters = await Promise.all(
      batch.map(async (register) => {
        const newRegister = await prisma.register.create({
          data: {
            peripheralId: newPeripheralId,
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
        
        return {
          original: register,
          new: newRegister,
        };
      })
    );
    
    // Process fields for each register in this batch
    await Promise.all(
      newRegisters.map(async (registerPair) => {
        await processFields(
          registerPair.original.fields,
          registerPair.new.id
        );
      })
    );
  }
  
  logTiming(`Processed ${registers.length} registers`, startTime);
}

async function processFields(fields: Field[], newRegisterId: string) {
  const startTime = Date.now();
  
  // Process fields in batches
  for (let i = 0; i < fields.length; i += BATCH_SIZE) {
    const batch = fields.slice(i, i + BATCH_SIZE);
    
    // Create fields in parallel
    const newFields = await Promise.all(
      batch.map(async (field) => {
        const newField = await prisma.field.create({
          data: {
            registerId: newRegisterId,
            name: field.name,
            description: field.description,
            bitOffset: field.bitOffset,
            bitWidth: field.bitWidth,
            readAction: field.readAction,
            writeAction: field.writeAction,
            access: field.access,
          },
        });
        
        return {
          original: field,
          new: newField,
        };
      })
    );
    
    // Process enumerated values for each field in this batch
    await Promise.all(
      newFields.map(async (fieldPair) => {
        if (fieldPair.original.enumeratedValues?.length > 0) {
          await processEnumValues(
            fieldPair.original.enumeratedValues,
            fieldPair.new.id
          );
        }
      })
    );
  }
  
  logTiming(`Processed ${fields.length} fields`, startTime);
}

async function processEnumValues(enumValues: FieldEnum[], newFieldId: string) {
  const startTime = Date.now();
  
  // Process enum values in batches using createMany for better performance
  for (let i = 0; i < enumValues.length; i += BATCH_SIZE) {
    const batch = enumValues.slice(i, i + BATCH_SIZE);
    
    await prisma.fieldEnum.createMany({
      data: batch.map((enumValue) => ({
        fieldId: newFieldId,
        name: enumValue.name,
        description: enumValue.description || null,
        value: enumValue.value,
      })),
    });
  }
  
  logTiming(`Processed ${enumValues.length} enum values`, startTime);
}
