async function runTests() {
  const candidatePorts = [
    8000,
    8001,
    8002,
    8003,
    8004,
    8005,
    8006,
    8007,
    8008,
    8009,
  ];
  let serverProcess: Deno.ChildProcess | null = null;
  let port: number | null = null;

  // Try to start the server on an available port from the list.
  for (const candidate of candidatePorts) {
    const server = new Deno.Command("deno", {
      args: [
        "run",
        "--allow-net",
        "--allow-read",
        "tests/testserver.ts",
        String(candidate),
      ],
      stdout: "inherit",
      stderr: "inherit",
    });
    const process = server.spawn();

    const startupResult = await Promise.race([
      process.status,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
    ]);

    if (startupResult === null || startupResult.success) {
      serverProcess = process;
      port = candidate;
      break;
    }
  }

  if (!serverProcess || port === null) {
    throw new Error("Failed to start test server on the available ports.");
  }

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
          TEST_SERVER_PORT: String(port),
        },
      });
      const status = await test.output();

      if (!status.success) {
        throw new Error(`Test failed: ${args.join(" ")}`);
      }
    }
  } finally {
    // Ensure server is stopped even if tests fail
    serverProcess.kill("SIGTERM");
  }
}

if (import.meta.main) {
  runTests().catch((error) => {
    console.error(error);
    Deno.exit(1);
  });
}
