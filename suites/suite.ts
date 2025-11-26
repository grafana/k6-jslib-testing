import { captureExecutionContext } from "../execution.ts";
import { parseStackTrace } from "../stacktrace.ts";
import { makeRelativePath } from "../utils/path.ts";
import type {
  TestCase,
  TestCaseResult as TestCaseResult,
  TestGroup,
  TestRunContext,
} from "./types.ts";

interface RunOptions {
  cwd?: string;
  onTestCase?: (result: TestCaseResult) => void;
}

interface TestCaseInstance {
  path: [string, ...string[]];
  test: TestCase;
}

function buildTestCaseInstances(root: TestGroup): TestCaseInstance[] {
  return root.children.flatMap((child) => {
    if (child.type === "test") {
      return {
        path: [root.name],
        test: child,
      };
    }

    return buildTestCaseInstances(child).map<TestCaseInstance>(
      (execution) => {
        return {
          ...execution,
          path: [root.name, ...execution.path],
        };
      },
    );
  });
}

class TestSuite {
  #stack: TestGroup[] = [];

  #roots = new Map<string, TestGroup>();

  get #currentGroup() {
    const currentGroup = this.#stack[this.#stack.length - 1];

    if (currentGroup === undefined) {
      const stackTrace = parseStackTrace(new Error().stack);
      const executionContext = captureExecutionContext(stackTrace);

      if (executionContext === undefined) {
        throw new Error(
          "Could not determine execution context for root test suite",
        );
      }

      let root = this.#roots.get(executionContext.filePath);

      if (root === undefined) {
        root = {
          type: "group",
          name: executionContext.filePath,
          children: [],
        };

        this.#roots.set(executionContext.filePath, root);
      }

      return root;
    }

    return currentGroup;
  }

  add(test: TestCase) {
    this.#currentGroup.children.push(test);
  }

  enterGroup(name: string, fn: () => void) {
    const currentGroup = this.#currentGroup;

    const newGroup: TestGroup = {
      type: "group",
      name,
      children: [],
    };

    this.#stack.push(newGroup);

    try {
      fn();
    } finally {
      this.#stack.pop();
    }

    currentGroup.children.push(newGroup);
  }

  async run(
    { cwd, onTestCase: onTestDone }: RunOptions = {},
  ): Promise<TestCaseResult[]> {
    const instances = Array.from(this.#roots.values()).flatMap((group) => {
      return buildTestCaseInstances({
        ...group,
        name: cwd !== undefined
          ? makeRelativePath(cwd, group.name)
          : group.name,
      });
    });

    const results: TestCaseResult[] = [];

    const handleTestCaseResult = (result: TestCaseResult) => {
      results.push(result);

      onTestDone?.(result);
    };

    for (const instance of instances) {
      let startTime = Date.now();

      const context: TestRunContext = {
        start: (_test) => {
          startTime = Date.now();
        },
        pass: (_test) => {
          const duration = Date.now() - startTime;

          handleTestCaseResult({
            type: "pass",
            meta: {
              path: instance.path,
              name: instance.test.name,
              duration,
            },
          });
        },
        fail: (_test, error) => {
          const duration = Date.now() - startTime;

          handleTestCaseResult({
            type: "fail",
            meta: {
              path: instance.path,
              name: instance.test.name,
              duration,
            },
            error,
          });
        },
      };

      await instance.test.execute(instance.test, context);
    }

    return results;
  }

  clear() {
    this.#stack = [];
    this.#roots.clear();
  }
}

export const rootTestSuite = new TestSuite();

export function createTestSuite(): TestSuite {
  return new TestSuite();
}

export type { TestSuite };
