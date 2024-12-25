"use client";
import React, { useMemo } from "react";
import { scaleLinear } from "@visx/scale";
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
}

export const MemoryMap: React.FC<MemoryMapProps> = ({
  peripherals,
  className,
}) => {
  const sortedPeripherals = useMemo(
    () =>
      [...peripherals].sort((a, b) => (a.baseAddress < b.baseAddress ? -1 : 1)),
    [peripherals],
  );

  const minAddress = useMemo(
    () =>
      peripherals.reduce(
        (min, p) => (p.baseAddress < min ? p.baseAddress : min),
        peripherals[0].baseAddress,
      ),
    [peripherals],
  );

  const maxAddress = useMemo(
    () =>
      peripherals.reduce((max, p) => {
        const endAddress = p.baseAddress + p.size;
        return endAddress > max ? endAddress : max;
      }, peripherals[0].baseAddress + peripherals[0].size),
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

  const scale = scaleLinear({
    domain: [safeNumber(minAddress), safeNumber(maxAddress)],
    range: [0, 100],
  });

  const formatAddress = (address: bigint) =>
    `0x${address.toString(16).toUpperCase().padStart(8, "0")}`;

  const formatSize = (size: bigint) => {
    const bytes = Number(size);
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  // Calculate gaps between peripherals
  const gaps = useMemo(() => {
    const gaps = [];
    for (let i = 0; i < sortedPeripherals.length - 1; i++) {
      const currentEnd =
        sortedPeripherals[i].baseAddress + sortedPeripherals[i].size;
      const nextStart = sortedPeripherals[i + 1].baseAddress;
      if (currentEnd < nextStart) {
        gaps.push({
          start: currentEnd,
          end: nextStart,
        });
      }
    }
    return gaps;
  }, [sortedPeripherals]);

  return (
    <div className={cn("relative w-full h-[200px]", className)}>
      <TooltipProvider>
        <div className="relative h-20 w-full">
          {/* Render gaps with diagonal pattern */}
          {gaps.map((gap, index) => {
            const start = scale(safeNumber(gap.start));
            const end = scale(safeNumber(gap.end));
            const width = end - start;

            return (
              <div
                key={`gap-${index}`}
                className="border absolute top-0 h-full dark:[--stripe-color-1:rgba(255,255,255,0.01)] dark:[--stripe-color-2:rgba(255,255,255,0.05)]"
                style={{
                  left: `${start}%`,
                  width: `${width}%`,
                  background: `repeating-linear-gradient(
                      45deg,
                      var(--stripe-color-1, rgba(0, 0, 0, 0.03)),
                      var(--stripe-color-1, rgba(0, 0, 0, 0.03)) 10px,
                      var(--stripe-color-2, rgba(0, 0, 0, 0.15)) 10px,
                      var(--stripe-color-2, rgba(0, 0, 0, 0.15)) 20px
                    )`,
                }}
              />
            );
          })}

          {sortedPeripherals.map((peripheral, index) => {
            const start = scale(safeNumber(peripheral.baseAddress));
            const end = scale(
              safeNumber(peripheral.baseAddress + peripheral.size),
            );
            const width = end - start;

            // Only show name if block is wide enough
            const showName = width > 3; // Adjust threshold as needed

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
                    {showName && (
                      <div className="p-2 text-sm font-medium h-full flex items-center justify-center overflow-hidden">
                        <div
                          className="truncate max-w-[95%]"
                          style={{ width: "100%" }}
                        >
                          {peripheral.name}
                        </div>
                      </div>
                    )}
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

        <div className="left-0 right-0 flex text-xs text-muted-foreground pt-2">
          {sortedPeripherals.map((peripheral, index) => {
            const start = scale(safeNumber(peripheral.baseAddress));
            const end = scale(
              safeNumber(peripheral.baseAddress + peripheral.size),
            );

            return (
              <React.Fragment key={peripheral.name}>
                <div
                  className="absolute"
                  style={{ left: `${start}%`, transform: "translateX(-50%)" }}
                >
                  <div className="h-4 w-[1px] bg-muted-foreground/50 mx-auto" />
                  <div className="text-center">
                    {formatAddress(peripheral.baseAddress)}
                  </div>
                </div>
                {index === sortedPeripherals.length - 1 && (
                  <div
                    className="absolute"
                    style={{ left: `${end}%`, transform: "translateX(-50%)" }}
                  >
                    <div className="h-4 w-[1px] bg-muted-foreground/50 mx-auto" />
                    <div className="text-center">
                      {formatAddress(peripheral.baseAddress + peripheral.size)}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};
