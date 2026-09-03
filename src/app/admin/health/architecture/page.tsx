import React from "react";
import { Telemetry, EventRingBuffer, BaseRuntimeEvent } from "@/lib/observability/Telemetry";
import { RuntimeGate } from "@/lib/observability/assertions";

export default async function ArchitectureHealthDashboard() {
  const events = EventRingBuffer.getEvents().reverse();
  const violations = RuntimeGate.getViolations();
  const orphanTraces = RuntimeGate.detectOrphanTraces(15000); // 15s max for dev testing

  // Categorize Events by Trace ID for Waterfall Replay
  const traceGroups = new Map<string, BaseRuntimeEvent[]>();
  events.forEach(e => {
    if (!traceGroups.has(e.traceId)) {
      traceGroups.set(e.traceId, []);
    }
    traceGroups.get(e.traceId)!.push(e);
  });

  const recentTraces = Array.from(traceGroups.entries()).slice(0, 10);

  // Compute Performance Seams
  const timedEvents = events.filter(e => e.durationMs !== undefined);
  const slowestService = timedEvents
    .filter(e => e.layer === 'Application')
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))[0];
  const slowestRepo = timedEvents
    .filter(e => e.layer === 'Infrastructure')
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))[0];

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-nova-silver bg-clip-text text-transparent">
            Architecture & Runtime Health
          </h1>
          <p className="text-sm text-nova-silver mt-1">
            W3C Tracing • Gate 11 Orphan Protection • StrictMode Aware • Dev Adapter
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
            <div className="text-xs text-nova-silver">Events Buffered</div>
            <div className="text-xl font-mono font-semibold text-white">{events.length}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
            <div className="text-xs text-red-400">Violations</div>
            <div className="text-xl font-mono font-semibold text-red-400">{violations.length}</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
            <div className="text-xs text-amber-400">Gate 11 Orphans</div>
            <div className="text-xl font-mono font-semibold text-amber-400">{orphanTraces.length}</div>
          </div>
        </div>
      </div>

      {/* Operator Question 1: Architecture & Boundary Breaches */}
      <div className="bg-nova-charcoal border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nova-blue"></span>
          1. Are there any active Architecture or Boundary Breaches?
        </h2>
        {violations.length === 0 && orphanTraces.length === 0 ? (
          <div className="bg-nova-emerald/10 border border-nova-emerald/20 text-nova-emerald p-4 rounded-xl text-sm">
            ✓ All architectural invariants pass cleanly. No duplicate provider instances or orphan traces detected.
          </div>
        ) : (
          <div className="space-y-3">
            {violations.map((v, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex justify-between items-center">
                <div>
                  <div className="font-semibold">{v.ruleId} ({v.severity})</div>
                  <div>{v.message}</div>
                </div>
                <span className="text-xs font-mono opacity-70">Trace: {v.traceId.slice(0, 8)}</span>
              </div>
            ))}
            {orphanTraces.map((o, i) => (
              <div key={`orphan-${i}`} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-sm flex justify-between items-center">
                <div>
                  <div className="font-semibold">{o.ruleId} (Gate 11)</div>
                  <div>{o.message}</div>
                </div>
                <span className="text-xs font-mono opacity-70">Trace: {o.traceId.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operator Question 2: Performance Seams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-nova-charcoal border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-nova-emerald"></span>
            2. Slowest Application Service
          </h2>
          {slowestService ? (
            <div className="bg-white/5 p-4 rounded-xl text-sm space-y-2">
              <div className="text-nova-emerald font-mono font-semibold">{slowestService.source}</div>
              <div className="text-nova-silver text-xs">Duration: {slowestService.durationMs}ms</div>
              <div className="text-xs font-mono opacity-60">Trace: {slowestService.traceId}</div>
            </div>
          ) : (
            <div className="text-nova-silver text-sm italic">No timed service calls recorded yet.</div>
          )}
        </div>

        <div className="bg-nova-charcoal border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            3. Slowest Repository Call
          </h2>
          {slowestRepo ? (
            <div className="bg-white/5 p-4 rounded-xl text-sm space-y-2">
              <div className="text-purple-400 font-mono font-semibold">{slowestRepo.source}</div>
              <div className="text-nova-silver text-xs">Duration: {slowestRepo.durationMs}ms</div>
              <div className="text-xs font-mono opacity-60">Trace: {slowestRepo.traceId}</div>
            </div>
          ) : (
            <div className="text-nova-silver text-sm italic">No timed repository calls recorded yet.</div>
          )}
        </div>
      </div>

      {/* Operator Question 3: Trace Timeline & Waterfall Replay */}
      <div className="bg-nova-charcoal border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nova-blue"></span>
          4. Trace Waterfall Timeline Replay (Causal Execution Flow)
        </h2>
        <div className="space-y-6">
          {recentTraces.map(([traceId, traceEvents]) => (
            <div key={traceId} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono border-b border-white/10 pb-2">
                <span className="text-nova-blue font-bold">W3C Trace: {traceId}</span>
                <span className="text-nova-silver">{traceEvents.length} spans recorded</span>
              </div>
              <div className="space-y-2">
                {traceEvents.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-xs">
                    <span className="w-24 text-nova-silver font-mono">{e.layer}</span>
                    <span className="w-48 font-medium text-white">{e.source}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-nova-silver">{e.type}</span>
                    {e.durationMs !== undefined && (
                      <span className="text-nova-emerald font-mono">{e.durationMs}ms</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
