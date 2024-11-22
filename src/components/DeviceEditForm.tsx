"use client";

import { useState, useEffect } from "react";
import { useDevice } from "@/DeviceContext";
import { DeviceSelector } from "@/components/DeviceSelector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { RegisterEditor } from "./RegisterEditor";
import { Register } from "@prisma/client";
import { Plus, RotateCw } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormData {
  name: string;
  description: string;
  base_address: string;
  isPublic: boolean;
  registers: Register[];
}

export function DeviceEditForm() {
  const { selectedDevice, setSelectedDevice, devices } = useDevice();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    base_address: "",
    isPublic: false,
    registers: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDevice) {
      setFormData({
        name: selectedDevice.name,
        description: selectedDevice.description,
        base_address: selectedDevice.base_address,
        isPublic: selectedDevice.isPublic,
        registers: selectedDevice.registers,
      });
    }
  }, [selectedDevice]);

  const handleSubmit = async () => {
    if (!selectedDevice?.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/devices/${selectedDevice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update device");
      }

      const updatedDevice = await response.json();
      setSelectedDevice(updatedDevice);

      toast({
        title: "Success",
        description: "Device updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a new register with required fields
  const createNewRegister = (): Register => ({
    id: "", // Will be t by the server
    name: "",
    address: "",
    width: 32,
    description: "",
    deviceId: selectedDevice?.id ?? "",
    fields: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!selectedDevice) {
    return (
      <div className="space-y-6">
        <DeviceSelector />
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please select a device to edit
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Device Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Selection Section */}
          <div className="space-y-3">
            <Select
              value={selectedDevice?.id}
              onValueChange={(deviceId) => {
                const device = devices.find((d) => d.id === deviceId);
                if (device) setSelectedDevice(device);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_address">Base Address</Label>
            <Input
              id="base_address"
              value={formData.base_address}
              onChange={(e) =>
                setFormData({ ...formData, base_address: e.target.value })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublic: checked })
              }
            />
            <Label htmlFor="public">Public Device</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registers</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {formData.registers.map((register, index) => (
              <RegisterEditor
                key={register.id || index}
                register={register}
                onChange={(updatedRegister) => {
                  const newRegisters = [...formData.registers];
                  newRegisters[index] = updatedRegister;
                  setFormData({ ...formData, registers: newRegisters });
                }}
                onDelete={() => {
                  const newRegisters = formData.registers.filter(
                    (_, i) => i !== index,
                  );
                  setFormData({ ...formData, registers: newRegisters });
                }}
              />
            ))}
          </Accordion>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setFormData({
                ...formData,
                registers: [...formData.registers, createNewRegister()],
              });
            }}
          >
          <Plus/>
            Add Register
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() =>
            setFormData({
              name: selectedDevice.name,
              description: selectedDevice.description,
              base_address: selectedDevice.base_address,
              isPublic: selectedDevice.isPublic,
              registers: selectedDevice.registers,
            })
          }
        >
          <RotateCw/>
          Reset
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
