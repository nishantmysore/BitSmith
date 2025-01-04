import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Peripheral {
  name: string;
  baseAddress: bigint;
  size: bigint;
  description?: string;
}

interface MemoryMapProps {
  peripherals: Peripheral[];
  className?: string;
  gapScale?: number; // Factor to compress gaps (default: 0.1)
  minPeripheralWidth?: number; // Minimum width percentage (default: 5)
}

export const MemoryMap: React.FC<MemoryMapProps> = ({
  peripherals,
  className,
  gapScale = 0.1,
  minPeripheralWidth = 5,
}) => {
  const sortedPeripherals = useMemo(
    () =>
      [...peripherals].sort((a, b) => (a.baseAddress < b.baseAddress ? -1 : 1)),
    [peripherals],
  );

  const safeNumber = (value: bigint) => {
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      console.warn(
        "Converting large BigInt to number might lose precision:",
        value.toString(),
      );
      return Number(value >> BigInt(0));
    }
    return Number(value);
  };

  // Improved scaling logic with gap calculation
  const { positions, totalWidth, gaps } = useMemo(() => {
    const positions = new Map<string, { start: number; width: number }>();
    const gaps: { start: number; width: number }[] = [];
    let currentPosition = 0;

    // Normalize all sizes and gaps into relative proportions
    let totalSize = 0;
    const sizes = sortedPeripherals.map((p) => safeNumber(p.size));
    const calculatedGaps = sortedPeripherals
      .slice(1)
      .map((p, i) =>
        safeNumber(
          p.baseAddress -
            (sortedPeripherals[i].baseAddress + sortedPeripherals[i].size),
        ),
      );

    totalSize =
      sizes.reduce((a, b) => a + b, 0) +
      calculatedGaps.reduce((a, b) => a + Math.max(b, 0), 0);

    const normalizedGapScale = (gapScale * 100) / totalSize;

    for (let i = 0; i < sortedPeripherals.length; i++) {
      const peripheral = sortedPeripherals[i];
      const peripheralSize = safeNumber(peripheral.size);

      // Calculate the gap before this peripheral
      if (i > 0) {
        const prevPeripheral = sortedPeripherals[i - 1];
        const gap = safeNumber(
          peripheral.baseAddress -
            (prevPeripheral.baseAddress + prevPeripheral.size),
        );
        const scaledGap = Math.log1p(Math.max(gap * normalizedGapScale, 0)); // Logarithmic scaling for gaps

        if (scaledGap > 0) {
          gaps.push({
            start: currentPosition,
            width: scaledGap,
          });
          currentPosition += scaledGap;
        }
      }

      const width = Math.max(
        (peripheralSize / totalSize) * 100, // Size proportion within the total map
        minPeripheralWidth,
      );
      positions.set(peripheral.name, { start: currentPosition, width });
      currentPosition += width;
    }

    return { positions, totalWidth: currentPosition, gaps };
  }, [sortedPeripherals, gapScale, minPeripheralWidth]);

  const formatAddress = (address: bigint) =>
    `0x${address.toString(16).toUpperCase().padStart(8, "0")}`;

  const formatSize = (size: bigint) => {
    const bytes = Number(size);
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className={cn("relative w-full h-[200px]", className)}>
      <TooltipProvider>
        <div className="relative h-20 w-full">
          {/* Render gaps */}
          {gaps.map((gap, index) => (
            <div
              key={`gap-${index}`}
              className="absolute top-0 h-full dark:[--stripe-color-1:rgba(255,255,255,0.01)] dark:[--stripe-color-2:rgba(255,255,255,0.05)]"
              style={{
                left: `${(gap.start / totalWidth) * 100}%`,
                width: `${(gap.width / totalWidth) * 100}%`,
                background: `repeating-linear-gradient(
                  45deg,
                  var(--stripe-color-1, rgba(0, 0, 0, 0.03)),
                  var(--stripe-color-1, rgba(0, 0, 0, 0.03)) 10px,
                  var(--stripe-color-2, rgba(0, 0, 0, 0.15)) 10px,
                  var(--stripe-color-2, rgba(0, 0, 0, 0.15)) 20px
                )`,
              }}
            />
          ))}

          {/* Render peripherals */}
          {sortedPeripherals.map((peripheral, index) => {
            const position = positions.get(peripheral.name)!;
            const start = (position.start / totalWidth) * 100;
            const width = (position.width / totalWidth) * 100;

            return (
              <Tooltip key={peripheral.name}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "absolute top-0 h-full border transition-colors",
                      index % 2 === 0
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "bg-secondary/20 hover:bg-secondary/30",
                    )}
                    style={{
                      left: `${start}%`,
                      width: `${width}%`,
                    }}
                  >
                    <div className="p-2 text-xs font-medium h-full flex items-center justify-center overflow-hidden">
                      <div className="truncate" style={{ width: "100%" }}>
                        {peripheral.name}
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="space-y-2">
                    <div className="font-semibold">{peripheral.name}</div>
                    {peripheral.description && (
                      <div className="text-sm text-muted-foreground">
                        {peripheral.description}
                      </div>
                    )}
                    <div className="text-sm">
                      <div>
                        Base Address: {formatAddress(peripheral.baseAddress)}
                      </div>
                      <div>Size: {formatSize(peripheral.size)}</div>
                      <div>
                        End Address:{" "}
                        {formatAddress(
                          peripheral.baseAddress + peripheral.size,
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MemoryMap;
