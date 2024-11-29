// Helper function to parse bit range string
export const parseBitRange = (bitStr: string): [number, number] => {
  const parts = bitStr.split(':');
  if (parts.length === 1) {
    const bit = parseInt(parts[0]);
    return [bit, bit];
  }
  const [first, second] = parts.map(p => parseInt(p));
  // Return [higher, lower] regardless of input order
  return [Math.min(first, second), Math.max(first, second)];
};

// Helper function to check if two ranges overlap
export const doRangesOverlap = (range1: [number, number], range2: [number, number]): boolean => {
  const [start1, end1] = range1;
  const [start2, end2] = range2;
  return Math.max(start1, start2) <= Math.min(end1, end2);
};

// Helper function to normalize the hex addresses
export const normalizeHexAddress = (hexStr: string): string => {
    // Remove '0x' prefix if present and convert to BigInt
    const normalized = BigInt(hexStr.toLowerCase().startsWith('0x') ? hexStr : '0x' + hexStr);
    // Convert back to hex string, remove '0x' prefix, and ensure consistent format
    return normalized.toString(16);
}
