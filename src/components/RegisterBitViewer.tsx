// src/components/RegisterBitViewer.tsx
"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAccessColor } from '@/utils/access_color';
import FieldHoverCard from "@/components/FieldHoverCard"
import ValueFormatActions from './ValueFormatActions';
import { useDevice } from "@/DeviceContext";

type InputFormat = 'hex' | 'decimal' | 'binary';

const RegisterBitViewer = () => {
  const [selectedRegister, setSelectedRegister] = React.useState<string>("");
  const [value, setValue] = React.useState<string>("");
  const [inputFormat, setInputFormat] = React.useState<InputFormat>('hex');
  const [binaryValue, setBinaryValue] = React.useState<string>("".padStart(32, '0'));

  const { selectedDevice } = useDevice();
  if (!selectedDevice) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Register Value Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No device selected</p>
        </CardContent>
      </Card>
    );
  }

  // Convert input to binary based on selected format
  const handleValueChange = (input: string) => {
    setValue(input);
    
    if (!input.trim()) {
      setBinaryValue("".padStart(32, '0'));
      return;
    }

    try {
      let num: number;
      
      switch (inputFormat) {
        case 'hex':
          // Remove 0x prefix if present
          input = input.toLowerCase().replace(/^0x/, '');
          if (!/^[0-9a-f]+$/.test(input)) {
            throw new Error('Invalid hex value');
          }
          num = parseInt(input, 16);
          break;

        case 'decimal':
          if (!/^\d+$/.test(input)) {
            throw new Error('Invalid decimal value');
          }
          num = parseInt(input, 10);
          break;

        case 'binary':
          if (!/^[01]+$/.test(input)) {
            throw new Error('Invalid binary value');
          }
          num = parseInt(input, 2);
          break;
      }

      // Validate the number
      if (isNaN(num) || num < 0 || num > 0xFFFFFFFF) {
        setBinaryValue("".padStart(32, '0'));
        return;
      }

      // Convert to 32-bit binary string
      const binary = num.toString(2).padStart(32, '0');
      setBinaryValue(binary);
    } catch {
      setBinaryValue("".padStart(32, '0'));
    }
  };

  // Get input placeholder based on format
  const getPlaceholder = () => {
    switch (inputFormat) {
      case 'hex':
        return 'Enter hex value (e.g., FF or 0xFF)';
      case 'decimal':
        return 'Enter decimal value (e.g., 255)';
      case 'binary':
        return 'Enter binary value (e.g., 11111111)';
    }
  };

  // Get current register definition
  const currentRegister = selectedRegister 
    ? selectedDevice.registers[selectedRegister as keyof typeof selectedDevice.registers]
    : null;

  const getFieldValue = (msb: number, lsb: number) => {
    const fieldBits = binaryValue.slice(31 - msb, 32 - lsb);
    if (!fieldBits) return { hex: '0', decimal: 0, binary: '0' };
    
    const fieldValue = parseInt(fieldBits, 2);
    return {
      hex: fieldValue.toString(16).toUpperCase().padStart(Math.ceil((msb - lsb + 1) / 4), '0'),
      decimal: fieldValue,
      binary: fieldBits
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register Value Viewer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Register Selection */}
        <div className="space-y-2">
          <Label htmlFor="register-select">Select Register</Label>
          <select
            id="register-select"
            className="w-full p-2 border rounded-md bg-background"
            value={selectedRegister}
            onChange={(e) => setSelectedRegister(e.target.value)}
          >
            <option value="">Select a register...</option>
            {Object.entries(selectedDevice.registers).map(([key, reg]) => (
              <option key={key} value={key}>
                {reg.name} ({reg.address})
              </option>
            ))}
          </select>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Input Format</Label>
          <RadioGroup
            value={inputFormat}
            onValueChange={(value) => {
              setInputFormat(value as InputFormat);
              setValue(''); // Clear input when changing format
              setBinaryValue("".padStart(32, '0'));
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hex" id="hex" />
              <Label htmlFor="hex">Hex</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="decimal" id="decimal" />
              <Label htmlFor="decimal">Decimal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="binary" id="binary" />
              <Label htmlFor="binary">Binary</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Value Input */}
        <div className="space-y-2">
          <Label htmlFor="value-input">Enter Value</Label>
          <Input
            id="value-input"
            placeholder={getPlaceholder()}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        </div>


          {/* Add Value Format Actions */}
          <ValueFormatActions binaryValue={binaryValue} />
        {/* Bit Display */}
        <div className="space-y-2">
          <Label>Binary Value</Label>
          <div className="grid grid-cols-8 gap-1 text-center">
            {binaryValue.split('').map((bit, index) => (
              <div
                key={31 - index}
                className={`p-1 border rounded bg-secondary text-xs cursor-pointer 
                  hover:bg-secondary/80 active:bg-secondary/60 transition-colors`}
                onClick={() => {
                  const newBinary = binaryValue.split('');
                  newBinary[index] = bit === '1' ? '0' : '1';
                  const newBinaryString = newBinary.join('');
                  setBinaryValue(newBinaryString);

                  // Update the input value based on current format
                  const newNum = parseInt(newBinaryString, 2);
                  switch(inputFormat) {
                    case 'hex':
                      setValue(newNum.toString(16).toUpperCase());
                      break;
                    case 'decimal':
                      setValue(newNum.toString(10));
                      break;
                    case 'binary':
                      setValue(newBinaryString);
                      break;
                  }
                }}
              >
                <div className={`font-mono ${bit === '1' ? 'text-red-500' : ''}`}>
                  {bit}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {31 - index}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Field Values */}
        {currentRegister && (
          <div className="space-y-2">
            <Label>Field Values</Label>
            <div className="space-y-1">
              {currentRegister.fields.map((field) => {
                const [msb, lsb] = field.bits.includes(":")
                  ? field.bits.split(":").map(Number)
                  : [Number(field.bits), Number(field.bits)];
                
                const fieldValue = getFieldValue(msb, lsb);

                return (
                  <div
                    key={field.name}
                    className={`relative group flex justify-between items-center p-2 
                      rounded transition-colors cursor-pointer
                      ${getAccessColor(field.access)}`}
                  >
                    <span className="font-medium">{field.name}</span>
                    <div className="space-x-2 text-sm">
                      <span className="text-muted-foreground">
                        [{field.bits}]
                      </span>
                      <span>
                        0x{fieldValue.hex}
                      </span>
                      <span className="text-muted-foreground">
                        ({fieldValue.decimal})
                      </span>
                    </div>

                    <FieldHoverCard field={field} fieldValue={fieldValue} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegisterBitViewer;
