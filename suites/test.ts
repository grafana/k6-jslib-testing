import { createTestSuite, type TestSuite } from "./suite.ts";

// deno-lint-ignore no-explicit-any
type DeepPartial<T> = T extends (...args: any[]) => any ? T
  : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface ExtendOptions<Context, Options> {
  /**
   * Defaults for any additional options added to the new test function. These
   * should preferrably be namespaced to avoid collisions.
   *
   * @example
   * ```ts
   * {
   *  defaultOptions: {
   *    myExtension: {
   *      sayHello: true
   *    }
   *  }
   * }
   * ```
   */
  defaultOptions: Options;

  /**
   * A function used to to merge new options into the base options. It should
   * return a complete options object and avoid touching options that it doesn't
   * own.
   *
   * @param baseOptions The base options to merge the new options into.
   * @param newOptions The new options to merge.
   * @returns The merged options.
   *
   * @example
   * ```ts
   * mergeOptions(baseOptions, newOptions) {
   *   return {
   *     ...baseOptions,
   *     myExtension: {
   *       ...baseOptions.myExtension,
   *       ...newOptions.myExtension,
   *     }
   *   }
   * }
   * ```
   */
  mergeOptions: (
    baseOptions: Options,
    newOptions: DeepPartial<Options>,
  ) => Options;

  /**
   * A function that will be called to create a new test context before every
   * test. The created context will be passed to the test function.
   *
   * @param options The default options merged with any options configured using `test.configure()`.
   * @returns The created context, optionally with a `dispose` method to clean up resources after the test.
   *
   * @example
   * ```ts
   * createContext(options) {
   *   const browserContext = browser.newContext();
   *   const page = browserContext.newPage();
   *
   *   return {
   *     context: {
   *       page
   *     },
   *     dispose: async (context) => {
   *       await page.close();
   *       await browserContext.close();
   *     }
   *   }
   * }
   * ```
   */
  createContext: (
    options: Options,
  ) => Promise<Disposable<Context>> | Disposable<Context>;
}

export interface TestFunction<Context, Options> {
  /**
   * Define a test case with the given name and function.
   *
   * @param name The name of the test case.
   * @param fn The test function, which receives the test context and options.
   */
  (
    name: string,
    fn: (context: Context & { options: Options }) => Promise<void> | void,
  ): void;

  /**
   * Create a custom test function with additional context parameters. This can be
   * used to create more specialized functions that e.g. manages resources such as
   * database connections, browser instances, etc.
   *
   * @param options The options for extending the test function.
   * @returns New test functions that can access the additional context.
   */
  extend<NewContext, NewOptions>(
    options: ExtendOptions<NewContext, NewOptions>,
  ): TestFunctions<Context & NewContext, Options & NewOptions>;

  /**
   * Creates a new test function with the given options merged into the base options.
   *
   * @param newOptions The new options to merge into the base options.
   * @returns A new test function with the merged options.
   */
  configure(newOptions: DeepPartial<Options>): TestFunction<Context, Options>;

  /**
   * Creates a new test suite using the current test function configuration.
   *
   * @param suite An optional test suite to use as the base for the new suite. If not provided, a new suite will be created.
   * @returns New test functions that will run tests in the given suite.
   */
  suite(suite?: TestSuite): TestFunctions<Context, Options>;
}

interface Disposable<Context> {
  context: Context;
  dispose?: (context: Context) => Promise<void> | void;
}

interface MakeTestFunctionArgs<Context, Options> {
  suite: TestSuite;
  options: Options;
  createContext: (
    options: Options,
  ) => Promise<Disposable<Context>> | Disposable<Context>;
  mergeOptions(baseOptions: Options, newOptions: DeepPartial<Options>): Options;
}

export interface TestFunctions<Context, Options> {
  test: TestFunction<Context, Options>;
  it: TestFunction<Context, Options>;
  describe: (name: string, fn: () => void) => void;
}

export function makeTestFunction<Context, Options>(
  { suite, options, createContext, mergeOptions }: MakeTestFunctionArgs<
    Context,
    Options
  >,
): TestFunctions<Context, Options> {
  function testFn(
    name: string,
    fn: (context: Context & { options: Options }) => Promise<void> | void,
  ) {
    suite.add({
      type: "test",
      name,
      execute: async (self, testRun) => {
        const { context, dispose } = await createContext(options);

        try {
          testRun.start(self);

          await fn({ ...context, options });

          testRun.pass(self);
        } catch (err) {
          testRun.fail(self, err);
        } finally {
          await dispose?.(context);
        }
      },
    });
  }

  function extend<NewContext, NewOptions>(
    {
      defaultOptions,
      mergeOptions: mergeChildOptions,
      createContext: createChildContext,
    }: ExtendOptions<
      NewContext,
      NewOptions
    >,
  ): TestFunctions<Context & NewContext, Options & NewOptions> {
    return makeTestFunction({
      suite,

      options: { ...options, ...defaultOptions },

      createContext: async (opts) => {
        const parentContext = await createContext(opts);
        const childContext = await createChildContext(opts);

        return {
          context: {
            ...parentContext.context,
            ...childContext.context,
          },
          dispose: async () => {
            await Promise.all([
              childContext.dispose?.(childContext.context),
              parentContext.dispose?.(parentContext.context),
            ]);
          },
        };
      },

      mergeOptions: (baseOptions, newOptions) => {
        return {
          ...mergeOptions(baseOptions, newOptions),
          ...mergeChildOptions(baseOptions, newOptions),
        };
      },
    });
  }

  function configure(
    newOptions: DeepPartial<Options>,
  ): TestFunction<Context, Options> {
    return makeTestFunction<Context, Options>({
      suite,
      options: mergeOptions(options, newOptions),
      createContext,
      mergeOptions,
    }).test;
  }

  function suiteFn(suite = createTestSuite()): TestFunctions<Context, Options> {
    return makeTestFunction<Context, Options>({
      suite,
      options,
      createContext,
      mergeOptions,
    });
  }

  const test = Object.assign(testFn, {
    extend,
    configure,
    suite: suiteFn,
  });

  return {
    test,
    it: test,
    describe: (name: string, fn: () => void) => {
      suite.enterGroup(name, fn);
    },
  };
}
