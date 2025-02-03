import { redirect } from "next/navigation";
import { ClientContent } from "./ClientContent";
import { getCurrentUser } from "@/lib/session";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex-1">
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <ClientContent />
        <ScrollToTop />
      </SidebarProvider>
    </main>
  );
}
