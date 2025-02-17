import { FieldAccessType } from "@prisma/client";

export const getAccessDescription = (access: FieldAccessType) => {
  switch (access) {
    case "RO":
      return "Read Only - This field can only be read";
    case "WO":
      return "Write Only - This field can only be written";
    case "RW":
      return "Read/Write - This field can be read and written";
    case "RW1":
      return "Read access is always permitted. Only the first write access after a reset will have an effect";
    case "W1":
      return "Read operations have an undefined results. Only the first write after reset has an effect.";
    case "W1C":
      return "Write 1 to Clear - Writing 1 clears the bit";
    case "RSVD":
      return "Reserved";
  }
};

export const getAccessStyles = (access: FieldAccessType) => {
  switch (access) {
    case "RO":
      return "bg-gradient-to-br from-sky-600/90 via-blue-500/95 to-cyan-400/95 text-white dark:from-sky-800/90 dark:via-blue-700/95 dark:to-cyan-600/95 dark:text-blue-50";
    case "WO":
      return "bg-gradient-to-br from-fuchsia-600/90 via-purple-500/95 to-pink-400/95 text-white dark:from-fuchsia-800/90 dark:via-purple-700/95 dark:to-pink-600/95 dark:text-purple-50";
    case "RW":
      return "bg-gradient-to-br from-teal-600/90 via-emerald-500/95 to-green-400/95 text-white dark:from-teal-800/90 dark:via-emerald-700/95 dark:to-green-600/95 dark:text-emerald-50";
    case "RW1":
      return "bg-gradient-to-br from-orange-600/90 via-amber-500/95 to-yellow-400/95 text-white dark:from-orange-800/90 dark:via-amber-700/95 dark:to-yellow-600/95 dark:text-amber-50";
    case "W1":
      return "bg-gradient-to-br from-violet-600/90 via-indigo-500/95 to-blue-400/95 text-white dark:from-violet-800/90 dark:via-indigo-700/95 dark:to-blue-600/95 dark:text-indigo-50";
    case "W1C":
      return "bg-gradient-to-br from-red-600/90 via-rose-500/95 to-pink-400/95 text-white dark:from-red-800/90 dark:via-rose-700/95 dark:to-pink-600/95 dark:text-rose-50";
    case "RSVD":
      return "bg-gradient-to-br from-zinc-600/90 via-slate-500/95 to-gray-400/95 text-white dark:from-zinc-800/90 dark:via-slate-700/95 dark:to-gray-600/95 dark:text-slate-50";
  }
};
