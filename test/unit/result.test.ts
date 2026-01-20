/**
 * Unit tests for Result type utilities
 */

import { describe, it, expect } from 'vitest';
import {
  ok,
  err,
  errFromReturn,
  unwrap,
  unwrapOr,
  map,
  andThen,
  isSuccess,
  NvmlError,
  NvmlReturn,
} from '../../src/types/index.js';

describe('Result type', () => {
  describe('ok()', () => {
    it('creates a success result with value', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });

    it('works with different value types', () => {
      expect(ok('hello').value).toBe('hello');
      expect(ok({ a: 1 }).value).toEqual({ a: 1 });
      expect(ok([1, 2, 3]).value).toEqual([1, 2, 3]);
      expect(ok(null).value).toBe(null);
    });
  });

  describe('err()', () => {
    it('creates an error result with NvmlError', () => {
      const error = new NvmlError(NvmlReturn.ERROR_UNINITIALIZED, 'Not initialized');
      const result = err(error);
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('errFromReturn()', () => {
    it('creates error result from return code', () => {
      const result = errFromReturn(NvmlReturn.ERROR_NOT_FOUND, 'Device not found');
      expect(result.ok).toBe(false);
      expect(result.error.code).toBe(NvmlReturn.ERROR_NOT_FOUND);
      expect(result.error.message).toContain('Device not found');
    });

    it('includes descriptive error string in message', () => {
      const result = errFromReturn(NvmlReturn.ERROR_INVALID_ARGUMENT, 'Bad arg');
      expect(result.error.message).toContain('Bad arg');
      expect(result.error.message).toContain('Invalid argument');
    });
  });

  describe('unwrap()', () => {
    it('returns value for success result', () => {
      const result = ok(123);
      expect(unwrap(result)).toBe(123);
    });

    it('throws for error result', () => {
      const result = errFromReturn(NvmlReturn.ERROR_UNKNOWN, 'Unknown error');
      expect(() => unwrap(result)).toThrow(NvmlError);
    });
  });

  describe('unwrapOr()', () => {
    it('returns value for success result', () => {
      const result = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('returns default for error result', () => {
      const result = errFromReturn(NvmlReturn.ERROR_UNKNOWN, 'Error');
      expect(unwrapOr(result, 999)).toBe(999);
    });
  });

  describe('result.ok property', () => {
    it('is true for success results', () => {
      const success = ok('value');
      expect(success.ok).toBe(true);
    });

    it('is false for error results', () => {
      const failure = errFromReturn(NvmlReturn.ERROR_UNKNOWN, 'Error');
      expect(failure.ok).toBe(false);
    });
  });

  describe('map()', () => {
    it('transforms success value', () => {
      const result = ok(5);
      const mapped = map(result, (x) => x * 2);
      expect(mapped.ok).toBe(true);
      if (mapped.ok) {
        expect(mapped.value).toBe(10);
      }
    });

    it('passes through error unchanged', () => {
      const result = errFromReturn(NvmlReturn.ERROR_UNKNOWN, 'Error');
      const mapped = map(result, (x: number) => x * 2);
      expect(mapped.ok).toBe(false);
    });
  });

  describe('andThen()', () => {
    it('chains successful operations', () => {
      const result = ok(5);
      const chained = andThen(result, (x) => ok(x * 2));
      expect(chained.ok).toBe(true);
      if (chained.ok) {
        expect(chained.value).toBe(10);
      }
    });

    it('short-circuits on error', () => {
      const result = errFromReturn(NvmlReturn.ERROR_UNKNOWN, 'Error');
      const chained = andThen(result, (x: number) => ok(x * 2));
      expect(chained.ok).toBe(false);
    });
  });

  describe('isSuccess()', () => {
    it('returns true for SUCCESS code', () => {
      expect(isSuccess(NvmlReturn.SUCCESS)).toBe(true);
    });

    it('returns false for error codes', () => {
      expect(isSuccess(NvmlReturn.ERROR_UNKNOWN)).toBe(false);
      expect(isSuccess(NvmlReturn.ERROR_NOT_FOUND)).toBe(false);
    });
  });
});

describe('NvmlError', () => {
  it('stores error code and message', () => {
    const error = new NvmlError(NvmlReturn.ERROR_TIMEOUT, 'Operation timed out');
    expect(error.code).toBe(NvmlReturn.ERROR_TIMEOUT);
    expect(error.message).toBe('Operation timed out');
  });

  it('is instanceof Error', () => {
    const error = new NvmlError(NvmlReturn.ERROR_UNKNOWN, 'Unknown');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NvmlError);
  });

  describe('fromReturn()', () => {
    it('creates error with descriptive message', () => {
      const error = NvmlError.fromReturn(NvmlReturn.ERROR_NOT_SUPPORTED, 'Feature unavailable');
      expect(error.code).toBe(NvmlReturn.ERROR_NOT_SUPPORTED);
      expect(error.message).toContain('Feature unavailable');
      expect(error.message).toContain('not supported');
    });

    it('creates error without context', () => {
      const error = NvmlError.fromReturn(NvmlReturn.ERROR_UNKNOWN);
      expect(error.code).toBe(NvmlReturn.ERROR_UNKNOWN);
      expect(error.message).toContain('Unknown');
    });
  });

  describe('is()', () => {
    it('returns true for matching code', () => {
      const error = new NvmlError(NvmlReturn.ERROR_TIMEOUT, 'Timeout');
      expect(error.is(NvmlReturn.ERROR_TIMEOUT)).toBe(true);
    });

    it('returns false for non-matching code', () => {
      const error = new NvmlError(NvmlReturn.ERROR_TIMEOUT, 'Timeout');
      expect(error.is(NvmlReturn.ERROR_UNKNOWN)).toBe(false);
    });
  });
});

describe('NvmlReturn enum', () => {
  it('has correct success value', () => {
    expect(NvmlReturn.SUCCESS).toBe(0);
  });

  it('has distinct error codes', () => {
    const codes = [
      NvmlReturn.ERROR_UNINITIALIZED,
      NvmlReturn.ERROR_INVALID_ARGUMENT,
      NvmlReturn.ERROR_NOT_SUPPORTED,
      NvmlReturn.ERROR_NOT_FOUND,
      NvmlReturn.ERROR_TIMEOUT,
    ];
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});
