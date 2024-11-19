"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Register, Field } from "@prisma/client"

interface RegisterVisualizerProps {
  register: Register & {
  fields: Field[]
  };
}

const RegisterVisualizer: React.FC<RegisterVisualizerProps> = ({ register }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="w-full max-w-4xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="border-b hover:bg-secondary/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? '' : '-rotate-90'
                  }`}
                />
                <CardTitle className="text-xl font-semibold">{register.name}</CardTitle>
              </div>
              <span className="text-xl font-semibold">Address: {register.address}</span>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="w-full h-12 bg-secondary relative rounded-md">
                {register.fields.map((field : Field) => {
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
                          : 'hsl(var(--primary)/0.8)'
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
                  {register.fields.map((field : Field) => (
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RegisterVisualizer;
