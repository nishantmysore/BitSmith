"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Device {
  id: string;
  name: string;
  description: string;
  version?: string;
}

export default function PublicDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const { toast } = useToast();

  const fetchDevices = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/my-devices?search=${searchTerm}`);
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch devices. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = debounce((searchTerm: string) => {
    fetchDevices(searchTerm);
  }, 300);

  useEffect(() => {
    debouncedFetch(search);
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch, search]);

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;

    try {
      const response = await fetch(`/api/devices/${deviceToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete device");
      }

      toast({
        title: "Success",
        description: "Device deleted successfully.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete Device: " + error,
        variant: "destructive",
      });
    } finally {
      setDeviceToDelete(null);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Devices</h1>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card
                key={device.id}
                className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{device.name}</CardTitle>
                    <CardDescription>
                      {device.description}
                      {device.version && (
                        <span className="text-sm text-muted-foreground block mt-2">
                          Version: {device.version}
                        </span>
                      )}
                    </CardDescription>
                  </div>

                  <AlertDialog
                    open={!!deviceToDelete}
                    onOpenChange={(open) => !open && setDeviceToDelete(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-auto hover:bg-secondary"
                        title="Delete Device"
                        onClick={() => handleDeleteClick(device)}
                      >
                        <Trash className="h-4 w-4" color="red" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the device `{deviceToDelete?.name}` and remove
                          its data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
