// src/app/devices/edit/page.tsx
import { DeviceProvider } from "@/DeviceContext";
import { DeviceEditForm } from "@/components/DeviceEditForm";

export default function EditDevicePage() {
  return (
    <DeviceProvider>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Device Configuration</h1>
        <DeviceEditForm />
      </div>
    </DeviceProvider>
  );
}

