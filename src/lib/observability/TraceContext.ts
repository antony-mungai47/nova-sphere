import { headers } from 'next/headers';

export interface TraceContext {
  traceId: string;
  spanId: string;
  traceparent: string;
  tracestate?: string;
}

export const getTraceContext = async (): Promise<TraceContext> => {
  try {
    const headersList = await headers();
    const traceparent = headersList.get('traceparent');
    const tracestate = headersList.get('tracestate') || undefined;

    if (traceparent) {
      const parts = traceparent.split('-');
      if (parts.length >= 4 && parts[0] === '00') {
        return {
          traceId: parts[1],
          spanId: parts[2],
          traceparent,
          tracestate,
        };
      }
    }

    // Fallback if traceparent header is missing
    const fallbackTraceId = crypto.randomUUID().replace(/-/g, '');
    const fallbackSpanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    const fallbackTraceparent = `00-${fallbackTraceId}-${fallbackSpanId}-01`;

    return {
      traceId: fallbackTraceId,
      spanId: fallbackSpanId,
      traceparent: fallbackTraceparent,
      tracestate,
    };
  } catch (e) {
    const errorTraceId = crypto.randomUUID().replace(/-/g, '');
    const errorSpanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    return {
      traceId: errorTraceId,
      spanId: errorSpanId,
      traceparent: `00-${errorTraceId}-${errorSpanId}-01`,
    };
  }
};
