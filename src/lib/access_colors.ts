import { AccessType } from "@prisma/client";


  export const getAccessDescription = (access: AccessType) => {
    switch (access) {
      case "RO":
        return "Read Only - This field can only be read";
      case "WO":
        return "Write Only - This field can only be written";
      case "RW":
        return "Read/Write - This field can be read and written";
      case "RW1C":
        return "Read/Write 1 to Clear - Writing 1 clears the bit";
      case "W1S":
        return "Write 1 to Set - Writing 1 sets the bit";
      case "W1C":
        return "Write 1 to Clear - Writing 1 clears the bit";
      case "RSVD":
        return "Reserved";
    }
  };

  export const getAccessStyles = (access: AccessType) => {
    switch (access) {
      case "RO":
        return "bg-blue-500/20 text-blue-700";
      case "WO":
        return "bg-purple-500/20 text-purple-700";
      case "RW":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-secondary";
    }
  };

