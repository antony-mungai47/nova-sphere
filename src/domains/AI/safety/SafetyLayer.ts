/**
 * Safety Layer to intercept and validate inputs/outputs before they reach the LLM.
 */
export class SafetyLayer {
  private static readonly PII_REGEX = /\b(?:\d[ -]*?){13,16}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

  /**
   * Scrubs potential Personally Identifiable Information (Emails, Credit Cards, etc.)
   */
  public sanitizeInput(input: string): string {
    return input.replace(SafetyLayer.PII_REGEX, "[REDACTED]");
  }

  /**
   * Validates the LLM output against a set of rules (e.g. no markdown, must be JSON, etc.)
   */
  public validateOutput(output: string, expectedFormat: "json" | "text" = "text"): boolean {
    if (expectedFormat === "json") {
      try {
        JSON.parse(output);
        return true;
      } catch (e) {
        return false;
      }
    }
    return output.trim().length > 0;
  }
}

export const GlobalSafety = new SafetyLayer();
