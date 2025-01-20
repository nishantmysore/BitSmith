import { PrismaClient } from "@prisma/client";
import { DeviceValidateSchema, DeviceFormData } from "../src/types/validation";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

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

async function seedPublicDevices() {
  try {
    // Get all JSON files from the public_devices directory
    const publicDevicesPath = path.join(process.cwd(), "public_devices");
    const files = await fs.readdir(publicDevicesPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    console.log(`Found ${jsonFiles.length} public device files to process`);

    for (const file of jsonFiles) {
      try {
        // Read and parse JSON file
        const filePath = path.join(publicDevicesPath, file);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const deviceData = JSON.parse(fileContent);

        // Validate the data
        const validatedData = DeviceValidateSchema.safeParse(deviceData);
        if (!validatedData.success) {
          console.error(`Validation failed for ${file}:`, validatedData.error);
          continue;
        }

        // Check if device already exists
        const existingDevice = await prisma.device.findFirst({
          where: {
            name: deviceData.name,
            isPublic: true,
            ownerId: null,
          },
        });

        if (existingDevice) {
          console.log(`Device ${deviceData.name} already exists, skipping...`);
          continue;
        }

        // Create the device
        const preparedData = preparePublicDeviceData(validatedData.data);
        await prisma.device.create({
          data: preparedData,
        });

        console.log(`Successfully created public device from ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPublicDevices();
