'use client'
import { DeviceProvider } from "@/DeviceContext"
import { DeviceSelector } from "@/components/DeviceSelector"
import RegisterList from "@/components/RegisterList"
import RegisterBitViewer from "@/components/RegisterBitViewer"

export function ClientContent() {
  return (
    <DeviceProvider>
      <div className="flex flex-col p-4">
        <div className="w-full max-w-7xl mx-auto">
          <DeviceSelector />
          <div className="grid grid-cols-3 gap-4 items-start"> 
            <div className="col-span-1"> 
              <RegisterBitViewer />
            </div>
            <div className="col-span-2">
              <RegisterList />
            </div>
          </div>
        </div>
      </div>
    </DeviceProvider>
  );
}
