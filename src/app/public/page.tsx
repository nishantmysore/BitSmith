"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

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
  const [copyingDevices, setCopyingDevices] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchDevices = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/public-devices?search=${searchTerm}`);
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

  const copyDevice = async (device: Device) => {
    setCopyingDevices((prev) => new Set(prev).add(device.id));

    try {
      const response = await fetch("/api/devices/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId: device.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to copy device");
      }

      toast({
        title: "Success",
        description: `${device.name} has been added to your devices.`,
      });
    } catch (error) {
      console.error("Error copying device:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to copy ${device.name}. Please try again later.`,
      });
    } finally {
      setCopyingDevices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(device.id);
        return newSet;
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Public Devices</h1>
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto hover:bg-secondary"
                    title="Add to my devices"
                    onClick={() => copyDevice(device)}
                    disabled={copyingDevices.has(device.id)}
                  >
                    {copyingDevices.has(device.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
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
