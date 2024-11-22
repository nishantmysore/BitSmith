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
import { Register, Field } from "@prisma/client";
import { Plus, RotateCw } from "lucide-react";
import { FormData, FormErrors, RegisterError } from "@/types/validation";
import { isValidHexAddress, isValidRegisterWidth, hasRegisterAddressCollision } from "@/utils/validation";
import { AccessType } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingUpdate {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: Partial<Register | Field>;
}

type RegisterWithRelations = Register & {
    fields: {
      id: string;
      name: string;
      bits: string;
      access: AccessType;
      description: string;
      registerId: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  };


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
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);

  useEffect(() => {
    if (selectedDevice) {
      setFormData({
        name: selectedDevice.name,
        description: selectedDevice.description,
        base_address: selectedDevice.base_address,
        isPublic: selectedDevice.isPublic,
        registers: JSON.parse(JSON.stringify(selectedDevice.registers)),
      });
      // Reset errors and touched state when switching devices
      setErrors({});
      setTouched(new Set());
    }
  }, [selectedDevice]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate device name
    if (!formData.name.trim()) {
      newErrors.name = "Device name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Device name must be less than 100 characters";
    }
    
    // Validate description length if provided
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    
    // Validate base address
    if (!formData.base_address) {
      newErrors.base_address = "Base address is required";
    } else if (!isValidHexAddress(formData.base_address)) {
      newErrors.base_address = "Invalid hex address format";
    }
    
    // Validate registers
    const registerErrors: FormErrors['registers'] = {};
    formData.registers.forEach((register, index) => {
      const registerError: RegisterError = {};
      
      if (!register.name.trim()) {
        registerError.name = "Register name is required";
      }
      
      if (!register.address) {
        registerError.address = "Register address is required";
      } else if (!isValidHexAddress(register.address)) {
        registerError.address = "Invalid hex address format";
      } else if (hasRegisterAddressCollision(formData.registers, register)) {
        registerError.address = "Register address must be unique";
      }
      
      if (!isValidRegisterWidth(register.width)) {
        registerError.width = "Invalid register width";
      }
      
      if (Object.keys(registerError).length > 0) {
        registerErrors[register.id || `new_${index}`] = registerError;
      }
    });
    
    if (Object.keys(registerErrors).length > 0) {
      newErrors.registers = registerErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
    validateForm();
  };

  const handleSubmit = async () => {
    if (!selectedDevice?.id) return;
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please correct the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Optimistically update the UI
    const previousState = { ...formData };
    
    try {
      const response = await fetch(`/api/devices/${selectedDevice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pendingUpdates, // Send pending updates to track what changed
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update device");
      }

      const updatedDevice = await response.json();
      setSelectedDevice(updatedDevice);
      setPendingUpdates([]); // Clear pending updates after successful save

      toast({
        title: "Success",
        description: "Device updated successfully",
      });
    } catch (error) {
      // Revert to previous state on error
      setFormData(previousState);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createNewRegister = (): RegisterWithRelations => ({
    id: `temp_${Date.now()}`,
    name: "",
    address: "",
    width: 32,
    description: "",
    deviceId: selectedDevice?.id ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
    fields: [],
  });

  const handleReset = () => {
    if (selectedDevice) {
      setFormData({
        name: selectedDevice.name,
        description: selectedDevice.description,
        base_address: selectedDevice.base_address,
        isPublic: selectedDevice.isPublic,
        registers: JSON.parse(JSON.stringify(selectedDevice.registers)),
      });
      setErrors({});
      setTouched(new Set());
    }
  };

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
          <CardTitle className="text-lg font-semibold">Device Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => handleBlur('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {touched.has('name') && errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => handleBlur('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {touched.has('description') && errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_address">Base Address</Label>
            <Input
              id="base_address"
              value={formData.base_address}
              onChange={(e) => setFormData({ ...formData, base_address: e.target.value })}
              onBlur={() => handleBlur('base_address')}
              className={errors.base_address ? 'border-red-500' : ''}
            />
            {touched.has('base_address') && errors.base_address && (
              <p className="text-sm text-red-500">{errors.base_address}</p>
            )}
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
                errors={errors.registers?.[register.id || `new_${index}`] || {}}
                touched={touched}
                onBlur={(field: string) => 
                  handleBlur(`registers.${register.id || `new_${index}`}.${field}`)
                }
                onChange={(updatedRegister) => {
                  const newRegisters = [...formData.registers];
                  newRegisters[index] = {
                    ...updatedRegister,
                    fields: formData.registers[index].fields
                  };
                  setFormData({ ...formData, registers: newRegisters });
                  validateForm();
                }}
                onDelete={() => {
                  const newRegisters = formData.registers.filter(
                    (_, i) => i !== index
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
            <Plus className="mr-2 h-4 w-4" />
            Add Register
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleReset}>
          <RotateCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
