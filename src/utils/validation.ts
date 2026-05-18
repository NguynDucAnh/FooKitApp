import {REGEX} from '@constants';

export const isValidEmail = (email: string) => REGEX.EMAIL.test(email);
export const isValidPhone = (phone: string) => REGEX.PHONE.test(phone);
export const isValidUrl = (url: string) => REGEX.URL.test(url);
export const isStrongPassword = (password: string) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};
