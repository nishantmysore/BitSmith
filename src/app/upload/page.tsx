'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Checkbox } from "@/components/ui/checkbox";
import { Prisma, AccessType } from '@prisma/client';

// Use Prisma's generated types, excluding auto-generated fields
type DeviceCreateInput = Omit<Prisma.DeviceCreateInput, 'registers'> & {
  registers: Record<string, {
    name: string;
    address: string;
    fields: Array<{
      name: string;
      bits: string;
      access: AccessType;
      description: string;
    }>;
  }>;
};

const DeviceConfigUpload = ({ userId }: { userId: string }) => {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [registersJson, setRegistersJson] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  const validateConfig = (): DeviceCreateInput => {
    try {
      if (!deviceId.trim()) throw new Error('Device ID is required');
      if (!deviceName.trim()) throw new Error('Device Name is required');
      if (!deviceDescription.trim()) throw new Error('Device Description is required');
      if (!userId) throw new Error('User ID is required');

      // Parse and validate registers JSON
      const registers: DeviceCreateInput['registers'] = JSON.parse(registersJson);
      
      if (typeof registers !== 'object' || Object.keys(registers).length === 0) {
        throw new Error('At least one register must be defined');
      }

      // Validate each register and its fields
      Object.entries(registers).forEach(([key, register]) => {
        if (!register.name || !register.address || !Array.isArray(register.fields)) {
          throw new Error(`Invalid register configuration for ${key}`);
        }

        // Validate fields and ensure access type is valid
        register.fields.forEach((field, index) => {
          if (!field.name || !field.bits || !field.access || !field.description) {
            throw new Error(`Invalid field configuration in register ${key} at index ${index}`);
          }
          if (!Object.values(AccessType).includes(field.access)) {
            throw new Error(`Invalid access type "${field.access}" in register ${key} field ${index}`);
          }
        });
      });

      return {
        id: deviceId,
        name: deviceName,
        description: deviceDescription,
        isPublic,
        owner: {
          connect: { id: userId }
        },
        registers
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Invalid configuration format');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsUploading(true);

    try {
      const config = validateConfig();

      const response = await fetch('/api/device-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {   
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload configuration');
      }

      toast({
        title: "Success",
        description: "Device configuration uploaded successfully",
      });

      // Clear form
      setDeviceId('');
      setDeviceName('');
      setDeviceDescription('');
      setIsPublic(false);
      setRegistersJson('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload configuration');
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to upload configuration',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Device Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-id">Device ID</Label>
            <Input
              id="device-id"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="e.g., adc"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-name">Device Name</Label>
            <Input
              id="device-name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., ADC Controller"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-description">Device Description</Label>
            <Input
              id="device-description"
              value={deviceDescription}
              onChange={(e) => setDeviceDescription(e.target.value)}
              placeholder="e.g., 12-bit ADC with DMA capabilities"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is-public"
              checked={isPublic}
              onCheckedChange={(checked: boolean) => setIsPublic(checked)}
            />
            <Label 
              htmlFor="is-public" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this device public
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registers-json">Registers Configuration</Label>
            <Textarea
              id="registers-json"
              value={registersJson}
              onChange={(e) => setRegistersJson(e.target.value)}
              placeholder={`Paste registers JSON here...
Example format:
{
  "reg1": {
    "name": "Control Register",
    "address": "0x00",
    "fields": [
      {
        "name": "Enable",
        "bits": "0",
        "access": "RW",
        "description": "Enable the device"
      }
    ]
  }
}`}
              className="font-mono min-h-[400px]"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-4">
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Configuration"}
            </Button>
            <Toaster />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceConfigUpload;
