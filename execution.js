/**
 * Captures the execution context from the provided stacktrace.
 *
 * If no stacktrace is provided, the execution context is not captured and the function returns `undefined`.
 *
 * @param stacktrace - The stacktrace to capture the execution context from, as returned by `new Error().stack`.
 * @returns the execution context
 */
export function captureExecutionContext(st) {
  if (!st || st.length <= 1) {
    return undefined;
  }
  const stackFrame = st[st.length - 1];
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
