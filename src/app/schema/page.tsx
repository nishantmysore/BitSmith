import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SchemaDoc } from "@/components/SchemaDocs";
import {
  DeviceValidateSchema,
  PeripheralValidateSchema,
  FieldValidateSchema,
  FieldEnumValidateSchema,
  RegisterValidateSchema,
} from "@/types/validation";
export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />

      <div className="container mx-auto py-6">
        <div className="space-y-8">
          <SchemaDoc schema={DeviceValidateSchema} title="Device Schema" />
          <SchemaDoc
            schema={PeripheralValidateSchema}
            title="Peripheral Schema"
          />
          <SchemaDoc schema={RegisterValidateSchema} title="Register Schema" />
          <SchemaDoc schema={FieldValidateSchema} title="Field Schema" />
          <SchemaDoc
            schema={FieldEnumValidateSchema}
            title="Field Enum Schema"
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
