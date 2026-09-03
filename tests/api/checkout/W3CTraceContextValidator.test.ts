import { W3CTraceContextValidator } from "@/lib/observability/W3CTraceContextValidator";

describe("Gate 22-T: W3C Trace Context Semantic Compliance", () => {
  it("accepts valid standard W3C traceparent header", () => {
    const validHeader = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    const parsed = W3CTraceContextValidator.parse(validHeader);
    expect(parsed.valid).toBe(true);
    expect(parsed.version).toBe("00");
    expect(parsed.traceId).toBe("4bf92f3577b34da6a3ce929d0e0e4736");
    expect(parsed.parentId).toBe("00f067aa0ba902b7");
    expect(parsed.traceFlags).toBe("01");
  });

  it("rejects version 'ff' as forbidden by W3C specification", () => {
    const forbiddenHeader = "ff-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    const parsed = W3CTraceContextValidator.parse(forbiddenHeader);
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain("Version 'ff' is forbidden");
  });

  it("rejects all-zeros trace-id", () => {
    const allZerosTrace = "00-00000000000000000000000000000000-00f067aa0ba902b7-01";
    const parsed = W3CTraceContextValidator.parse(allZerosTrace);
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain("all-zeros trace-id");
  });

  it("rejects all-zeros parent-id", () => {
    const allZerosParent = "00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01";
    const parsed = W3CTraceContextValidator.parse(allZerosParent);
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain("all-zeros parent-id");
  });

  it("rejects version '00' headers with more than 4 delimiter parts", () => {
    const extraParts = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01-extra";
    const parsed = W3CTraceContextValidator.parse(extraParts);
    expect(parsed.valid).toBe(false);
    expect(parsed.error).toContain("must contain exactly 4 parts");
  });

  it("rejects invalid non-hex characters in trace-id", () => {
    const nonHex = "00-4bf92f3577b34da6a3ce929d0e0e473g-00f067aa0ba902b7-01";
    const parsed = W3CTraceContextValidator.parse(nonHex);
    expect(parsed.valid).toBe(false);
  });

  it("getOrGenerate restarts context with new non-zero IDs when given null or invalid headers", () => {
    const generated = W3CTraceContextValidator.getOrGenerate(null);
    const parsed = W3CTraceContextValidator.parse(generated);
    expect(parsed.valid).toBe(true);
    expect(parsed.traceId).not.toBe("00000000000000000000000000000000");
    expect(parsed.parentId).not.toBe("0000000000000000");
  });
});
