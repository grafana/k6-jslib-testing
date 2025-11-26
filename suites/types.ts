export class TestCaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface TestRunContext {
  start: (test: TestCase) => void;
  pass: (test: TestCase) => void;
  fail: (test: TestCase, error: Error) => void;
}

export interface TestCase {
  type: "test";
  name: string;
  execute: (self: TestCase, context: TestRunContext) => Promise<void>;
}

export interface TestGroup {
  type: "group";
  name: string;
  children: TestItem[];
}

interface TestCaseResultBase {
  meta: {
    path: string[];
    name: string;
    duration: number;
  };
}

export interface TestCasePassed extends TestCaseResultBase {
  type: "pass";
}

export interface TestCaseFailed extends TestCaseResultBase {
  type: "fail";
  error: Error;
}

export type TestCaseResult = TestCasePassed | TestCaseFailed;

export type TestItem = TestCase | TestGroup;
