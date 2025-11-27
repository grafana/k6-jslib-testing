function interweave(left: readonly string[], right: readonly string[]) {
  const result: string[] = [];
  const maxLength = Math.max(left.length, right.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < left.length) {
      result.push(left[i]);
    }

    if (i < right.length) {
      result.push(right[i]);
    }
  }

  return result.join("");
}

/**
 * Naive dedent implementation.
 */
export function dedent(strings: TemplateStringsArray, ...values: string[]) {
  const text = interweave(strings.raw, values);
  const lines = text.split("\n");

  if (/^\s*$/.test(lines[0])) {
    lines.unshift();
  }

  const maxLineWidth = lines.reduce((result, line) => {
    return Math.max(result, line.length);
  }, 0);

  const minIndent = lines.reduce((result, line) => {
    const trimmed = line.trimStart();

    // Ignore indent of empty lines
    if (trimmed.length === 0) {
      return result;
    }

    return Math.min(result, line.length - trimmed.length);
  }, maxLineWidth);

  return lines.map((line) => line.slice(minIndent)).join("\n");
}
