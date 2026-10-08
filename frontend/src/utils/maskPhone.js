/**
 * Utility to mask phone numbers for user privacy.
 * Ensures the last 3 digits are hidden across public and demo screens.
 *
 * Example:
 *   "9876543210"      -> "98765 43***"
 *   "+91 98765 43210" -> "+91 98765 43***"
 */
export const maskPhoneNumber = (phone) => {
  if (!phone) return "";
  const str = String(phone).trim();
  if (!str) return "";

  // If raw 10-digit number like "9876543210"
  const digitsOnly = str.replace(/\D/g, "");
  if (digitsOnly.length === 10 && !str.includes("+") && !str.includes(" ")) {
    return `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5, 7)}***`;
  }

  // General masking: replace last 3 digits with ***
  const chars = str.split("");
  let count = 0;
  for (let i = chars.length - 1; i >= 0; i--) {
    if (/\d/.test(chars[i])) {
      chars[i] = "*";
      count++;
      if (count === 3) break;
    }
  }
  return chars.join("");
};

export default maskPhoneNumber;
