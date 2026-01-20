import { NvmlReturn, nvmlErrorString } from './enums.js';

/**
 * Error class for NVML operations
 */
export class NvmlError extends Error {
  public override readonly name = 'NvmlError';

  constructor(
    public readonly code: NvmlReturn,
    message?: string
  ) {
    super(message ?? nvmlErrorString(code));
  }

  /**
   * Create an NvmlError from an NVML return code
   */
  static fromReturn(ret: NvmlReturn, context?: string): NvmlError {
    const baseMessage = nvmlErrorString(ret);
    const message = context ? `${context}: ${baseMessage}` : baseMessage;
    return new NvmlError(ret, message);
  }

  /**
   * Check if this is a specific error type
   */
  is(code: NvmlReturn): boolean {
    return this.code === code;
  }
}

/**
 * Result type for operations that may fail
 *
 * @example
 * ```typescript
 * const result = device.getMemoryInfo();
 * if (result.ok) {
 *   console.log(result.value.total);
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export type Result<T, E = NvmlError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Create a successful result
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Create a failed result
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Create a failed result from an NVML return code
 */
export function errFromReturn(
  ret: NvmlReturn,
  context?: string
): Result<never, NvmlError> {
  return err(NvmlError.fromReturn(ret, context));
}

/**
 * Unwrap a result, throwing if it's an error
 *
 * @example
 * ```typescript
 * const memory = unwrap(device.getMemoryInfo());
 * ```
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

/**
 * Unwrap a result with a custom error message
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
}

/**
 * Map a successful result to a new value
 */
export function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (result.ok) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * Chain result operations
 */
export function andThen<T, U>(
  result: Result<T>,
  fn: (value: T) => Result<U>
): Result<U> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/**
 * Check if NVML return code indicates success
 */
export function isSuccess(ret: number): ret is typeof NvmlReturn.SUCCESS {
  return ret === NvmlReturn.SUCCESS;
}
