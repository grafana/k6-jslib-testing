// Type declarations for external modules and globals used during type generation

// Declare k6 browser module with minimal types needed for declaration generation
declare module "k6/browser" {
  export interface Locator {
    clear(): Promise<void>;
    isEnabled(): Promise<boolean>;
    isHidden(): Promise<boolean>;
    getAttribute(name: string): Promise<string | null>;
    selectOption(...args: unknown[]): Promise<void>;
    press(key: string, options?: unknown): Promise<void>;
    type(text: string, options?: unknown): Promise<void>;
    dispatchEvent(event: string, eventInit?: unknown): Promise<void>;
    dblclick(options?: unknown): Promise<void>;
    setChecked(checked?: boolean, options?: unknown): Promise<void>;
    isDisabled(): Promise<boolean>;
    focus(options?: unknown): Promise<void>;
    innerText(): Promise<string>;
    inputValue(): Promise<string>;
    check(options?: unknown): Promise<void>;
    isEditable(): Promise<boolean>;
    fill(value: string, options?: unknown): Promise<void>;
    textContent(): Promise<string | null>;
    hover(options?: unknown): Promise<void>;
    waitFor(options?: unknown): Promise<void>;
    click(options?: unknown): Promise<void>;
    uncheck(options?: unknown): Promise<void>;
    isChecked(): Promise<boolean>;
    isVisible(): Promise<boolean>;
    innerHTML(): Promise<string>;
    tap(options?: unknown): Promise<void>;
  }
  export interface Page {
    title(): Promise<string>;
    goto(url: string, options?: unknown): Promise<void>;
    url(): string;
    close(options?: unknown): Promise<void>;
    mainFrame(): unknown;
    waitForLoadState(state?: string): Promise<void>;
    locator(selector: string, options?: unknown): Locator;
  }
}

// Declare Deno global for environment.ts
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
    toObject(): Record<string, string>;
  };
}
