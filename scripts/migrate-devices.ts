// scripts/migrate-devices.ts
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function importDevice(deviceFolder: string) {
  try {
    const deviceFilePath = path.join(deviceFolder, 'device.json');
    console.log(`Importing from: ${deviceFilePath}`);

    const fileContent = await fs.readFile(deviceFilePath, 'utf-8');
    const deviceData = JSON.parse(fileContent);

    // First check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceData.id }
    });

    if (existingDevice) {
      console.log(`Device ${deviceData.id} already exists, updating...`);
      await prisma.device.delete({
        where: { id: deviceData.id }
      });
    }

    const device = await prisma.device.create({
      data: {
        id: deviceData.id,
        name: deviceData.name,
        description: deviceData.description,
        registers: {
          create: Object.entries(deviceData.registers).map(([_, register]: [string, any]) => ({
            name: register.name,
            address: register.address,
            fields: {
              create: register.fields.map((field: any) => ({
                name: field.name,
                bits: field.bits,
                access: field.access,
                description: field.description
              }))
            }
          }))
        }
      },
      include: {
        registers: {
          include: {
            fields: true
          }
        }
      }
    });

    console.log(`Successfully imported device: ${device.name}`);
    console.log(`Imported ${device.registers.length} registers`);
    const totalFields = device.registers.reduce((sum, reg) => sum + reg.fields.length, 0);
    console.log(`Imported ${totalFields} fields`);
    return device;
  } catch (error) {
    console.error(`Error importing device from ${deviceFolder}:`, error);
    throw error;
  }
}

async function migrateData() {
  try {
    // Adjust the path based on your project structure
    const devicesDir = path.join(process.cwd(), 'src', 'devices');
    console.log(`Looking for devices in: ${devicesDir}`);

    const entries = await fs.readdir(devicesDir, { withFileTypes: true });
    
    const deviceFolders = entries
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(devicesDir, entry.name));

    console.log(`Found ${deviceFolders.length} device folders`);

    for (const deviceFolder of deviceFolders) {
      try {
        console.log(`\nProcessing device folder: ${deviceFolder}`);
        await importDevice(deviceFolder);
      } catch (error) {
        console.error(`Failed to import device from ${deviceFolder}`);
      }
    }
    
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData().catch(console.error);
