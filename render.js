import { colorize } from "./colors.ts";
/**
 * A registry of matchers error renderers.
 */
export class MatcherErrorRendererRegistry {
  static renderers = new Map();
  static config = { colorize: true, display: "pretty" };
  static register(matcherName, renderer) {
    this.renderers.set(matcherName, renderer);
  }
  static getRenderer(matcherName) {
    return this.renderers.get(matcherName) || new DefaultMatcherErrorRenderer();
  }
  static configure(config) {
    this.config = { ...this.config, ...config };
  }
  static getConfig() {
    return this.config;
  }
}
/**
 * Base class for all matcher error renderers that implements common functionality
 */
export class BaseMatcherErrorRenderer {
  getReceivedPlaceholder() {
    return "received";
  }
  getExpectedPlaceholder() {
    return "expected";
  }
  renderErrorLine(info, config) {
    const maybeColorize = (text, color) =>
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
  renderMatcherArgs(maybeColorize) {
    return maybeColorize(`()`, "darkGrey");
  }
  render(info, config) {
    const maybeColorize = (text, color) =>
      config.colorize ? colorize(text, color) : text;
    const lines = [
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
export class ReceivedOnlyMatcherRenderer extends BaseMatcherErrorRenderer {
  getSpecificLines(info, maybeColorize) {
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
export class ExpectedReceivedMatcherRenderer extends BaseMatcherErrorRenderer {
  getSpecificLines(info, maybeColorize) {
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
  renderMatcherArgs(maybeColorize) {
    return maybeColorize(`(`, "darkGrey") +
      maybeColorize(this.getExpectedPlaceholder(), "green") +
      maybeColorize(`)`, "darkGrey");
  }
}
/**
 * The default matcher error renderer.
 */
export class DefaultMatcherErrorRenderer {
  render(info, config) {
    const maybeColorize = (text, color) =>
      config.colorize ? colorize(text, color) : text;
    const lines = [
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
  renderErrorLine(info, config) {
    const maybeColorize = (text, color) =>
      config.colorize ? colorize(text, color) : text;
    return maybeColorize(`expect(`, "darkGrey") +
      maybeColorize(`received`, "red") +
      maybeColorize(`).`, "darkGrey") +
      maybeColorize(`${info.matcherName}`, "white") +
      maybeColorize(`(`, "darkGrey") +
      maybeColorize(`expected`, "green") +
      maybeColorize(`)`, "darkGrey");
  }
}
/**
 * Pretty format renderer that groups and aligns output
 *
 * Note that any stylization of the lines, such as colorization is expected to
 * be done by the caller.
 */
class PrettyFormatRenderer {
  renderLines(lines) {
    const maxLabelWidth = Math.max(
      ...lines
        .filter((line) => !line.raw)
        .map(({ label }) => (label + ":").length),
    );
    return "\n\n" + lines
      .map(({ label, value, raw }, index) => {
        let line;
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
class InlineFormatRenderer {
  renderLines(lines) {
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
  static formatters = new Map([
    ["pretty", new PrettyFormatRenderer()],
    ["inline", new InlineFormatRenderer()],
  ]);
  static getFormatter(format) {
    const formatter = this.formatters.get(format);
    if (!formatter) {
      throw new Error(`Unknown display format: ${format}`);
    }
    return formatter;
  }
}
