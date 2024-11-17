// src/components/FieldHoverCard.tsx

import {AccessType, Field} from '@prisma/client';

// Define the expected request body type using Prisma types
type FieldInput = Omit<Register, 'id' | 'deviceId' | 'createdAt' | 'updatedAt'> & {
  fields: Array<Omit<Field, 'id' | 'registerId' | 'createdAt' | 'updatedAt'>>
};

interface FieldHoverCardProps {
  field: RegisterField;
  fieldValue: {
    hex: string;
    decimal: number;
    binary: string;
  };
}

const getAccessDescription = (access: AccessType) => {
  switch (access) {
    case 'RO':
      return 'Read Only - This field can only be read';
    case 'WO':
      return 'Write Only - This field can only be written';
    case 'RW':
      return 'Read/Write - This field can be read and written';
    case 'RW1C':
      return 'Read/Write 1 to Clear - Writing 1 clears the bit';
    case 'W1S':
      return 'Write 1 to Set - Writing 1 sets the bit';
    case 'W1C':
      return 'Write 1 to Clear - Writing 1 clears the bit';
    default:
      return 'Reserved';
  }
};

const FieldHoverCard = ({ field, fieldValue }: FieldHoverCardProps) => {
  return (
    <div className="absolute hidden group-hover:block z-10 p-4 
      bg-popover text-popover-foreground rounded-md shadow-lg 
      -top-2 right-full mr-2 w-72 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{field.name}</h4>
          <p className="text-sm text-muted-foreground">
            Bits [{field.bits}]
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs 
          ${field.access === 'RO' ? 'bg-blue-500/20 text-blue-700' :
            field.access === 'WO' ? 'bg-purple-500/20 text-purple-700' :
            field.access === 'RW' ? 'bg-green-500/20 text-green-700' :
            'bg-secondary'}`}>
          {field.access}
        </span>
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
