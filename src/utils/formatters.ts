/**
 * Shorten an Ethereum address for UI display
 * e.g. 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
 */
export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format a Unix timestamp (seconds) into local date string
 */
export function formatAppointmentDate(timestamp: number | bigint): string {
  const tsNum = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  if (!tsNum || tsNum <= 0) return "N/A";
  const date = new Date(tsNum * 1000);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a Unix timestamp (seconds) into local time string with timezone
 */
export function formatAppointmentTime(timestamp: number | bigint): string {
  const tsNum = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  if (!tsNum || tsNum <= 0) return "N/A";
  const date = new Date(tsNum * 1000);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Combined date and time in user's local timezone
 */
export function formatDateTime(timestamp: number | bigint): string {
  const tsNum = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  if (!tsNum || tsNum <= 0) return "N/A";
  const date = new Date(tsNum * 1000);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Check if a timestamp has already passed
 */
export function isPastTimestamp(timestamp: number | bigint): boolean {
  const tsNum = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return tsNum * 1000 < Date.now();
}

export type StatusConfig = {
  label: string;
  badgeClass: string;
  dotClass: string;
};

export function getBookingStatusInfo(status: number): StatusConfig {
  switch (status) {
    case 0: // Pending
      return {
        label: "Pending",
        badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
        dotClass: "bg-amber-400",
      };
    case 1: // Confirmed
      return {
        label: "Confirmed",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
        dotClass: "bg-emerald-400",
      };
    case 2: // Cancelled
      return {
        label: "Cancelled",
        badgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
        dotClass: "bg-rose-400",
      };
    case 3: // Completed
      return {
        label: "Completed",
        badgeClass: "bg-purple-500/10 text-purple-300 border border-purple-500/30",
        dotClass: "bg-purple-400",
      };
    default:
      return {
        label: "Unknown",
        badgeClass: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
        dotClass: "bg-gray-400",
      };
  }
}

