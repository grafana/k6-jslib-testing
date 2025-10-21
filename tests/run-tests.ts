async function runTests() {
  const listener = Deno.listen({ hostname: "127.0.0.1", port: 0 });
  const serverPort = (listener.addr as Deno.NetAddr).port;
  listener.close();
  const serverBaseUrl = `http://127.0.0.1:${serverPort}`;

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
