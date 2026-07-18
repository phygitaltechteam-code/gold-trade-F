/**
 * Formats a number to the Indian numbering system.
 * 
 * Rules applied:
 * - Uses the Indian numbering system (e.g., 1,25,000)
 * - Shows no decimal places for whole numbers
 * - Shows a maximum of 2 decimal places, trimming trailing zeros
 * - Returns "-" for null, undefined, empty strings, and invalid numbers
 * 
 * @param value The value to format (can be a number, string, null, or undefined)
 * @returns The formatted string
 * 
 * @example
 * formatIndianNumber(5000)      // "5,000"
 * formatIndianNumber(5000.129)  // "5,000.13"
 * formatIndianNumber(125000)    // "1,25,000"
 * formatIndianNumber(null)      // "-"
 */
export function formatIndianNumber(value: number | string | null | undefined): string {
  // Handle null, undefined, and empty string
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  // Handle strings that are just whitespace
  if (typeof value === "string" && value.trim() === "") {
    return "0";
  }

  const num = Number(value);

  // Handle invalid numbers (NaN)
  if (isNaN(num)) {
    return "0";
  }

  // Use Intl.NumberFormat for Indian numbering and up to 2 decimal places
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(num);
}
