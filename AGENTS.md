# k6-jslib-testing

Playwright-compatible assertion library for k6. Provides `expect` with auto-retrying browser matchers and synchronous value matchers.

## Architecture

TypeScript source in root and subdirectories (no `src/` folder). Deno for development/testing, esbuild bundles into ESM for k6 runtime distribution via jslib.k6.io.

The `expect` function dispatches by argument type: Locator/Page values get async retrying matchers (poll until timeout), everything else gets synchronous matchers. Both paths converge on a shared assert function that handles hard vs soft failure modes.

The assert layer has two runtime personalities: in Deno tests, a shim module throws on abort/fail. During esbuild bundling, the shim import is aliased to the real `k6/execution` module, which calls `exec.test.abort` (kills the entire test) or `exec.test.fail` (marks iteration failed, continues). This shim swap is the critical bridge between "testable in Deno" and "works in k6."

Configuration flows through three layers: hardcoded defaults < explicit config < `K6_TESTING_*` environment variables. Env vars always win -- even over explicit config passed by the user. This is intentional for CI overrides but surprising for library consumers.

Retrying matchers use a poll loop with configurable timeout and interval. The retry catches ALL errors (including assertion failures) and retries until success or timeout expiry. On final timeout, a new assertion error is generated -- the original error details are lost.

Test suites group tests via `describe`/`test`/`it` and track root groups per-file using stack trace introspection to determine the calling file path.

## Gotchas

- Env vars override explicit config, not the other way around. `ConfigLoader.load` spreads env last, so `K6_TESTING_TIMEOUT=1000` overrides `expect.configure({ timeout: 5000 })`.
- The shim swap means `exec.test.abort` in Deno throws a catchable error, but in k6 it terminates the process. Code that catches abort errors in unit tests may hide real failures in k6.
- Source files live in root, not in `src/`. The `tests/` directory is excluded from `deno test` (see deno.json). Integration tests in `tests/` require k6 + browser + local test server.
- Retrying assertions swallow all errors during the retry loop. If a locator is stale or the page crashed, you get a generic timeout message, not the real cause.
- `tsconfig.json` matches the `.gitignore` glob `*config*.json` but is tracked anyway. Git-aware tools may show confusing ignore/track conflicts.
- `dist/` is gitignored. Never commit build artifacts.
