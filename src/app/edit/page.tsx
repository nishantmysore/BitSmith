// src/app/devices/edit/page.tsx
import { DeviceProvider } from "@/DeviceContext";
import { DeviceEditForm } from "@/components/EditComponents/DeviceEditForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function EditDevicePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DeviceProvider>
      <div className="container mx-auto py-6">
        <DeviceEditForm />
      </div>
    </DeviceProvider>
  );
}
