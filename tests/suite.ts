import execution from "k6/execution";

import { suite } from "./helpers/test.ts";

import "./expectations/toBeInstanceOf.ts";
import "./expectations/toHaveAttribute.ts";
import "./expectations/toHaveProperty.ts";
import { colorize } from "../colors.ts";
import { TestCaseError } from "../suites/types.ts";
// @ts-types="../dist/index.d.ts"
import type { AnsiColor, TestCaseResult } from "../dist/index.js";

export const options = {
  scenarios: {
    default: {
      executor: "per-vu-iterations",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

function getResultStyle(
  result: TestCaseResult,
): { color: AnsiColor; icon: string } {
  if (result.type === "pass") {
    return {
      color: "green",
      icon: "✔",
    };
  }

  if (result.type === "skip") {
    return {
      color: "yellow",
      icon: "⚠",
    };
  }

  return {
    color: "red",
    icon: "✖",
  };
}

export default async function () {
  const results = await suite.run({
    include: __ENV.K6_TESTING_PATTERN,
    reporter: (result) => {
      const { color, icon } = getResultStyle(result);

      const name = [...result.meta.path, result.meta.name].join(" > ");

      console.log(
        colorize(`${icon} ${name} (${result.meta.duration}ms)`, color),
      );
    },
  });

  const errors = results.filter((r) => r.type === "fail");

  if (errors.length === 0) {
    console.log(
      colorize(
        `\n\n✔ All tests passed! (${results.length} total)\n\n`,
        "green",
      ),
    );

    return;
  }

  const messages = errors.map((result) => {
    const name = [...result.meta.path, result.meta.name].join(" > ");

    const error = result.error instanceof TestCaseError
      ? result.error.detail
      : String(result.error);

    return colorize(`✖ ${name}\n\n${error}\n`, "red");
  });

  console.log("\n\n" + messages.join("\n"));

  execution.test.abort(
    colorize(`✖ ${errors.length}/${results.length} tests failed.`, "red"),
  );
}
