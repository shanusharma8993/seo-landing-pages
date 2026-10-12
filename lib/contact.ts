export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const message = input.message.trim();

  if (name.length < 2) errors.name = "Please enter your name (at least 2 characters).";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (phone && !PHONE_RE.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (!input.service) errors.service = "Please choose a service.";
  if (message.length < 10) errors.message = "Please tell us a little more (at least 10 characters).";
  else if (message.length > 2000) errors.message = "Please keep your message under 2000 characters.";

  return errors;
}
