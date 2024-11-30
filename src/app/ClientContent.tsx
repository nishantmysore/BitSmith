"use client";
import { DeviceProvider } from "@/DeviceContext";
import { DeviceSelector } from "@/components/DeviceSelector";
import RegisterList from "@/components/RegisterList";

export function ClientContent() {
  return (
    <DeviceProvider>
      <div className="flex flex-col p-4">
        <div className="w-full mx-auto">
          <DeviceSelector />
          <RegisterList/>
          </div>
      </div>
    </DeviceProvider>
  );
}
