import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { DeviceEditForm } from "@/components/EditComponents/DeviceEditForm";
import { DeviceProvider } from "@/DeviceContext";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DeviceProvider>
      <div className="container mx-auto py-6">
        <DeviceEditForm newDevice={true} />
      </div>
    </DeviceProvider>
  );
}
