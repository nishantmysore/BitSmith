"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDevices = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/public-devices?search=${searchTerm}`);
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
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
  }, [search]);

  const copyDevice = async (device: Device) => {
    setSelectedDevice(device);
    setIsProcessing(true);

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

      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error copying device:", error);
      setShowErrorDialog(true);
    } finally {
      setIsProcessing(false);
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
          <div className="text-center">Loading...</div>
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
                    disabled={isProcessing}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Device Copied Successfully</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedDevice?.name} has been added to your devices.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                Failed to copy {selectedDevice?.name}. Please try again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
}
