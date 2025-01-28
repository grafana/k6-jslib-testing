async function runTests() {
    // Start the test server
    const server = new Deno.Command("deno", {
      args: ["run", "--allow-net", "--allow-read", "tests/testserver.ts"],
      stdout: "inherit",
      stderr: "inherit",
    });
    const serverProcess = server.spawn();
  
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    try {
      // Run the tests
      const tests = [
        ["k6", "run", "--quiet", "--no-summary", "tests/expect-non-retrying.js"],
        ["k6", "run", "--quiet", "--no-summary", "tests/expect-retrying.js"],
      ];
  
      for (const args of tests) {
        const test = new Deno.Command(args[0], {
          args: args.slice(1),
          stdout: "inherit",
          stderr: "inherit",
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