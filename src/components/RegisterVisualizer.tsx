"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AccessBadge from "./AccessBadge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Register, Field } from "@prisma/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface RegisterVisualizerProps {
  offsetBaseAddr: boolean;
  baseAddr: string;
  register: Register & {
    fields: Field[];
  };
}

// Helper function to calculate final address
const calculateAddress = (
  baseAddr: string,
  registerAddr: string,
  shouldOffset: boolean,
): string => {
  if (!shouldOffset) return registerAddr;

  // Convert hex strings to numbers, perform addition, convert back to hex
  const base = parseInt(baseAddr.replace("0x", ""), 16);
  const addr = parseInt(registerAddr.replace("0x", ""), 16);
  const result = base + addr;

  return "0x" + result.toString(16).toUpperCase().padStart(8, "0");
};

// Helper function to calculate field position and width
const calculateFieldDimensions = (field: Field, registerWidth: number) => {
  const [msb, lsb] = field.bits.includes(":")
    ? field.bits.split(":").map(Number)
    : [Number(field.bits), Number(field.bits)];

  const width = ((msb - lsb + 1) / registerWidth) * 100;
  const left = ((registerWidth - 1 - msb) / registerWidth) * 100;

  return { width, left, msb, lsb };
};

const RegisterVisualizer: React.FC<RegisterVisualizerProps> = ({
  register,
  baseAddr,
  offsetBaseAddr,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  // Default to 32 if width is not specified
  const registerWidth = register.width || 32;

  // Calculate final address once
  const finalAddress = calculateAddress(
    baseAddr,
    register.address,
    offsetBaseAddr,
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(finalAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-4xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild className="w-full">
          <CardHeader className="border-b hover:bg-secondary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "" : "-rotate-90"
                  }`}
                />
                <CardTitle className="text-xl font-semibold">
                  {register.name}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono">{finalAddress}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-6">
            <Alert className="mb-6">
              <AlertTitle className="text-base font-semibold">
                Description
              </AlertTitle>
              <AlertDescription className="text-base mt-2 text-muted-foreground">
                {register.description}
              </AlertDescription>
            </Alert>
            <div className="space-y-6">
              <div className="w-full h-12 bg-secondary relative rounded-md">
                {register.fields.map((field) => {
                  const { width, left } = calculateFieldDimensions(
                    field,
                    registerWidth,
                  );

                  return (
                    <div
                      key={field.name}
                      className="absolute h-full flex flex-col justify-center items-center text-xs border-r border-border"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor:
                          field.name === "RESERVED"
                            ? "hsl(var(--secondary))"
                            : "hsl(var(--primary)/0.8)",
                      }}
                    >
                      <div className="font-medium truncate w-full text-center text-foreground">
                        {field.name}
                      </div>
                      <div className="text-muted-foreground">{field.bits}</div>
                    </div>
                  );
                })}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Bits</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {register.fields.map((field) => (
                    <TableRow key={field.name}>
                      <TableCell className="font-medium">
                        {field.name}
                      </TableCell>
                      <TableCell>{field.bits}</TableCell>
                      <TableCell><AccessBadge access={field.access}/></TableCell>
                      <TableCell>{field.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RegisterVisualizer;
