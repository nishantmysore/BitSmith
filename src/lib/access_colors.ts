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
        // A calm blue that works in both modes
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
      case "WO":
        // A rich purple that matches the sophistication of the theme
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200";
      case "RW":
        // A success-like green that's visible but not too bright
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
      case "RW1C":
        // A warm amber for special operations
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
      case "W1S":
        // A distinct indigo for set operations
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200";
      case "W1C":
        // A rose color that complements the theme's red
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200";
      case "RSVD":
        // Using the theme's muted colors for reserved
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200";
    }
  };
