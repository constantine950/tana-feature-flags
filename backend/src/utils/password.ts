import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const validatePassword = (
  password: string,
): {
  valid: boolean;
  error?: string;
} => {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one letter" };
  }

  return { valid: true };
};
