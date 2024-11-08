import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for the request
const FieldSchema = z.object({
  name: z.string(),
  bits: z.string(),
  access: z.string(),
  description: z.string()
});

const RegisterSchema = z.object({
  name: z.string(),
  address: z.string(),
  fields: z.array(FieldSchema)
});

const DeviceConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  registers: z.record(RegisterSchema)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = DeviceConfigSchema.parse(body);

    // Use a transaction to ensure all related records are created together
    const result = await prisma.$transaction(async (tx) => {
      // Create the device
      const device = await tx.device.create({
        data: {
          id: validatedData.id,
          name: validatedData.name,
          description: validatedData.description,
        },
      });

      // Create registers and their fields
      for (const [_, registerData] of Object.entries(validatedData.registers)) {
        const register = await tx.register.create({
          data: {
            name: registerData.name,
            address: registerData.address,
            deviceId: device.id,
            fields: {
              create: registerData.fields.map(field => ({
                name: field.name,
                bits: field.bits,
                access: field.access,
                description: field.description
              }))
            }
          }
        });
      }

      return device;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log("reached")
      return NextResponse.json(
        { error: 'Device ID already exists' },
        { status: 409 }
      );
    }

    console.error('Failed to create device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to fetch a specific device configuration
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        registers: {
          include: {
            fields: true
          }
        }
      }
    });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Failed to fetch device:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}
