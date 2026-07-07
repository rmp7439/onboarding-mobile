/**
 * Evaluates if the input contains ONLY letters and spaces.
 * Returns true if valid, false if it contains numbers, symbols, etc.
 */
export const isValidNameInput = (value: string): boolean => {
  return /^[A-Za-z ]*$/.test(value);
};

/**
 * Evaluates if the input contains ONLY letters, numbers, spaces, commas, full stops, and hyphens.
 * Prevents invalid symbols like @, #, $, etc.
 */
export const isValidAddressInput = (value: string): boolean => {
  return /^[a-zA-Z0-9\s,.-]*$/.test(value);
};

export const allowOnlyNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const allowAlphaNumeric = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, '');
};

export const allowAddressCharacters = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9\s,.-/]/g, '');
};