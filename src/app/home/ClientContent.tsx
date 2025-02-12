"use client";
import { DeviceSelector } from "@/components/DeviceSelector";

export function ClientContent() {
  return (
    <div className="flex flex-col p-4 w-full flex-1">
      <div className="max-w-none w-full mx-auto">
        <DeviceSelector />
      </div>
    </div>
  );
}
