async function runExitCodeTests() {
  const tests = [
    {
      name:
        "soft-default: expect.soft() with default configuration (softMode='fail')",
      script: "tests/exit-codes/soft-default.js",
      expectedCode: 110,
      env: {},
    },
    {
      name: "soft-mode-throw: expect.configure({ softMode: 'throw' }).soft()",
      script: "tests/exit-codes/soft-mode-throw.js",
      expectedCode: 0, // softMode='throw' logs error but doesn't fail test
      env: {},
    },
    {
      name: "soft-mode-fail: expect.configure({ softMode: 'fail' }).soft()",
      script: "tests/exit-codes/soft-mode-fail.js",
      expectedCode: 110,
      env: {},
    },
    {
      name:
        "env-soft-mode-throw: K6_TESTING_SOFT_MODE='throw' environment variable",
      script: "tests/exit-codes/env-soft-mode-throw.js",
      expectedCode: 0, // softMode='throw' logs error but doesn't fail test
      env: { K6_TESTING_SOFT_MODE: "throw" },
    },
    {
      name:
        "env-soft-mode-fail: K6_TESTING_SOFT_MODE='fail' environment variable",
      script: "tests/exit-codes/env-soft-mode-fail.js",
      expectedCode: 110,
      env: { K6_TESTING_SOFT_MODE: "fail" },
    },
  ];

  console.log("\nRunning exit code tests...\n");

  for (const test of tests) {
    console.log(`Testing: ${test.name}`);

    const command = new Deno.Command("k6", {
      args: ["run", "--quiet", test.script],
      stdout: "inherit",
      stderr: "inherit",
      env: {
        K6_NO_API: "true",
        ...test.env,
      },
    });

    const status = await command.output();

    if (status.code !== test.expectedCode) {
      throw new Error(
        `Test failed: ${test.name}\n` +
          `  Expected exit code: ${test.expectedCode}\n` +
          `  Actual exit code: ${status.code}`,
      );
    }

    console.log(`  ✓ Exit code ${status.code} (as expected)\n`);
  }

  console.log("All exit code tests passed!\n");
}

async function runIntegrationTests() {
  const listener = Deno.listen({ hostname: "127.0.0.1", port: 0 });
  const serverPort = (listener.addr as Deno.NetAddr).port;
  listener.close();
  const serverBaseUrl = `http://127.0.0.1:${serverPort}`;

  console.log("Running integration tests with browser...\n");

  // Start the test server
  const server = new Deno.Command("deno", {
    args: [
      "run",
      "--allow-net",
      "--allow-read",
      "--allow-env",
      "tests/testserver.ts",
    ],
    stdout: "inherit",
    stderr: "inherit",
    env: {
      TEST_SERVER_PORT: String(serverPort),
    },
  });
  const serverProcess = server.spawn();

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Run the tests
    const tests = [
      [
        "k6",
        "run",
        "--quiet",
        "--summary-mode=disabled",
        "tests/expect-non-retrying.js",
      ],
      [
        "k6",
        "run",
        "--quiet",
        "--summary-mode=disabled",
        "tests/expect-retrying.js",
      ],
    ];

    for (const args of tests) {
      const test = new Deno.Command(args[0], {
        args: args.slice(1),
        stdout: "inherit",
        stderr: "inherit",
        env: {
          K6_NO_API: "true",
          TEST_SERVER_BASE_URL: serverBaseUrl,
        },
      });
      const status = await test.output();

      if (!status.success) {
        throw new Error(`Test failed: ${args.join(" ")}`);
      }
    }

    console.log("\nAll integration tests passed!\n");
  } finally {
    // Ensure server is stopped even if tests fail
    serverProcess.kill("SIGTERM");
  }
}

async function runTests() {
  // Run exit code tests first (fast, no server needed)
  await runExitCodeTests();

  // Then run integration tests with browser (requires test server)
  await runIntegrationTests();
}

if (import.meta.main) {
  runTests().catch((error) => {
    console.error(error);
    Deno.exit(1);
  });
}
