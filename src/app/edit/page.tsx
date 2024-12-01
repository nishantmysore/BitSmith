// src/app/devices/edit/page.tsx
import { DeviceProvider } from "@/DeviceContext";
import { DeviceEditForm } from "@/components/EditComponents/DeviceEditForm";

export default function EditDevicePage() {
  return (
    <DeviceProvider>
      <div className="container mx-auto py-6">
        <DeviceEditForm />
      </div>
    </DeviceProvider>
  );
}
