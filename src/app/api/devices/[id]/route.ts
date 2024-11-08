import { DeviceService } from '@/lib/services/device.service'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const device = await DeviceService.getDeviceById(params.id)
    
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(device)
  } catch (error) {
    console.error('Failed to fetch device:', error)
    return NextResponse.json(
      { error: 'Failed to fetch device' },
      { status: 500 }
    )
  }
}
