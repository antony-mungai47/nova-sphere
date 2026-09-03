import * as crypto from "crypto";

export interface ParsedTraceContext {
  valid: boolean;
  version?: string;
  traceId?: string;
  parentId?: string;
  traceFlags?: string;
  error?: string;
}

export class W3CTraceContextValidator {
  private static INVALID_TRACE_ID = "00000000000000000000000000000000";
  private static INVALID_PARENT_ID = "0000000000000000";

  /**
   * Validates a traceparent header string strictly against the W3C Trace Context Level 1 specification.
   * Semantic rules:
   * 1. Version 'ff' is forbidden.
   * 2. Version '00' must have exactly 4 fields separated by hyphens.
   * 3. trace-id cannot be all zeros.
   * 4. parent-id cannot be all zeros.
   * 5. All fields must be hexadecimal characters.
   */
  public static parse(headerValue: string | null | undefined): ParsedTraceContext {
    if (!headerValue || typeof headerValue !== 'string') {
      return { valid: false, error: "Missing or non-string header" };
    }

    const trimmed = headerValue.trim().toLowerCase();
    const parts = trimmed.split('-');

    if (parts.length < 4) {
      return { valid: false, error: "Too few delimiter separated fields" };
    }

    const [version, traceId, parentId, traceFlags] = parts;

    // Version 'ff' is explicitly forbidden by W3C specification
    if (version === 'ff') {
      return { valid: false, error: "Version 'ff' is forbidden by W3C spec" };
    }

    // Version 00 must contain exactly 4 parts
    if (version === '00' && parts.length !== 4) {
      return { valid: false, error: "Version 00 must contain exactly 4 parts" };
    }

    // Version format
    if (!/^[0-9a-f]{2}$/.test(version)) {
      return { valid: false, error: "Invalid version format" };
    }

    // TraceId format & all-zeros check
    if (!/^[0-9a-f]{32}$/.test(traceId) || traceId === this.INVALID_TRACE_ID) {
      return { valid: false, error: "Invalid or all-zeros trace-id" };
    }

    // ParentId format & all-zeros check
    if (!/^[0-9a-f]{16}$/.test(parentId) || parentId === this.INVALID_PARENT_ID) {
      return { valid: false, error: "Invalid or all-zeros parent-id" };
    }

    // TraceFlags format
    if (!/^[0-9a-f]{2}$/.test(traceFlags)) {
      return { valid: false, error: "Invalid trace-flags format" };
    }

    return {
      valid: true,
      version,
      traceId,
      parentId,
      traceFlags
    };
  }

  /**
   * Returns a valid traceparent string. If the provided header is valid, it normalizes it.
   * If missing or malformed, it restarts the trace context with a newly generated W3C header.
   */
  public static getOrGenerate(headerValue: string | null | undefined): string {
    const parsed = this.parse(headerValue);
    if (parsed.valid && parsed.traceId && parsed.parentId && parsed.traceFlags) {
      return `${parsed.version}-${parsed.traceId}-${parsed.parentId}-${parsed.traceFlags}`;
    }
    const traceId = crypto.randomBytes(16).toString('hex');
    const parentId = crypto.randomBytes(8).toString('hex');
    return `00-${traceId}-${parentId}-01`;
  }
}
