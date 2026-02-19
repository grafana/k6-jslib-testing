import execution from "k6/execution";

import { suite } from "./helpers/test.ts";

import "./expectations/toBeInstanceOf.ts";
import "./expectations/toHaveAttribute.ts";
import "./expectations/toHaveProperty.ts";
import { colorize } from "../colors.ts";
import { TestCaseError } from "../suites/types.ts";

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

export default async function () {
  const results = await suite.run({
    reporter: (result) => {
      const color = result.type === "pass" ? "green" : "red";
      const icon = result.type === "pass" ? "✔" : "✖";

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
