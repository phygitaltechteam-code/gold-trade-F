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
// utils/formatIndianNumber.ts
export const formatIndianNumber = (amount: number | string | undefined | null): string => {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return '0';
  }

  // If amount is a string, remove ₹ symbol, commas, and any extra characters
  let cleanAmount = typeof amount === 'string'
    ? amount.replace(/[₹,]/g, '').trim()
    : amount;

  // Convert to number
  const num = typeof cleanAmount === 'string' ? parseFloat(cleanAmount) : cleanAmount;

  // Check if it's a valid number
  if (isNaN(num)) {
    return '0';
  }

  // Check if the number has decimal places
  const hasDecimal = num % 1 !== 0;

  let formatted: string;
  if (!hasDecimal) {
    // If no decimal places, show without .00
    formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    // If has decimal places, show with 2 decimal places
    formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return formatted;
};

// For displaying with ₹ symbol
export const formatIndianCurrency = (amount: number | string | undefined | null): string => {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0';
  }

  // If amount is a string, remove ₹ symbol, commas, and any extra characters
  let cleanAmount = typeof amount === 'string'
    ? amount.replace(/[₹,]/g, '').trim()
    : amount;

  const num = typeof cleanAmount === 'string' ? parseFloat(cleanAmount) : cleanAmount;

  if (isNaN(num)) {
    return '₹0';
  }

  // Check if the number has decimal places
  const hasDecimal = num % 1 !== 0;

  let formatted: string;
  if (!hasDecimal) {
    formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return `₹${formatted}`;
};