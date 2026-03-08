export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  let strength: PasswordStrength;
  if (score <= 2) {
    strength = "weak";
  } else if (score <= 3) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return { strength, score };
}
