import { ClientContent } from "./ClientContent";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
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
