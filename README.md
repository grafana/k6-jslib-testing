# k6-testing

A seamless way to write functional tests in k6 with Playwright-compatible
assertions.

> ⚠️ **Note**: This project is under active development. While it is functional,
> it is not yet ready for production use, expect bugs, and potential breaking
> changes.

## Why k6-testing?

- **✨ Write once, run anywhere**: Copy-paste your Playwright test assertions
  directly into k6 - they'll work out of the box
- **🎯 Fail fast**: Tests interrupt immediately when assertions fail, giving you
  quick, clear feedback
- **🎭 Familiar API**: Familiar API for anyone coming from Playwright, Deno, or
  Vite ecosystem
- **🔍 Clear error messages**: Get detailed, actionable feedback when tests fail

## Installation

k6-testing is available as a [k6 jslib](https://jslib.k6.io). It can be directly
imported as a dependency in your k6 script.

```sh
import { expect } from "https://jslib.k6.io/k6-testing/0.3.0/index.js";
```

## Quick Start

The following example demonstrates how to use k6-testing in a k6 script.

The module exposes the `expect` function, which behaves in a similar way to
[Playwright's `expect` function](https://playwright.dev/docs/test-assertions).

To make an assertion, call `expect(value)` and choose a matcher that reflects
the expectation.

```javascript
import { browser } from "k6/browser";
import http from "k6/http";

import { expect } from "https://jslib.k6.io/k6-testing/0.3.0/index.js";

export const options = {
  scenarios: {
    // Protocol tests
    protocol: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
      exec: "protocol",
    },

    // Browser tests
    ui: {
      executor: "shared-iterations",
      options: {
        browser: {
          type: "chromium",
        },
      },
      exec: "ui",
    },
  },
};

export function protocol() {
  // Get the home page of k6's Quick Pizza app
  const response = http.get("https://quickpizza.grafana.com/");

  // Simple assertions
  expect(response.status).toBe(200);
}

export async function ui() {
  const page = await browser.newPage();

  try {
    await page.goto("https://quickpizza.grafana.com/");
    await page.waitForLoadState("networkidle"); // waits until the `networkidle` event

    // Assert the "Pizza Please" button is visible
    await expect(page.locator("button[name=pizza-please]")).toBeVisible();
  } finally {
    await page.close();
  }
}
```

For functional testing, metrics and performance are most likely irrelevant, and
we recommend executing k6 functional tests in headless mode:

```sh
# Run k6 in headless mode
k6 run --no-summary --quiet examples/browser.js

# If any assertion/expectation fail, a non-zero exit code will be returned
echo $status
```

## Features

### 1. Playwright-Compatible Expectations

Use the same assertions you know from Playwright:

```javascript
// These Playwright assertions work exactly the same in k6
await expect(page.locator(".button")).toBeVisible();
await expect(page.locator("input")).toHaveValue("test");
await expect(page).toHaveTitle("My Page Title");
```

### 2. Auto-Retrying Assertions

Perfect for UI testing, these assertions will retry until the assertion passes,
or the assertion timeout is reached. Note that retrying assertions are async, so
you must await them.

By default, the timeout for assertions is set to 5 seconds, and the polling
interval is set to 100 milliseconds.

**Element Assertions (for Locators):**

| Assertion                            | Description                                           |
| ------------------------------------ | ----------------------------------------------------- |
| `toBeChecked(opts?)`                 | Element is checked                                    |
| `toBeDisabled(opts?)`                | Element is disabled                                   |
| `toBeEditable(opts?)`                | Element is editable                                   |
| `toBeEmpty(opts?)`                   | Element is empty                                      |
| `toBeEnabled(opts?)`                 | Element is enabled                                    |
| `toBeHidden(opts?)`                  | Element is hidden                                     |
| `toBeVisible(opts?)`                 | Element is visible                                    |
| `toContainText(text, opts?)`         | Element contains text.                                |
| `toHaveAttribute(attribute, value?)` | Element has specific attribute and, optionally, value |
| `toHaveText(text, opts?)`            | Element has text.                                     |
| `toHaveValue(value)`                 | Element has specific value                            |

**Page Assertions (for Pages):**

| Assertion                  | Description                          |
| -------------------------- | ------------------------------------ |
| `toHaveTitle(text, opts?)` | Page title matches the expected text |

You can customize these values by passing an options object as the second
argument to the assertion function:

```javascript
// Element assertions on locators
await expect(page.locator(".button")).toBeVisible({
  timeout: 10000,
  interval: 500,
});

// Page assertions on page objects
await expect(page).toHaveTitle("Expected Title", {
  timeout: 5000,
});
```

### 3. Standard Assertions

These assertions allow to test any conditions, but do not auto-retry.

| Assertion                            | Description                                                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `toBe(expected)`                     | Strict equality comparison                                                                                                                |
| `toBeCloseTo(number, precision?)`    | Number comparison with precision                                                                                                          |
| `toBeDefined()`                      | Asserts a value is defined                                                                                                                |
| `toBeFalsy()`                        | Falsy value check                                                                                                                         |
| `toBeGreaterThan(number)`            | Greater than comparison                                                                                                                   |
| `toBeGreaterThanOrEqual(number)`     | Greater than or equal comparison                                                                                                          |
| `toBeInstanceOf(expected)`           | Asserts a value is an instance of a class                                                                                                 |
| `toBeLessThan(number)`               | Less than comparison                                                                                                                      |
| `toBeLessThanOrEqual(number)`        | Less than or equal comparison                                                                                                             |
| `toBeNaN()`                          | Asserts a value is NaN                                                                                                                    |
| `toBeNull()`                         | Asserts a value is null                                                                                                                   |
| `toBeTruthy()`                       | Asserts a value is truthy                                                                                                                 |
| `toBeUndefined()`                    | Asserts a value is undefined                                                                                                              |
| `toContain(expected)`                | When `expected` is a string, asserts the string contains a substring. When `expected` is an Array or Set, asserts it contains an element. |
| `toContainEqual(expected)`           | Asserts an Array or Set contains a similar element                                                                                        |
| `toEqual(expected)`                  | Deep equality comparison                                                                                                                  |
| `toHaveLength(expected)`             | Asserts a value has a length property equal to expected                                                                                   |
| `toHaveProperty(keyPath, expected?)` | Ensures that property at provided `keyPath` exists in the object and optionally checks that property is equal to `expected`.              |

#### 4. Negating matchers

You can negate any matcher by adding `.not` before the matcher method. This
inverts the assertion, checking that the condition is false rather than true:

```javascript
// Standard assertions
expect(response.status).not.toBe(404); // Assert status is NOT 404
expect(response.json().items).not.toBeEmpty(); // Assert items array is not empty
expect(user.permissions).not.toContain("admin"); // Assert user doesn't have admin permission

// Retrying assertions (must be awaited)
await expect(page.locator(".error-message")).not.toBeVisible(); // Assert error is not shown
await expect(page.locator('button[type="submit"]')).not.toBeDisabled(); // Assert button is not disabled
```

Negation is particularly useful in k6 testing scenarios such as:

- Verifying error conditions aren't present:
  `await expect(page.locator('.error')).not.toBeVisible()`
- Ensuring unauthorized access is blocked:
  `expect(response.status).not.toBe(200)`
- Confirming elements are removed after an action:
  `await expect(page.locator('#item-1')).not.toBeVisible()`

**Note:** When using negated retrying assertions, the assertion will keep
retrying until the condition becomes false or the timeout is reached. For
example, `await expect(locator).not.toBeVisible()` will pass immediately if the
element is hidden, but will retry until timeout if the element is visible,
hoping it will disappear.

#### 5. Soft assertions

By default, failed assertions will terminate the test execution. The k6 testing
library also supports _soft assertions_: failed soft assertions **do not**
terminate the test execution, but mark the test as failed, leading k6 to
eventually exit with code `110`.

```javascript
import exec from "k6/execution";
import { expect } from "https://jslib.k6.io/k6-testing/0.4.0/index.js";

export const options = {
  vus: 2,
  iterations: 10,
};

export default function () {
  // Iteration 3 will mark the test as failed, but the test execution
  // will keep going until its end condition, and eventually exit with
  // code 110.
  if (exec.scenario.iterationInInstance === 3) {
    expect.soft(false).toBeTruthy();
  }
}
```

Note that soft assertions can be
[configured to throw an exception](#6-configuration), and effectively failing
the iteration where it happens instead.

#### 5. Custom expect messages

When writing tests, clear and informative error messages can significantly speed
up debugging. You can specify a custom error message as the second argument to
the expect function. This message will be displayed whenever the assertion
fails, providing additional context about the failure.

**Example:**

```javascript
expect(value, "Custom message").toHaveProperty("a.b[0]", 43);
```

If this assertion fails, the error message will clearly indicate the issue along
with your custom message:

```
                     Error: Custom message
                        At: /Users/me/myProject/expectNonRetrying.ts:555:15

             Property path: a.b[0]
Expected property to equal: 43
           Received object: {"a":{"b":[42]},"c":true}

                  Filename: expectNonRetrying.ts
                      Line: 555
```

#### 6. Configuration

You can create a new expect instance with the `.configure` method. This will
allow you to configure the behavior of the assertions. The configuration is
applied to all assertions made using the expect instance.

##### Available configuration options

The available configuration options are:

| Option     | Default  | Environment variable   | Description                                                                                                                                       |
| ---------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colorize` | true     | `K6_TESTING_COLORIZE`  | Whether to colorize the output of the expect function.                                                                                            |
| `display`  | "pretty" | `K6_TESTING_DISPLAY`   | The display format to use. "pretty" (default) or "inline".                                                                                        |
| `timeout`  | 5000     | `K6_TESTING_TIMEOUT`   | Specific to retrying assertions. The timeout for assertions, in milliseconds.                                                                     |
| `interval` | 100      | `K6_TESTING_INTERVAL`  | Specific to retrying assertions. The polling interval for assertions, in milliseconds.                                                            |
| `softMode` | "fail"   | `K6_TESTING_SOFT_MODE` | Customize soft assertions behavior: `fail`(default) will mark the test as failed, `throw` will throw an exception and fail the iteration instead. |

##### Example with inline display and no colorization

```javascript
export default function () {
  // Create a new expect instance with the default configuration
  const myExpect = expect.configure({
    // Display assertions using an inline format, aimed towards making them more readable in logs
    display: "inline",

    // Disable colorization of the output of the expect function
    colorize: false,
  });

  // Use myExpect instead of expect, and it will use the configured display format and colorization
  await myExpect(true).toBe(false);

  // Note that you're still free to use the default expect instance, and it will not be affected by the configuration
  expect(true).toBe(false);
}
```

##### Example of controlling retrying assertions' timeout and polling interval

You can configure the default timeout and polling interval for assertions by
instantiating a new expect instance with the `.configure` method.

```javascript
export default function () {
  const myExpect = new expect.configure({ timeout: 10000, interval: 500 });

  // Use myExpect instead of expect, and it will use the configured timeout and interval
  // for all assertions.
  //
  // In this specific case, the assertion will retry until the button is visible, or the timeout is reached: every
  // 500ms, for a maximum of 10 seconds.
  await myExpect(page.locator(".button")).toBeVisible();
}
```

## Examples

### API Testing

```javascript
import { expect } from "https://jslib.k6.io/k6-testing/0.3.0/index.js";
import http from "k6/http";

export function setup() {
  // Ensure the API is up and running before running the tests
  // If the response is not 200, the test will fail immediately with
  // a non-zero exit code, display a user-friendly message, and stop the test.
  const response = http.get("https://api.example.com/health");
  expect(response.status).toBe(200);
}

export default function () {
  const response = http.get("https://api.example.com/users");
  expect(response.status).toBe(200);

  const json = response.json();
  expect(json.users).toBeDefined();
  expect(json.users).toBeInstanceOf(Array);
  expect(json.users[0].id).toBeGreaterThan(0);
}
```

### UI Testing

```javascript
import { expect } from "https://jslib.k6.io/k6-testing/0.3.0/index.js";
import { browser } from "k6/browser";

export const options = {
  scenarios: {
    ui: {
      executor: "shared-iterations",
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export default async function () {
  const page = await browser.newPage();

  try {
    // Navigate to the page
    await page.goto("https://test.k6.io/my_messages.php");

    // Type into the login input field: 'testlogin'
    const loc = await page.locator('input[name="login"]');
    await loc.type("testlogin");

    // Assert that the login input field is visible
    await expect(page.locator('input[name="login"]')).toBeVisible();

    // Expecting this to fail as we have typed 'testlogin' into the input instead of 'foo'
    await expect(page.locator('input[name="login"]')).toHaveValue("foo");
  } finally {
    await page.close();
  }
}
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues**: File bugs or feature requests on our GitHub issues page
2. **Submit PRs**: Code contributions are welcome
3. **Improve Docs**: Documentation improvements are always valuable

### Development Setup

The project supports development using
[Dev Containers](https://containers.dev/), which provides a consistent,
pre-configured development environment with all necessary tools installed. This
is the recommended way to develop k6-testing.

To use the Dev Container:

1. Ensure you have Docker installed
2. Use a Dev Containers compatible editor:
   - VS Code with the "Remote - Containers" extension
   - JetBrains IDEs with the "Remote Development" plugin
   - Any other editor that supports Dev Containers
3. Open the project in your editor - it should automatically detect the Dev
   Container configuration and prompt you to reopen in container

The Dev Container comes with:

- Deno
- k6
- chromium (for browser testing)

### Development Workflow

k6-testing is built with [Deno](https://deno.land), and
[esbuild](https://esbuild.github.io/). Deno is used for the development of the
library itself, as well as unit testing, and the output distributable files are
built with esbuild.

The following commands are used throughout the development process:

- `deno task build` - Build the distributable files
- `deno task release` - Build the distributable files in release mode
- `deno test` - Run unit tests
- `deno task test` - Run integration tests
- `deno lint *.ts` - Report linting errors
- `deno fmt *.ts` - Format the code

The following files are must known when working on the project:

- `mod.ts` - The main entry point for the expect library, defines the public API
- `expect.ts` - The main entry point for the expect library
- `expectNonRetrying.ts` - Contains the non-retrying assertions definition and
  implementation
- `expectRetrying.ts` - Contains the retrying assertions definition and
  implementation
- The `tests/` directory contains the integration tests for the expect library

During development, a typical workflow would consist in the following steps:

1. Make changes to the code
2. Run `deno fmt *.ts` to format the code
3. Run `deno lint *.ts` to report linting errors
4. Run `deno task build` to (verify) build the code
5. Run `deno test` to run unit tests
6. Run `deno task test` to run integration tests
7. (optional) import `dist/index.js` in a k6 script and run it with
   `k6 run --no-summary --quiet <script>.js` to verify that the library works as
   expected

## License

[Apache 2.0 License](LICENSE)
