import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAccessStyles } from "@/lib/access_colors";
import FieldHoverCard from "@/components/FieldHoverCard";
import ValueFormatActions from "./ValueFormatActions";
import type { Register, Field } from "@prisma/client";

type InputFormat = "hex" | "decimal" | "binary";

interface FieldValue {
  hex: string;
  decimal: bigint;
  binary: string;
}

interface RegisterBitViewerProps {
  register: Register & {
    fields: Field[];
  };
}

const RegisterBitViewer: React.FC<RegisterBitViewerProps> = ({ register }) => {
  const [value, setValue] = React.useState<string>("");
  const [inputFormat, setInputFormat] = React.useState<InputFormat>("hex");

  // Get current register width or default to 32
  const registerWidth = register?.width || 32;

  const [binaryValue, setBinaryValue] = React.useState<string>(() =>
    "0".repeat(registerWidth),
  );

  if (!register) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Register Value Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No device/register selected
          </p>
        </CardContent>
      </Card>
    );
  }

  const parseValue = (
    input: string,
    format: InputFormat,
    width: number,
  ): string => {
    if (!input.trim()) return "0".repeat(width);

    try {
      let num: bigint;
      switch (format) {
        case "hex":
          const cleanHex = input.toLowerCase().replace(/^0x/, "");
          if (!/^[0-9a-f]+$/.test(cleanHex)) throw new Error();
          num = BigInt(`0x${cleanHex}`);
          break;
        case "decimal":
          if (!/^\d+$/.test(input)) throw new Error();
          num = BigInt(input);
          break;
        case "binary":
          if (!/^[01]+$/.test(input)) throw new Error();
          num = BigInt(`0b${input}`);
          break;
      }

      const maxValue = (BigInt(1) << BigInt(width)) - BigInt(1);
      if (num < 0 || num > maxValue) throw new Error();

      return num.toString(2).padStart(width, "0");
    } catch {
      return "0".repeat(width);
    }
  };

  const getFieldValue = (msb: number, lsb: number): FieldValue => {
    const fieldBits = binaryValue.slice(
      registerWidth - 1 - msb,
      registerWidth - lsb,
    );
    const fieldValue = BigInt(`0b${fieldBits || "0"}`);

    return {
      hex: fieldValue
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil((msb - lsb + 1) / 4), "0"),
      decimal: fieldValue,
      binary: fieldBits || "0",
    };
  };

  const handleBitClick = (index: number) => {
    const newBinary = [...binaryValue];
    newBinary[index] = newBinary[index] === "1" ? "0" : "1";
    const newBinaryString = newBinary.join("");
    setBinaryValue(newBinaryString);

    const newNum = BigInt(`0b${newBinaryString}`);
    setValue(
      newNum.toString(
        inputFormat === "hex" ? 16 : inputFormat === "decimal" ? 10 : 2,
      ),
    );
  };

  return (
    <div className="w-full p-4">
      <div className="space-y-2">
        <Label>Input Format</Label>
        <Tabs
          defaultValue={inputFormat}
          onValueChange={(value: string) => {
            setInputFormat(value as InputFormat);
            setValue("");
            setBinaryValue("0".repeat(registerWidth));
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
            setBinaryValue(
              parseValue(e.target.value, inputFormat, registerWidth),
            );
          }}
        />
      </div>

      <ValueFormatActions binaryValue={binaryValue} />

      <div className="space-y-2">
        <Label>Binary Value</Label>
        <div className="grid grid-cols-8 gap-1 text-center">
          {binaryValue.split("").map((bit, index) => (
            <div
              key={registerWidth - 1 - index}
              className="p-1 border rounded bg-secondary text-xs cursor-pointer 
                  hover:bg-secondary/80 active:bg-secondary/60 transition-colors"
              onClick={() => handleBitClick(index)}
            >
              <div className={`font-mono ${bit === "1" ? "text-red-500" : ""}`}>
                {bit}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {registerWidth - 1 - index}
              </div>
            </div>
          ))}
        </div>
      </div>

      {register && (
        <div className="space-y-2">
          <Label>Field Values</Label>
          <div className="space-y-1">
            {register.fields.map((field) => {
              const [msb, lsb] = field.bits.includes(":")
                ? field.bits.split(":").map(Number)
                : [Number(field.bits), Number(field.bits)];

              const fieldValue = getFieldValue(msb, lsb);

              return (
                <div
                  key={field.name}
                  className={`relative group flex justify-between items-center p-2 
                      rounded transition-colors cursor-pointer
                      ${getAccessStyles(field.access)}`}
                >
                  <span className="font-medium">{field.name}</span>
                  <div className="space-x-2 text-sm">
                    <span className="">[{field.bits}]</span>
                    <span>0x{fieldValue.hex}</span>
                    <span className="">({fieldValue.decimal.toString()})</span>
                  </div>
                  <FieldHoverCard field={field} fieldValue={fieldValue} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterBitViewer;
