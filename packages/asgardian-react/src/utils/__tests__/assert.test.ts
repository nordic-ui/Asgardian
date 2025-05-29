import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { assert, assertType } from "../assert";

describe("assert", () => {
  describe("with boolean condition", () => {
    it("should not throw when condition is true", () => {
      expect(() => assert(true, "Should not throw")).not.toThrowError(
        /should not throw/i
      );
    });

    it("should throw with string message when condition is false", () => {
      expect(() => assert(false, "Test error message")).toThrowError(
        /test error message/i
      );
    });

    it("should throw with Error object when condition is false", () => {
      const customError = new Error("Custom error");

      expect(() => assert(false, customError)).toThrowError(customError);
    });
  });

  describe("with function condition", () => {
    it("should not throw when function returns true", () => {
      const condition = vi.fn(() => true);

      expect(() => assert(condition, "Should not throw")).not.toThrowError(
        /should not throw/i
      );
      expect(condition).toHaveBeenCalledOnce();
    });

    it("should throw with string message when function returns false", () => {
      const condition = vi.fn(() => false);

      expect(() => assert(condition, "Function returned false")).toThrowError(
        /function returned false/i
      );
      expect(condition).toHaveBeenCalledOnce();
    });

    it("should throw with Error object when function returns false", () => {
      const condition = vi.fn(() => false);
      const customError = new Error("Function error");

      expect(() => assert(condition, customError)).toThrowError(customError);
      expect(condition).toHaveBeenCalledOnce();
    });
  });

  describe("edge cases", () => {
    it("should work with truthy values", () => {
      // @ts-expect-error
      expect(() => assert(1, "Should not throw")).not.toThrowError(
        /should not throw/i
      );
      // @ts-expect-error
      expect(() => assert("string", "Should not throw")).not.toThrowError(
        /should not throw/i
      );
      // @ts-expect-error
      expect(() => assert({}, "Should not throw")).not.toThrowError(
        /should not throw/i
      );
    });

    it("should work with falsy values", () => {
      // @ts-expect-error
      expect(() => assert(0, "Zero is falsy")).toThrowError(/zero is falsy/i);
      // @ts-expect-error
      expect(() => assert("", "Empty string is falsy")).toThrowError(
        /empty string is falsy/i
      );
      // @ts-expect-error
      expect(() => assert(null, "Null is falsy")).toThrowError(
        /null is falsy/i
      );
      // @ts-expect-error
      expect(() => assert(undefined, "Undefined is falsy")).toThrowError(
        /undefined is falsy/i
      );
    });
  });
});

describe("assertType", () => {
  const isString = (input: unknown): input is string =>
    typeof input === "string";
  const isNumber = (input: unknown): input is number =>
    typeof input === "number";
  const isObject = (input: unknown): input is object =>
    typeof input === "object" && input !== null;

  describe("successful type assertions", () => {
    it("should not throw when type guard passes", () => {
      expect(() => assertType("hello", isString)).not.toThrowError();
      expect(() => assertType(42, isNumber)).not.toThrowError();
      expect(() => assertType({}, isObject)).not.toThrowError();
    });

    it("should call the type guard function", () => {
      const mockGuard = vi.fn(() => true);

      // @ts-expect-error
      assertType("test", mockGuard);

      expect(mockGuard).toHaveBeenCalledWith("test");
      expect(mockGuard).toHaveBeenCalledOnce();
    });
  });

  describe("failed type assertions", () => {
    it("should throw with default message when type guard fails", () => {
      expect(() => assertType(42, isString)).toThrowError(
        /input does not match expected type/i
      );
    });

    it("should throw with custom string message when type guard fails", () => {
      expect(() => assertType(42, isString, "Expected a string")).toThrowError(
        /expected a string/i
      );
    });

    it("should throw with custom Error object when type guard fails", () => {
      const customError = new Error("Type assertion failed");

      expect(() => assertType(42, isString, customError)).toThrowError(
        customError
      );
    });

    it("should call the type guard function even when it fails", () => {
      const mockGuard = vi.fn(() => false);

      expect(() => assertType("test", mockGuard)).toThrowError();
      expect(mockGuard).toHaveBeenCalledWith("test");
      expect(mockGuard).toHaveBeenCalledOnce();
    });
  });

  describe("edge cases", () => {
    it("should work with null and undefined inputs", () => {
      expect(() => assertType(null, isObject)).toThrowError();
      expect(() => assertType(undefined, isString)).toThrowError();
    });

    it("should work with complex type guards", () => {
      type User = {
        name: string;
        age: number;
      };

      const isUser = (input: unknown): input is User => {
        return (
          typeof input === "object" &&
          input !== null &&
          "name" in input &&
          "age" in input &&
          typeof input.name === "string" &&
          typeof input.age === "number"
        );
      };

      const validUser = { name: "John", age: 30 };
      const invalidUser = { name: "John" };

      expect(() => assertType(validUser, isUser)).not.toThrowError();
      expect(() =>
        assertType(invalidUser, isUser, "Invalid user object")
      ).toThrowError(/invalid user object/i);
    });
  });

  describe("type narrowing", () => {
    it("should properly narrow types after assertion", () => {
      const input: unknown = "hello world";

      expect(expectTypeOf(input).toExtend<unknown>()).toBeTruthy();

      assertType(input, isString);

      expect(expectTypeOf(input).toExtend<string>()).toBeTruthy();
    });
  });
});
