// Ye regex backend (User.js / Bike.js models) se hu-bahu match karte hain,
// taake client aur server ka validation kabhi mismatch na ho
export const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
export const PHONE_REGEX = /^\+?\d{10,15}$/;
export const NUMBER_PLATE_REGEX = /^[A-Z]{2,3}[- ]?\d{1,4}$/;

export function validateRegisterForm({ name, fatherName, cnic, age, phone, password, consentAccepted }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Naam zaroori hai';
  if (!fatherName || !fatherName.trim()) errors.fatherName = 'Father name zaroori hai';
  if (!CNIC_REGEX.test((cnic || '').trim())) errors.cnic = 'Sahi format: 42101-1234567-1';
  if (!age || Number(age) < 18 || Number(age) > 100) errors.age = 'Age 18 se 100 ke darmiyan honi chahiye';
  if (!PHONE_REGEX.test((phone || '').trim())) errors.phone = 'Sahi phone number likho (e.g. 03001234567)';
  if (!password || password.length < 8) errors.password = 'Password kam se kam 8 characters ka ho';
  if (!consentAccepted) errors.consentAccepted = 'Tracking consent qabool karna zaroori hai';
  return errors;
}

export function validateLoginForm({ phone, password }) {
  const errors = {};
  if (!PHONE_REGEX.test((phone || '').trim())) errors.phone = 'Sahi phone number likho';
  if (!password) errors.password = 'Password zaroori hai';
  return errors;
}

export function validateBikeForm({ numberPlate, color }) {
  const errors = {};
  if (!NUMBER_PLATE_REGEX.test((numberPlate || '').trim().toUpperCase())) {
    errors.numberPlate = 'Sahi format: ABC-123';
  }
  if (!color || !color.trim()) errors.color = 'Color zaroori hai';
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
