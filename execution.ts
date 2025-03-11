import type { StackFrame, Stacktrace } from "./stacktrace.ts";

/**
 * Holds the execution context for a given assertion, and is used to render the error message.
 */
export interface ExecutionContext {
  /**
   * The file path where the assertion was called. e.g. "/some/path.ts".
   */
  filePath: string;

  /**
   * The file name where the assertion was called. e.g. "path.ts".
   */
  fileName: string;

  /**
   * The line number within `filename` where the assertion was called. e.g. 42.
   */
  lineNumber: number;

  /**
   * The column number within `filename` where the assertion was called. e.g. 24.
   */
  columnNumber: number;

  /**
   * The location of the assertion. e.g. "/some/path.ts:124:12".
   */
  at: string;

  /**
   * The stacktrace this execution context was captured from.
   */
  stacktrace?: Stacktrace;
}

/**
 * Captures the execution context from the provided stacktrace.
 *
 * If no stacktrace is provided, the execution context is not captured and the function returns `undefined`.
 *
 * @param stacktrace - The stacktrace to capture the execution context from, as returned by `new Error().stack`.
 * @returns the execution context
 */
export function captureExecutionContext(
  st: Stacktrace,
): ExecutionContext | undefined {
  if (!st || st.length <= 1) {
    return undefined;
  }

  const stackFrame: StackFrame = st[st.length - 1];

  const filePath = stackFrame.filePath;
  const fileName = stackFrame.fileName;
  const lineNumber = stackFrame.lineNumber;
  const columnNumber = stackFrame.columnNumber;
  const at = `${filePath}:${lineNumber}:${columnNumber}`;

  return {
    filePath,
    fileName,
    lineNumber,
    columnNumber,
    at,
  };
}
