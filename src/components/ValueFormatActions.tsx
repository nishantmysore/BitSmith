// src/components/ValueFormatActions.tsx
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ValueFormatActionsProps {
  binaryValue: string;
}

const ValueFormatActions = ({ binaryValue }: ValueFormatActionsProps) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyValue = (format: "hex" | "decimal" | "binary") => {
    const num = parseInt(binaryValue, 2);
    let valueToCopy = "";

    switch (format) {
      case "hex":
        valueToCopy = "0x" + num.toString(16).toUpperCase().padStart(8, "0");
        break;
      case "decimal":
        valueToCopy = num.toString(10);
        break;
      case "binary":
        valueToCopy = binaryValue;
        break;
    }

    navigator.clipboard.writeText(valueToCopy);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => copyValue("hex")}
      >
        {copiedFormat === "hex" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Hex
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => copyValue("decimal")}
      >
        {copiedFormat === "decimal" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Decimal
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => copyValue("binary")}
      >
        {copiedFormat === "binary" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Binary
      </Button>
    </div>
  );
};

export default ValueFormatActions;
