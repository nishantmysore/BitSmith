'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"

const DeviceConfigUpload = () => {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [registersJson, setRegistersJson] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  const validateConfig = () => {
    try {
      // Parse the registers JSON
      console.log('Raw string:', JSON.stringify(registersJson));
      const registers = JSON.parse(registersJson);
      console.log("Registers: ", registers)

      // Basic validation of required fields
      if (!deviceId.trim()) throw new Error('Device ID is required');
      if (!deviceName.trim()) throw new Error('Device Name is required');
      if (!deviceDescription.trim()) throw new Error('Device Description is required');
      if (!registers || typeof registers !== 'object') {
        throw new Error('Invalid registers format. Expected an object.');
      }
      if (Object.keys(registers).length === 0) {
        throw new Error('At least one register must be defined');
      }

      // Validate each register
      Object.entries(registers).forEach(([key, register]: [string, any]) => {
        if (!register.name || !register.address || !Array.isArray(register.fields)) {
          throw new Error(`Invalid register configuration for ${key}`);
        }

        // Validate fields
        register.fields.forEach((field: any, index: number) => {
          if (!field.name || !field.bits || !field.access || !field.description) {
            throw new Error(`Invalid field configuration in register ${key} at index ${index}`);
          }
        });
      });

      return {
        id: deviceId,
        name: deviceName,
        description: deviceDescription,
        registers: registers
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

      // Call API to upload configuration
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

      // Optional: Clear form after successful upload
      setDeviceId('');
      setDeviceName('');
      setDeviceDescription('');
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      
      // Check if this is a full device config or just registers
      if (parsed.id) {
        // Full device config
        setDeviceId(parsed.id);
        setDeviceName(parsed.name);
        setDeviceDescription(parsed.description);
        if (parsed.registers) {
          setRegistersJson(JSON.stringify(parsed.registers, null, 2));
        }
      } else {
        // Just registers
        setRegistersJson(JSON.stringify(parsed, null, 2));
      }
    } catch (err) {
      setError('Failed to parse clipboard content');
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Device Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Basic Device Information */}
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

          {/* Registers JSON Input */}
          <div className="space-y-2">
            <Label htmlFor="registers-json">Registers Configuration</Label>
            <Textarea
              id="registers-json"
              value={registersJson}
              onChange={(e) => setRegistersJson(e.target.value)}
              placeholder="Paste registers JSON here..."
              className="font-mono min-h-[400px]"
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Configuration"}
            </Button>
            <Button 
              onClick={handlePaste} 
              variant="outline" 
              className="w-full"
              disabled={isUploading}
            >
              Paste from Clipboard
            </Button>
                  <Toaster />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceConfigUpload;
