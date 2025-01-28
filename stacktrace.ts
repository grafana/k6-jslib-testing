/**
 * A stacktrace, represented as an array of stack frames.
 */
export type Stacktrace = StackFrame[];

/**
 * A single frame in a stacktrace.
 */
export interface StackFrame {
  // Name of the function, if any.
  functionName: string;

  // The full path to the file, if any.
  filePath: string;

  // Name of the file, if any.
  fileName: string;

  // Line number in the file, if any.
  lineNumber: number;

  // Column number in the file, if any.
  columnNumber: number;
}

/**
 * Parses a stacktrace from a string.
 *
 * If no stacktrace is provided, returns an empty array.
 *
 * @param stack the stacktrace to parse, as returned by `new Error().stack`
 * @returns the parsed stacktrace
 */
export function parseStackTrace(stack?: string): Stacktrace {
  // If no stacktrace is provided, return an empty array.
  if (!stack) return [];

  const lines = stack.split("\n");
  const frames: StackFrame[] = [];

  for (let i = 0; i < lines.length; i++) {
    let lineStr = lines[i].trim();

    // Skip the first line if it's "Error" or any line that doesn't start with "at "
    if (i === 0 && lineStr.startsWith("Error")) continue;
    if (!lineStr.startsWith("at ")) continue;

    // Remove "at "
    lineStr = lineStr.slice(3).trim();

    // 1. Separate the function name from file info
    let functionName = "<anonymous>";
    let fileInfo = lineStr;
    const firstParenIndex = lineStr.indexOf("(");
    const fileProtocolIndex = lineStr.indexOf("file://");

    if (fileProtocolIndex === 0) {
      functionName = "<anonymous>";
      fileInfo = lineStr.slice(fileProtocolIndex);
    } else if (firstParenIndex >= 0) {
      functionName = lineStr.slice(0, firstParenIndex).trim() || "<anonymous>";
      fileInfo = lineStr
        .slice(firstParenIndex + 1, lineStr.lastIndexOf(")"))
        .trim();
    } else {
      fileInfo = lineStr;
    }

    // 2. Remove any trailing "(X)" offset
    const offsetParenIndex = fileInfo.lastIndexOf("(");
    if (offsetParenIndex >= 0) {
      fileInfo = fileInfo.slice(0, offsetParenIndex);
    }

    // 3. Handle file:// protocol
    if (fileInfo.startsWith("file://")) {
      fileInfo = fileInfo.slice(7);
    }

    // 4. Separate file, line, and column
    const lastColon = fileInfo.lastIndexOf(":");
    if (lastColon === -1) continue; // Malformed
    const secondLastColon = fileInfo.lastIndexOf(":", lastColon - 1);
    if (secondLastColon === -1) continue; // Malformed

    const filePath = fileInfo.slice(0, secondLastColon);
    const fileName = filePath.split("/").pop() ?? "";
    const lineNumberStr = fileInfo.slice(secondLastColon + 1, lastColon);
    const columnNumberStr = fileInfo.slice(lastColon + 1);

    frames.push({
      functionName,
      filePath,
      fileName,
      lineNumber: parseInt(lineNumberStr, 10),
      columnNumber: parseInt(columnNumberStr, 10),
    });
  }

  return frames;
}
