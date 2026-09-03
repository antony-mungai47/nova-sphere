"use client";

import React, { createContext, useContext, useMemo } from "react";
import { TraceContext as ITraceContext } from "./TraceContext";

const defaultTraceId = "00000000000000000000000000000000";
const defaultSpanId = "0000000000000000";

const TraceContext = createContext<ITraceContext>({
  traceId: defaultTraceId,
  spanId: defaultSpanId,
  traceparent: `00-${defaultTraceId}-${defaultSpanId}-01`,
});

export const useTraceContext = () => useContext(TraceContext);

export const TraceProvider = ({
  children,
  traceId,
  spanId,
  traceparent,
}: {
  children: React.ReactNode;
  traceId?: string | null;
  spanId?: string | null;
  traceparent?: string | null;
}) => {
  const value = useMemo(() => {
    const tId = traceId || crypto.randomUUID().replace(/-/g, '');
    const sId = spanId || crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    const tp = traceparent || `00-${tId}-${sId}-01`;
    return {
      traceId: tId,
      spanId: sId,
      traceparent: tp,
    };
  }, [traceId, spanId, traceparent]);

  return (
    <TraceContext.Provider value={value}>
      {children}
    </TraceContext.Provider>
  );
};
