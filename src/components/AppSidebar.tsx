"use client";
import { Home, Settings, Upload, Search, BookOpen, Mail } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ModeToggle";
import { clearDevicesCache } from "@/utils/cache";
import { useRouter } from "next/navigation";

const deviceLibraryItems = [
  {
    title: "View Device Maps",
    url: "/home",
    icon: Home,
  },
  {
    title: "Public Devices",
    url: "/public",
    icon: Search,
  },
];

const deviceManagementItems = [
  {
    title: "My Devices",
    url: "/mydevices",
    icon: Settings,
  },
  {
    title: "Upload New Device",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Device Schema",
    url: "/schema",
    icon: BookOpen,
  },
];

const supportItems = [
  {
    title: "Contact Us",
    url: "mailto:nishant@cybersphereholdings.com",
    icon: Mail,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="text-xl font-semibold">
        <div className="flex w-full justify-between items-center">
          <div
            className="bitsmith"
            onClick={() => router.push("/home")}
            style={{ cursor: "pointer" }}
          >
            BitSmith
          </div>
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Device Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {deviceLibraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Device Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {deviceManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {session?.user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    {session.user.email}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <span>Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      clearDevicesCache(session.user.id);
                      signOut({ callbackUrl: "/login" });
                    }}
                  >
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
