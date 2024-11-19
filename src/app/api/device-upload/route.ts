import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Device, Register, Field} from '@prisma/client';

// Define the expected request body type using Prisma types
type RegisterInput = Omit<Register, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'> & {
  fields: Array<Omit<Field, 'id' | 'registerId' | 'createdAt' | 'updatedAt'>>
  width: number;
  description: string;
};

type DeviceInput = Omit<Device, 'id' | 'createdAt' | 'updatedAt'> & {
  registers: Record<string, RegisterInput>;
  base_address: string;
};

export async function POST(request: Request) {
  try {
    const body: DeviceInput = await request.json();
    
    const result = await prisma.$transaction(async (tx) => {
      const device = await tx.device.create({
        data: {
          name: body.name,
          description: body.description,
          isPublic: body.isPublic ?? false,
          ownerId: body.ownerId,
          base_address: body.base_address,
          originalDeviceId: body.originalDeviceId,
          registers: {
            create: Object.values(body.registers).map(register => ({
              name: register.name,
              address: register.address,
              width: register.width,
              description: register.description,
              fields: {
                create: register.fields.map(field => ({
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

      return device;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Device ID already exists' },
          { status: 409 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid reference. Please check ownerId and originalDeviceId' },
          { status: 400 }
        );
      }
    }

    console.error('Failed to create device:', error);
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
}

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
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        registers: {
          include: {
            fields: true
          }
        },
        sharedWith: {
          select: {
            id: true,
            name: true,
            email: true
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
      { error: 'Failed to create device' },
      { status: 500 }
    );
  }
}
