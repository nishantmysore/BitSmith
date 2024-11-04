// src/utils/register.ts
export const getAccessColor = (access: string) => {
  switch (access) {
    case 'RO':
      return 'bg-blue-500/10 hover:bg-blue-500/20';
    case 'WO':
      return 'bg-purple-500/10 hover:bg-purple-500/20';
    case 'RW':
      return 'bg-green-500/10 hover:bg-green-500/20';
    case 'RW1C':
      return 'bg-yellow-500/10 hover:bg-yellow-500/20';
    case 'W1S':
    case 'W1C':
      return 'bg-orange-500/10 hover:bg-orange-500/20';
    default:
      return 'bg-secondary/50 hover:bg-secondary/70';
  }
};
