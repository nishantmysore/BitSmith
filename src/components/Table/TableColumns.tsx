"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type RegisterData = {
  name: string;
  description: string;
  width: number;
  addressOffset: bigint;
};

export const columns: ColumnDef<RegisterData>[] = [
  {
    accessorKey: "name",

    header: ({ column }) => {
      return (
        <div className="flex items-center text-left font-medium py-1">
          <span
            className="flex cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </div>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <a href={`#register-${name}`} className="hover:underline">
          {name}
        </a>
      );
    },
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-xs truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "width",
    header: "Width",
  },
  {
    accessorKey: "address",
    header: ({ column }) => {
      return (
        <div className="flex items-center text-left font-medium py-1 ">
          <span
            className="flex cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        </div>
      );
    },
  },
];
