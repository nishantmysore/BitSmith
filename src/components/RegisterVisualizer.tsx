import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const RegisterVisualizer = () => {
  // Example register definition
  const register = {
    name: "CTRL",
    address: "0x0000",
    fields: [
      { name: "MODE", bits: "31:30", access: "RW", description: "Operating Mode" },
      { name: "INT_EN", bits: "29", access: "RW", description: "Interrupt Enable" },
      { name: "RESERVED", bits: "28:16", access: "RO", description: "Reserved" },
      { name: "DATA", bits: "15:0", access: "RW", description: "Data Buffer" }
    ]
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{register.name}</CardTitle>
          <span className="text-xl font-semibold">Address: {register.address}</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="w-full h-12 bg-secondary relative rounded-md">
            {register.fields.map((field) => {
              const [msb, lsb] = field.bits.includes(":") 
                ? field.bits.split(":").map(Number)
                : [Number(field.bits), Number(field.bits)];
              
              const width = ((msb - lsb + 1) / 32) * 100;
              const left = ((31 - msb) / 32) * 100;
              
              return (
                <div
                  key={field.name}
                  className="absolute h-full flex flex-col justify-center items-center text-xs border-r border-border"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: field.name === "RESERVED" 
                      ? 'hsl(var(--secondary))' 
                      : 'hsl(var(--primary) / 0.1)'
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
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell>{field.bits}</TableCell>
                  <TableCell>{field.access}</TableCell>
                  <TableCell>{field.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterVisualizer;
