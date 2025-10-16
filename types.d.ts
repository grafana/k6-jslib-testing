// Type declarations for external modules and globals used during type generation

// Declare k6 browser module with minimal types needed for declaration generation
declare module "k6/browser" {
  export interface Locator {
    [key: string]: any;
  }
  export interface Page {
    [key: string]: any;
  }
}

// Declare Deno global for environment.ts
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    toObject(): Record<string, string>;
  };
}
