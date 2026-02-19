// Make sure all matchers and formatters are registered
import "./expect/matchers/index.ts";
import "./expect/formats/index.ts";

import type { Locator } from "k6/browser";
import type { ExpectConfig } from "./config.ts";
import { env } from "./environment.ts";
import { createMatchers } from "./expect/extend.ts";

// Helper function to create a test config with correct defaults
function createTestConfig(config: Partial<ExpectConfig> = {}): ExpectConfig {
  return {
    assertFn: config.assertFn !== undefined ? config.assertFn : undefined,
    soft: config.soft !== undefined ? config.soft : false,
    softMode: config.softMode !== undefined ? config.softMode : "throw",
    colorize: config.colorize !== undefined ? config.colorize : false,
    display: config.display !== undefined ? config.display : "inline",
  };
}

export function createMatchersWithSpy() {
  let receivedMessage: string | null = null;

  const spy = {
    called: false,
    getMessage() {
      return receivedMessage;
    },

    reset() {
      this.called = false;

      receivedMessage = null;
    },
  };

  return [
    spy,
    <Received>(received: Received, customMessage?: string) =>
      createMatchers<Received>({
        received,
        config: createTestConfig(),
        negated: false,
        message: customMessage,
        fail(message) {
          spy.called = true;
          receivedMessage = message;
        },
      }),
  ] as const;
}

export function createMockLocator(mock: Partial<Locator>) {
  return {
    "clear": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "isEnabled": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "isHidden": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "getAttribute": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "selectOption": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "press": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "type": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "dispatchEvent": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "dblclick": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "setChecked": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "isDisabled": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "focus": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "innerText": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "inputValue": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "check": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "isEditable": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "fill": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "textContent": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "hover": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "waitFor": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "click": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "uncheck": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "isChecked": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "isVisible": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "innerHTML": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    "tap": () => {
      return Promise.reject(new Error("Not implemented"));
    },
    ...mock,
  };
}

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
