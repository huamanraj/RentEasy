export const validatePassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasLetter) {
    return { isValid: false, message: 'Password must contain at least one letter' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: '' };
};
