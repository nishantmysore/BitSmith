export const CACHE_KEY = (userId: string) => `deviceData_${userId}`;
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const clearDevicesCache = (userId: string) => {
  localStorage.removeItem(CACHE_KEY(userId));
};
