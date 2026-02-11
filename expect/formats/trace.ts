import { registerFormatter } from "../formatting/formatter.ts";
import { red, value, white } from "../formatting/index.ts";
import { list } from "../index.ts";

declare module "../errors.ts" {
  interface ErrorFormats {
    "trace": {
      inner: AnyError;
      trace: string[];
    };
  }
}

function aggregateMessages(
  [first, ...rest]: string[],
): Array<{ message: string; count: number }> {
  if (first === undefined) {
    return [];
  }

  let current = {
    message: first,
    count: 1,
  };

  const result = [current];

  for (const next of rest) {
    if (next === current.message) {
      current.count += 1;

      continue;
    }

    current = {
      message: next,
      count: 1,
    };

    result.push(current);
  }

  return result;
}

// This format appends a trace to the end of the error message.
registerFormatter("trace", function ({ inner, trace }) {
  const innerMessage = Array.of(this.format(inner)).flat();

  // To reduce the noise, we group together identical messages sequentitally and
  // add a count to the end, e.g. 'some error happened (x4)'
  const aggregated = aggregateMessages(trace)
    .map((msg) => {
      if (msg.count === 1) {
        return red(msg.message);
      }

      const count = value`(x${msg.count.toString()})`;

      return red(
        value`${msg.message} ${white(count)}`,
      );
    });

  return [
    ...innerMessage,
    {
      "Call log": list(aggregated),
    },
  ];
});
