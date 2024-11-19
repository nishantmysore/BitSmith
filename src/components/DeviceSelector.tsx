'use client';

import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import { useDevice } from "../DeviceContext";
export const DeviceSelector = () => {
  const {selectedDevice, setSelectedDevice, devices, baseAddr, setBaseAddr, offsetBaseAddr, setOffsetBaseAddr } = useDevice();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Device Selection

          <Select
            value={selectedDevice?.id}
            onValueChange={(deviceId) => {
              const device = devices.find(d => d.id === deviceId);
              if (device) setSelectedDevice(device);
            }}
          >
            <SelectTrigger className="w-[280px]">
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
        </CardTitle>
        <div className="flex items-center justify-end gap-4 mt-4">
          <Label htmlFor="base-addr-input text-sm">Base Address</Label>
          <Input id="base-addr-input" className="w-fit font-medium text-xs" value={baseAddr}
              onChange={(e) => setBaseAddr(e.target.value)}/>
        </div>
        <div className="flex items-center justify-end gap-4 mt-4">
          <Label htmlFor="offset-base_addr">Offset Registers</Label>
          <Switch id="offset-base_addr" className="" checked={offsetBaseAddr}

          onCheckedChange={(checked: boolean) => setOffsetBaseAddr(checked)}
          />
        </div>
      </CardHeader>
    </Card>
  );
};
