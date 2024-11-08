import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        registers: {
          include: {
            fields: true
          }
        }
      }
    });
    return NextResponse.json(devices);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching devices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const device = await prisma.device.create({
      data: {
        name: body.name,
        description: body.description,
        registers: {
          create: body.registers.map((register: any) => ({
            name: register.name,
            address: register.address,
            description: register.description,
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
    
    return NextResponse.json(device);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating device' },
      { status: 500 }
    );
  }
}

