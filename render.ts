import type { ExecutionContext } from "./execution.ts";
import { type ANSI_COLORS, colorize } from "./colors.ts";
import type { DisplayFormat, RenderConfig } from "./config.ts";

/**
 * The interface that all matchers error renderers must implement.
 */
export interface MatcherErrorRenderer {
  render(info: RenderedErrorInfo, config: RenderConfig): string;
}

/**
 * The data structure holding all info to be rendered when a matcher fails.
 *
 * Because some matchers require additional info to be rendered, we use a generic type
 * to allow for additional properties to be added to the info structure.
 */
export interface MatcherErrorInfo extends RenderedErrorInfo {
  matcherSpecific?: Record<string, unknown>;
  customMessage?: string;
}

/**
 * The data structure holding all info to be rendered.
 */
export interface RenderedErrorInfo {
  // The execution context of the assertion, holding the file name, line number, and column number
  // where the assertion was called.
  executionContext: ExecutionContext;

  // This would be something like: "expect(received).toBe(expected)"
  // plus color info or text appended for extra context.
  matcherName: string;

  // The underlying operation that was used to make the assertion. e.g. "Object.is".
  matcherOperation?: string;

  // The expected value. e.g. "false".
  expected: string;

  // The received value. e.g. "true".
  received: string;

  // The stacktrace of the assertion. e.g. "Error".
  stacktrace?: string;
}

/**
 * A registry of matchers error renderers.
 */
export class MatcherErrorRendererRegistry {
  private static renderers: Map<string, MatcherErrorRenderer> = new Map();
  private static config: RenderConfig = { colorize: true, display: "pretty" };

  static register(matcherName: string, renderer: MatcherErrorRenderer) {
    this.renderers.set(matcherName, renderer);
  }

  static getRenderer(matcherName: string): MatcherErrorRenderer {
    return this.renderers.get(matcherName) || new DefaultMatcherErrorRenderer();
  }

  static configure(config: RenderConfig) {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): RenderConfig {
    return this.config;
  }
}

/**
 * Base class for all matcher error renderers that implements common functionality
 */
export abstract class BaseMatcherErrorRenderer implements MatcherErrorRenderer {
  protected getReceivedPlaceholder(): string {
    return "received";
  }

  protected getExpectedPlaceholder(): string {
    return "expected";
  }

  protected abstract getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[];

  protected abstract getMatcherName(): string;

  protected renderErrorLine(
    info: RenderedErrorInfo,
    config: RenderConfig,
  ): string {
    const maybeColorize = (text: string, color: keyof typeof ANSI_COLORS) =>
      config.colorize ? colorize(text, color) : text;

    if ("customMessage" in info && typeof info.customMessage === "string") {
      return maybeColorize(info.customMessage, "white");
    }

    return maybeColorize(`expect(`, "darkGrey") +
      maybeColorize(this.getReceivedPlaceholder(), "red") +
      maybeColorize(`).`, "darkGrey") +
      maybeColorize(this.getMatcherName(), "white") +
      this.renderMatcherArgs(maybeColorize);
  }

  protected renderMatcherArgs(
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): string {
    return maybeColorize(`()`, "darkGrey");
  }

  render(info: MatcherErrorInfo, config: RenderConfig): string {
    const maybeColorize = (text: string, color: keyof typeof ANSI_COLORS) =>
      config.colorize ? colorize(text, color) : text;

    const lines: LineGroup[] = [
      { label: "Error", value: this.renderErrorLine(info, config), group: 1 },
      {
        label: "At",
        value: maybeColorize(
          info.executionContext.at || "unknown location",
          "darkGrey",
        ),
        group: 1,
      },

      ...this.getSpecificLines(info, maybeColorize),

      {
        label: "Filename",
        value: maybeColorize(info.executionContext.fileName, "darkGrey"),
        group: 99,
      },
      {
        label: "Line",
        value: maybeColorize(
          info.executionContext.lineNumber.toString(),
          "darkGrey",
        ),
        group: 99,
      },
    ];

    return DisplayFormatRegistry.getFormatter(config.display).renderLines(
      lines,
    );
  }
}

/**
 * Base class for matchers that only show the received value
 */
export abstract class ReceivedOnlyMatcherRenderer
  extends BaseMatcherErrorRenderer {
  protected getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 2,
      },
    ];
  }
}

/**
 * Base class for matchers that show both expected and received values
 */
export abstract class ExpectedReceivedMatcherRenderer
  extends BaseMatcherErrorRenderer {
  protected getSpecificLines(
    info: MatcherErrorInfo,
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): LineGroup[] {
    return [
      {
        label: "Expected",
        value: maybeColorize(info.expected, "green"),
        group: 2,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 2,
      },
    ];
  }

  protected override renderMatcherArgs(
    maybeColorize: (text: string, color: keyof typeof ANSI_COLORS) => string,
  ): string {
    return maybeColorize(`(`, "darkGrey") +
      maybeColorize(this.getExpectedPlaceholder(), "green") +
      maybeColorize(`)`, "darkGrey");
  }
}

/**
 * The default matcher error renderer.
 */
export class DefaultMatcherErrorRenderer implements MatcherErrorRenderer {
  render(info: RenderedErrorInfo, config: RenderConfig): string {
    const maybeColorize = (text: string, color: keyof typeof ANSI_COLORS) =>
      config.colorize ? colorize(text, color) : text;
    const lines: LineGroup[] = [
      { label: "Error", value: this.renderErrorLine(info, config), group: 1 },
      {
        label: "At",
        value: maybeColorize(
          info.executionContext.at || "unknown location",
          "darkGrey",
        ),
        group: 1,
      },

      {
        label: "Expected",
        value: maybeColorize(info.expected, "green"),
        group: 2,
      },
      {
        label: "Received",
        value: maybeColorize(info.received, "red"),
        group: 2,
      },

      {
        label: "Filename",
        value: maybeColorize(info.executionContext.fileName, "darkGrey"),
        group: 3,
      },
      {
        label: "Line",
        value: maybeColorize(
          info.executionContext.lineNumber.toString(),
          "darkGrey",
        ),
        group: 3,
      },
    ];

    return DisplayFormatRegistry.getFormatter(config.display).renderLines(
      lines,
    );
  }

  protected renderErrorLine(
    info: RenderedErrorInfo,
    config: RenderConfig,
  ): string {
    const maybeColorize = (text: string, color: keyof typeof ANSI_COLORS) =>
      config.colorize ? colorize(text, color) : text;

    if ("customMessage" in info && typeof info.customMessage === "string") {
      return maybeColorize(info.customMessage, "white");
    }

    return maybeColorize(`expect(`, "darkGrey") +
      maybeColorize(`received`, "red") +
      maybeColorize(`).`, "darkGrey") +
      maybeColorize(`${info.matcherName}`, "white") +
      maybeColorize(`(`, "darkGrey") +
      maybeColorize(`expected`, "green") +
      maybeColorize(`)`, "darkGrey");
  }
}

interface DisplayFormatRenderer {
  renderLines(lines: LineGroup[]): string;
}

/**
 * Pretty format renderer that groups and aligns output
 *
 * Note that any stylization of the lines, such as colorization is expected to
 * be done by the caller.
 */
class PrettyFormatRenderer implements DisplayFormatRenderer {
  renderLines(lines: LineGroup[]): string {
    const maxLabelWidth = Math.max(
      ...lines
        .filter((line) => !line.raw)
        .map(({ label }: { label: string }) => (label + ":").length),
    );

    return "\n\n" + lines
      .map(({ label, value, raw }, index) => {
        let line: string;
        if (raw) {
          line = value;
        } else {
          const labelWithColon = label + ":";
          const spaces = " ".repeat(maxLabelWidth - labelWithColon.length);
          line = spaces + labelWithColon + " " + value;
        }

        // Add newlines before a new group of lines (except for the first group)
        const nextLine = lines[index + 1];
        if (nextLine && lines[index].group !== nextLine.group) {
          return line + "\n";
        }
        return line;
      })
      .join("\n") +
      "\n\n";
  }
}

/**
 * Inline format renderer that outputs in logfmt style
 */
class InlineFormatRenderer implements DisplayFormatRenderer {
  renderLines(lines: LineGroup[]): string {
    return lines
      .map(({ label, value }) => {
        // Escape any spaces or special characters in the value
        const escapedValue = typeof value === "string"
          ? value.includes(" ") ? `"${value}"` : value
          : value;
        // Convert label to lowercase and replace spaces with underscores
        const escapedLabel = label.toLowerCase().replace(/\s+/g, "_");
        return `${escapedLabel}=${escapedValue}`;
      })
      .join(" ");
  }
}

class DisplayFormatRegistry {
  private static formatters: Map<DisplayFormat, DisplayFormatRenderer> =
    new Map([
      ["pretty", new PrettyFormatRenderer()],
      ["inline", new InlineFormatRenderer()],
    ]);

  static getFormatter(format: DisplayFormat): DisplayFormatRenderer {
    const formatter = this.formatters.get(format);
    if (!formatter) {
      throw new Error(`Unknown display format: ${format}`);
    }
    return formatter;
  }
}

/**
 * A line with a label and a value.
 *
 * The label is the text before the colon, and the value is the text after the colon.
 *
 * The group number is used to align the lines at the same column and group them into
 * newline separated sections.
 */
export interface LineGroup {
  // The label of the line.
  label: string;

  // The value of the line.
  value: string;

  // The group number of the line. Lines with the same group number are aligned at the same column.
  group?: number;

  // If true, the line is not formatted and is output as raw text.
  raw?: boolean;
}
