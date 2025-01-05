"use client";

import React from "react";
import { ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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
import { Register, Field, FieldEnum } from "@prisma/client";
import RegisterBitViewer from "./RegisterBitViewer";
import { Separator } from "@/components/ui/separator";
import { getAccessStyles } from "@/lib/access_colors";
import { convertToHexString } from "@/utils/validation";
import {
  EyeIcon,
  EyeOffIcon,
  RulerIcon,
  LockIcon,
  RefreshCwIcon,
  FilterIcon,
  BookOpenIcon,
  PencilIcon,
  EditIcon,
  ChevronRight,
} from "lucide-react";

interface RegisterVisualizerProps {
  baseAddr: bigint;
  register: Register & {
    fields: (Field & {
      enumeratedValues?: FieldEnum[];
    })[];
  };
}
const createBitString = (field: Field): String => {
  const bitString =
    field.bitWidth === 1
      ? `${field.bitOffset}`
      : `${field.bitOffset + field.bitWidth - 1}:${field.bitOffset}`;
  return bitString;
};

// Helper function to calculate field position and width
const calculateFieldDimensions = (field: Field, registerWidth: number) => {
  const [msb, lsb] = [field.bitOffset + field.bitWidth - 1, field.bitOffset];

  const width = ((msb - lsb + 1) / registerWidth) * 100;
  const left = ((registerWidth - 1 - msb) / registerWidth) * 100;

  return { width, left, msb, lsb };
};

type Gap = {
  start: number;
  end: number;
};

const findGaps = (fields: Field[], registerWidth: number): Gap[] => {
  // Sort fields by bitOffset
  const sortedFields = [...fields].sort((a, b) => a.bitOffset - b.bitOffset);

  const gaps: Gap[] = [];
  let currentPosition = 0;

  sortedFields.forEach((field) => {
    if (field.bitOffset > currentPosition) {
      gaps.push({
        start: currentPosition,
        end: field.bitOffset - 1,
      });
    }
    currentPosition = field.bitOffset + field.bitWidth;
  });

  // Check if there's a gap after the last field
  if (currentPosition < registerWidth) {
    gaps.push({
      start: currentPosition,
      end: registerWidth - 1,
    });
  }

  return gaps;
};

const GapComponent = ({
  gap,
  registerWidth,
}: {
  gap: Gap;
  registerWidth: number;
}) => {
  const width = ((gap.end - gap.start + 1) / registerWidth) * 100;
  const left = ((registerWidth - 1 - gap.end) / registerWidth) * 100;

  return (
    <div
      className={`absolute h-full flex flex-col justify-center items-center text-sm border  border-border rounded ${getAccessStyles("RSVD")}/100`}
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
    >
      <div className="font-medium text-xs text-gray-500">
        {gap.end === gap.start ? gap.end : `${gap.end}:${gap.start}`}
      </div>
    </div>
  );
};

const RegisterVisualizer: React.FC<RegisterVisualizerProps> = ({
  register,
  baseAddr,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isCopied, setIsCopied] = React.useState(false);
  const [showBitViewer, setShowBitViewer] = React.useState(false);
  const [expandedField, setExpandedField] = React.useState<string | null>(null);

  // Default to 32 if width is not specified
  const registerWidth = register.width || 32;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      convertToHexString(baseAddr + register.addressOffset),
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  interface PropertyItemProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
  }

  const PropertyItem = ({ icon, label, value }: PropertyItemProps) => (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/20 transition-colors duration-200">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );

  const EnumContent = ({ enums }: { enums: FieldEnum[] }) => (
    <Card>
      <CardTitle className="p-4 text-sm"> Field Enums </CardTitle>
      <Table>
        {/* Table Header */}
        <TableHeader className="border-b">
          <TableRow>
            <TableHead className="text-left font-semibold">Name</TableHead>
            <TableHead className="text-left font-semibold">Value</TableHead>
            <TableHead className="text-left font-semibold">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {enums.map((enumItem) => (
            <TableRow
              key={enumItem.name}
              className="hover:bg-muted/50 transition-colors border-b last:border-b-0"
            >
              <TableCell className="text-xs ">{enumItem.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {enumItem.value}
              </TableCell>
              <TableCell>
                <span
                  className="truncate block max-w-[400px] text-muted-foreground"
                  title={enumItem.description ?? ""}
                >
                  {enumItem.description}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div id={`register-${register.name}`} className="px-2">
      <Card className="w-full">
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
                  <span className="text-xl font-mono">
                    {convertToHexString(
                      BigInt(baseAddr) + BigInt(register.addressOffset),
                    )}
                  </span>
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
            <div className="flex w-full justify-between">
              <div
                className={`transition-all duration-300 ease-in-out ${showBitViewer ? "w-2/3" : "w-full"}`}
              >
                <CardContent className="p-6">
                  <Card className="w-full mb-4">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold">
                          Description
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:shadow-md transition-all duration-200"
                          onClick={() => setShowBitViewer(!showBitViewer)}
                        >
                          {showBitViewer ? (
                            <>
                              <EyeOffIcon className="mr-2 h-3 w-3" />
                              Hide Bit Viewer
                            </>
                          ) : (
                            <>
                              <EyeIcon className="mr-2 h-3 w-3" />
                              Show Bit Viewer
                            </>
                          )}
                        </Button>
                      </div>
                      <CardDescription className="text-sm text-muted-foreground">
                        {register.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Register Properties Section */}
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Register Properties
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 min-w-0">
                          <PropertyItem
                            icon={<RulerIcon className="h-3 w-3" />}
                            label="Width"
                            value={`${register.width} bits`}
                          />
                          <PropertyItem
                            icon={<LockIcon className="h-3 w-3" />}
                            label="Access"
                            value={<AccessBadge access={register.access} />}
                          />
                          {register.resetValue !== undefined && (
                            <PropertyItem
                              icon={<RefreshCwIcon className="h-3 w-3" />}
                              label="Reset Value"
                              value={
                                <code className="font-mono text-xs bg-secondary/30 py-0.5 rounded">
                                  {convertToHexString(register.resetValue)}
                                </code>
                              }
                            />
                          )}
                          {register.resetMask && (
                            <PropertyItem
                              icon={<FilterIcon className="h-3 w-3" />}
                              label="Reset Mask"
                              value={
                                <code className="font-mono text-xs bg-secondary/30 py-0.5 rounded">
                                  {convertToHexString(register.resetMask)}
                                </code>
                              }
                            />
                          )}
                        </div>
                      </div>

                      {/* Actions Section */}
                      {(register.readAction ||
                        register.writeAction ||
                        register.modifiedWriteValues) && (
                        <div>
                          <Separator className="my-4" />
                          <h3 className="text-sm font-semibold mb-2">
                            Actions
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 min-w-0">
                            {register.readAction && (
                              <PropertyItem
                                icon={<BookOpenIcon className="h-3 w-3" />}
                                label="Read Action"
                                value={register.readAction}
                              />
                            )}
                            {register.writeAction && (
                              <PropertyItem
                                icon={<PencilIcon className="h-3 w-3" />}
                                label="Write Action"
                                value={register.writeAction}
                              />
                            )}
                            {register.modifiedWriteValues && (
                              <PropertyItem
                                icon={<EditIcon className="h-3 w-3" />}
                                label="Modified Write Values"
                                value={register.modifiedWriteValues}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="space-y-6">
                    <div className="w-full h-12 relative rounded-md">
                      {findGaps(register.fields, registerWidth).map(
                        (gap, index) => (
                          <GapComponent
                            key={`gap-${index}`}
                            gap={gap}
                            registerWidth={registerWidth}
                          />
                        ),
                      )}
                      {register.fields.map((field) => {
                        const { width, left } = calculateFieldDimensions(
                          field,
                          registerWidth,
                        );
                        return (
                          <div
                            key={field.name}
                            className={`absolute h-full flex flex-col justify-center items-center text-sm border  border-border rounded ${getAccessStyles(field.access)}/100`}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                            }}
                          >
                            <div className="font-medium truncate w-full text-center ">
                              {field.name}
                            </div>
                            <div className="font-medium text-xs">
                              {createBitString(field)}
                            </div>
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
                          <React.Fragment key={field.name}>
                            <TableRow
                              className={`${
                                field.enumeratedValues?.length
                                  ? "cursor-pointer hover:bg-muted/50"
                                  : ""
                              } [&:has(>td:hover)]:hover:bg-muted/50`}
                              onClick={() =>
                                field.enumeratedValues?.length
                                  ? setExpandedField(
                                      expandedField === field.name
                                        ? null
                                        : field.name,
                                    )
                                  : null
                              }
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {field.enumeratedValues?.length ? (
                                    <ChevronRight
                                      className={`h-4 w-4 transition-transform duration-200 ${
                                        expandedField === field.name
                                          ? "rotate-90"
                                          : ""
                                      }`}
                                    />
                                  ) : null}
                                  {field.name}
                                </div>
                              </TableCell>
                              <TableCell>{createBitString(field)}</TableCell>
                              <TableCell>
                                <AccessBadge access={field.access} />
                              </TableCell>
                              <TableCell>{field.description}</TableCell>
                            </TableRow>

                            {expandedField === field.name &&
                              field.enumeratedValues && (
                                <TableRow className="overflow-hidden transition-height duration-200">
                                  <TableCell colSpan={4} className="p-0">
                                    <div className="animate-in slide-in-from-top-1 duration-200 p-4">
                                      <EnumContent
                                        enums={field.enumeratedValues}
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </div>
              {showBitViewer && (
                <Separator
                  orientation="vertical"
                  className={`h-auto my-4 transition-opacity duration-300 ${
                    showBitViewer ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
              <div
                className={`transition-all duration-300 ... ${showBitViewer ? "opacity-100 translate-x-0 w-1/3" : "opacity-0 translate-x-full w-0 overflow-hidden"}`}
              >
                {showBitViewer && <RegisterBitViewer register={register} />}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default RegisterVisualizer;
