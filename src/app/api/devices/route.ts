// src/app/api/devices/route.ts
import { DeviceService } from '@/lib/services/device.service'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const devices = await DeviceService.getAllDevices()
    return NextResponse.json(devices)
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    )
  }
}
