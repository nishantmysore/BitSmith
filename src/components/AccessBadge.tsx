import { AccessType } from "@prisma/client";
import { getAccessStyles } from "@/lib/access_colors"; // adjust import path as needed

interface AccessBadgeProps {
  access: AccessType;
}

export const AccessBadge = ({ access }: AccessBadgeProps) => {
  return (
    <span className={`px-2 py-1 rounded text-xs ${getAccessStyles(access)}`}>
      {access}
    </span>
  );
};

export default AccessBadge;
