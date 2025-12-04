/**
 * Delay function for allowing .otherwise() to be called before auto-throwing.
 * Can be overridden in tests for faster execution.
 *
 * In production (k6), uses setTimeout with 1ms delay because queueMicrotask runs too early.
 * In tests (Deno), can be replaced with queueMicrotask for faster test execution.
 */
export let scheduleDelayedThrow: (callback: () => void) => void = (
  callback: () => void,
) => {
  setTimeout(callback, 1);
};

/**
 * Override the delay function for testing purposes.
 * Use this to replace setTimeout with queueMicrotask in Deno tests.
 */
export function setDelayFunction(fn: (callback: () => void) => void) {
  scheduleDelayedThrow = fn;
}
