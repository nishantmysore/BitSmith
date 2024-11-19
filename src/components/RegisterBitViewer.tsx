import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAccessColor } from "@/utils/access_color";
import FieldHoverCard from "@/components/FieldHoverCard";
import ValueFormatActions from "./ValueFormatActions";
import { useDevice } from "@/DeviceContext";
import type { Device, Register, Field } from "@prisma/client";

type InputFormat = "hex" | "decimal" | "binary";

interface FieldValue {
  hex: string;
  decimal: number;
  binary: string;
}

interface RegisterBitViewerProps {
  device?: Device & {
    registers: (Register & {
      fields: Field[];
    })[];
  };
}

const RegisterBitViewer: React.FC<RegisterBitViewerProps> = () => {
  const { selectedDevice } = useDevice();
  const [selectedRegister, setSelectedRegister] = React.useState<string>("");
  const [value, setValue] = React.useState<string>("");
  const [inputFormat, setInputFormat] = React.useState<InputFormat>("hex");
  const [binaryValue, setBinaryValue] = React.useState<string>("0".repeat(32));

  if (!selectedDevice) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Register Value Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No device selected
          </p>
        </CardContent>
      </Card>
    );
  }

  const parseValue = (input: string, format: InputFormat): string => {
    if (!input.trim()) return "0".repeat(32);

    try {
      let num: number;
      switch (format) {
        case "hex":
          const cleanHex = input.toLowerCase().replace(/^0x/, "");
          if (!/^[0-9a-f]+$/.test(cleanHex)) throw new Error();
          num = parseInt(cleanHex, 16);
          break;
        case "decimal":
          if (!/^\d+$/.test(input)) throw new Error();
          num = parseInt(input, 10);
          break;
        case "binary":
          if (!/^[01]+$/.test(input)) throw new Error();
          num = parseInt(input, 2);
          break;
      }

      if (isNaN(num) || num < 0 || num > 0xffffffff) throw new Error();
      return num.toString(2).padStart(32, "0");
    } catch {
      return "0".repeat(32);
    }
  };

  const getFieldValue = (msb: number, lsb: number): FieldValue => {
    const fieldBits = binaryValue.slice(31 - msb, 32 - lsb);
    const fieldValue = parseInt(fieldBits || "0", 2);

    return {
      hex: fieldValue
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil((msb - lsb + 1) / 4), "0"),
      decimal: fieldValue,
      binary: fieldBits || "0",
    };
  };

  const currentRegister = selectedRegister
    ? selectedDevice.registers.find((r) => r.id === selectedRegister)
    : null;

  const handleBitClick = (index: number) => {
    const newBinary = [...binaryValue];
    newBinary[index] = newBinary[index] === "1" ? "0" : "1";
    const newBinaryString = newBinary.join("");
    setBinaryValue(newBinaryString);

    const newNum = parseInt(newBinaryString, 2);
    setValue(
      newNum.toString(
        inputFormat === "hex" ? 16 : inputFormat === "decimal" ? 10 : 2,
      ),
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register Value Viewer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-select">Select Register</Label>
          <select
            id="register-select"
            className="w-full p-2 border rounded-md bg-background"
            value={selectedRegister}
            onChange={(e) => setSelectedRegister(e.target.value)}
          >
            <option value="">Select a register...</option>
            {selectedDevice.registers.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.address})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Input Format</Label>
          <Tabs
            defaultValue={inputFormat}
            onValueChange={(value: string) => {
              setInputFormat(value as InputFormat);
              setValue("");
              setBinaryValue("0".repeat(32));
            }}
            className="w-[400px]"
          >
            <TabsList>
              <TabsTrigger value="hex">Hex</TabsTrigger>
              <TabsTrigger value="decimal">Decimal</TabsTrigger>
              <TabsTrigger value="binary">Binary</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value-input">Enter Value</Label>
          <Input
            id="value-input"
            placeholder={`Enter ${inputFormat} value`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setBinaryValue(parseValue(e.target.value, inputFormat));
            }}
          />
        </div>

        <ValueFormatActions binaryValue={binaryValue} />

        <div className="space-y-2">
          <Label>Binary Value</Label>
          <div className="grid grid-cols-8 gap-1 text-center">
            {binaryValue.split("").map((bit, index) => (
              <div
                key={31 - index}
                className="p-1 border rounded bg-secondary text-xs cursor-pointer 
                  hover:bg-secondary/80 active:bg-secondary/60 transition-colors"
                onClick={() => handleBitClick(index)}
              >
                <div
                  className={`font-mono ${bit === "1" ? "text-red-500" : ""}`}
                >
                  {bit}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {31 - index}
                </div>
              </div>
            ))}
          </div>
        </div>

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
                      <span>0x{fieldValue.hex}</span>
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
