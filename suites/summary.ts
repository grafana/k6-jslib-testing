import type { TestCaseFailed, TestCaseResult } from "./types.ts";
import type { ColorizerFn } from "../colors.ts";

export function formatTestName(result: TestCaseResult): string {
  return [...result.meta.path, result.meta.name].join(" > ");
}

function formatErrors(
  errors: TestCaseFailed[],
  colorize: ColorizerFn,
): string {
  if (errors.length === 0) {
    return "";
  }

  const messages = errors.map((error) => {
    const name = colorize(formatTestName(error), "red");

    const message = error instanceof Error
      ? error.message
      : String(error.error);

    const indentedMessage = message.split("\n").map((line) => `  ${line}`).join(
      "\n",
    );

    return `${name}:\n${indentedMessage}`;
  });

  return `\n\n${messages.join("\n\n")}`;
}

export function formatSummary(
  results: TestCaseResult[],
  colorize: ColorizerFn,
): string {
  const failed = results.filter((r) => r.type === "fail");

  const failedCount = failed.length;
  const successCount = results.length - failed.length;
  const totalCount = results.length;

  const errors = formatErrors(failed, colorize);
  const color = failedCount === 0 ? "green" : "red";

  const summary = colorize(
    `\n\nTest summary: ${successCount} passed, ${failedCount} failed, ${totalCount} total.\n\n`,
    color,
  );

  return errors + summary;
}
