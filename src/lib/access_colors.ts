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
      return "bg-gradient-to-b from-blue-700/90 via-blue-600/95 to-blue-500/95 text-white dark:from-blue-900/90 dark:via-blue-800/95 dark:to-blue-700/95 dark:text-blue-50";
    case "WO":
      return "bg-gradient-to-b from-purple-700/90 via-purple-600/95 to-purple-500/95 text-white dark:from-purple-900/90 dark:via-purple-800/95 dark:to-purple-700/95 dark:text-purple-50";
    case "RW":
      return "bg-gradient-to-b from-emerald-700/90 via-emerald-600/95 to-emerald-500/95 text-white dark:from-emerald-900/90 dark:via-emerald-800/95 dark:to-emerald-700/95 dark:text-emerald-50";
    case "RW1C":
      return "bg-gradient-to-b from-amber-700/90 via-amber-600/95 to-amber-500/95 text-white dark:from-amber-900/90 dark:via-amber-800/95 dark:to-amber-700/95 dark:text-amber-50";
    case "W1S":
      return "bg-gradient-to-b from-indigo-700/90 via-indigo-600/95 to-indigo-500/95 text-white dark:from-indigo-900/90 dark:via-indigo-800/95 dark:to-indigo-700/95 dark:text-indigo-50";
    case "W1C":
      return "bg-gradient-to-b from-rose-700/90 via-rose-600/95 to-rose-500/95 text-white dark:from-rose-900/90 dark:via-rose-800/95 dark:to-rose-700/95 dark:text-rose-50";
    case "RSVD":
      return "bg-gradient-to-b from-slate-700/90 via-slate-600/95 to-slate-500/95 text-white dark:from-slate-900/90 dark:via-slate-800/95 dark:to-slate-700/95 dark:text-slate-50";
  }
};
