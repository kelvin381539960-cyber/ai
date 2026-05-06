export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateRequiredString(value: unknown, field: string): ValidationResult {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, errors: [`${field} must be a non-empty string`] };
  }

  return { ok: true, errors: [] };
}

export function combineValidationResults(results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((result) => result.errors);
  return {
    ok: errors.length === 0,
    errors
  };
}

export function enforceLimit(input: unknown, defaultLimit = 20, maxLimit = 50): number {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    return defaultLimit;
  }

  const integerLimit = Math.floor(input);

  if (integerLimit < 1) {
    return defaultLimit;
  }

  return Math.min(integerLimit, maxLimit);
}
