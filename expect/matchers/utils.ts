export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    return keysB.includes(key) &&
      isDeepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      );
  });
}

/**
 * Gets a property value from an object using a path string.
 * Supports dot notation (obj.prop) and array indexing (obj[0] or obj.array[0]).
 *
 * @param obj The object to get the property from
 * @param path The path to the property (e.g. "a.b[0].c")
 * @returns The value at the specified path
 * @throws Error if the property doesn't exist
 */
export function getPropertyByPath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  if (path === "") {
    throw new Error("Invalid path: empty string");
  }

  // Parse the path into segments
  const segments: string[] = [];

  let currentSegment = "";
  let inBrackets = false;

  for (let i = 0; i < path.length; i++) {
    const char = path[i];

    if (char === "." && !inBrackets) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = "";
      }
    } else if (char === "[") {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = "";
      }
      inBrackets = true;
    } else if (char === "]") {
      if (inBrackets) {
        segments.push(currentSegment);
        currentSegment = "";
        inBrackets = false;
      } else {
        throw new Error(`Invalid path: ${path}`);
      }
    } else {
      currentSegment += char;
    }
  }

  // Add the last segment if there is one
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Traverse the object using the segments
  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      throw new Error(`Property ${path} does not exist`);
    }

    if (typeof segment === "string" && !isNaN(Number(segment))) {
      // If segment is a numeric string, treat it as an array index
      const index = Number(segment);
      if (!Array.isArray(current)) {
        throw new Error(`Cannot access index ${segment} of non-array`);
      }
      if (index >= (current as unknown[]).length) {
        throw new Error(`Index ${segment} out of bounds`);
      }
      current = (current as unknown[])[index];
    } else {
      // Otherwise treat it as an object property
      if (typeof current !== "object") {
        throw new Error(`Cannot access property ${segment} of non-object`);
      }

      if (!Object.prototype.hasOwnProperty.call(current, segment)) {
        throw new Error(`Property ${segment} does not exist on object`);
      }

      current = (current as Record<string, unknown>)[segment];
    }
  }

  return current;
}
