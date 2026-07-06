export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateOTP = (otp: string): boolean => {
  if (!otp) return false;
  const cleaned = otp.replace(/\D/g, '');
  return cleaned.length >= 4 && cleaned.length <= 6;
};

export const validatePinCode = (pinCode: string): boolean => {
  if (!pinCode) return false;
  const cleaned = pinCode.replace(/\D/g, '');
  return cleaned.length === 6;
};