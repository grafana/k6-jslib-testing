import { env } from "./environment.ts";

// Helper function to set an environment variable for the duration of a test
export function withEnv(key: string, value: string, fn: () => void) {
  const originalValue = env[key];
  env[key] = value;
  try {
    fn();
  } finally {
    env[key] = originalValue;
  }
}
