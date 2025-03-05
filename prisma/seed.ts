import { PrismaClient } from "@prisma/client";
import { DeviceValidateSchema, DeviceFormData } from "../src/types/validation";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient({
  // Removed log configuration to stop printing Prisma transactions
});

const BATCH_SIZE = 20; // Process one file at a time for testing

// Modified version of prepareDeviceData that doesn't require userId
function preparePublicDeviceData(data: DeviceFormData) {
  return {
    name: data.name,
    description: data.description,
    isPublic: true, // Always true for public devices
    littleEndian: data.littleEndian,
    defaultClockFreq: data.defaultClockFreq ?? 0,
    version: data.version,
    ownerId: null, // No owner for public devices
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

async function processFile(filePath: string, fileName: string) {
  try {
    console.log(`📖 Reading file ${fileName}...`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    
    console.log(`🔍 Parsing JSON for ${fileName}...`);
    const deviceData = JSON.parse(fileContent);

    // Validate the data
    console.log(`✨ Validating data for ${fileName}...`);
    const validatedData = DeviceValidateSchema.safeParse(deviceData);
    if (!validatedData.success) {
      console.error(`❌ Validation failed for ${fileName}:`, validatedData.error);
      return false;
    }

    // Check if device already exists
    console.log(`🔎 Checking if device ${deviceData.name} exists...`);
    const existingDevice = await prisma.device.findFirst({
      where: {
        name: deviceData.name,
        isPublic: true,
        ownerId: null,
      },
    });

    if (existingDevice) {
      console.log(`⏭️  Device ${deviceData.name} already exists, skipping...`);
      return true;
    }

    // Create the device
    console.log(`📝 Preparing data for ${fileName}...`);
    const preparedData = preparePublicDeviceData(validatedData.data);
    
    console.log(`💾 Creating device from ${fileName}...`);
    await prisma.device.create({
      data: preparedData,
    });

    console.log(`✅ Successfully created public device from ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

async function seedPublicDevices() {
  try {
    // Get all JSON files from the public_devices directory
    const publicDevicesPath = path.join(process.cwd(), "public_devices");
    const files = await fs.readdir(publicDevicesPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    console.log(`Found ${jsonFiles.length} public device files to process`);
    console.log(`Processing in batches of ${BATCH_SIZE} files`);

    // Process files in batches
    for (let i = 0; i < jsonFiles.length; i += BATCH_SIZE) {
      const batch = jsonFiles.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(jsonFiles.length/BATCH_SIZE)}`);
      
      const results = await Promise.all(
        batch.map((file) => {
          const filePath = path.join(publicDevicesPath, file);
          return processFile(filePath, file);
        })
      );

      const successCount = results.filter(Boolean).length;
      console.log(`Batch completed: ${successCount}/${batch.length} files processed successfully`);
      
      // Small delay between batches to prevent overwhelming the connection
      if (i + BATCH_SIZE < jsonFiles.length) {
        console.log("Waiting 2 seconds before next batch...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log("\n✨ Seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPublicDevices();
