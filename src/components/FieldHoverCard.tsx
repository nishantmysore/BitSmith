import { type AccessType } from "@prisma/client";
import {getAccessDescription} from "@/lib/access_colors";
import AccessBadge from "./AccessBadge";

interface FieldInfo {
  name: string;
  description: string;
  bits: string;
  access: AccessType;
}

interface FieldHoverCardProps {
  field: FieldInfo;
  fieldValue: {
    hex: string;
    decimal: number;
    binary: string;
  };
}

const FieldHoverCard = ({ field, fieldValue }: FieldHoverCardProps) => {
  return (
    <div
      className="absolute hidden group-hover:block z-10 p-4 
      bg-popover text-popover-foreground rounded-md shadow-lg 
      -top-2 right-full mr-2 w-72 space-y-2"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{field.name}</h4>
          <p className="text-sm text-muted-foreground">Bits [{field.bits}]</p>
        </div>
        <AccessBadge access={field.access}/>
      </div>

      <div className="space-y-1">
        <p className="text-sm">{field.description}</p>
        <p className="text-xs text-muted-foreground">
          {getAccessDescription(field.access)}
        </p>
      </div>
      <div className="pt-2 border-t space-y-1">
        <div className="text-xs">
          <span className="text-muted-foreground">Current Value: </span>
          <span className="font-mono">
            0x{fieldValue.hex} ({fieldValue.decimal})
          </span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Binary: </span>
          <span className="font-mono">{fieldValue.binary}</span>
        </div>
      </div>
    </div>
  );
};

export default FieldHoverCard;
