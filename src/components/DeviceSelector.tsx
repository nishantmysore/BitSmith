'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDevice } from "../DeviceContext";

export const DeviceSelector = () => {
  const { selectedDevice, setSelectedDevice, devices } = useDevice();

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
                  {device.name} - {device.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
