import Link from "next/link";

import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { getDashboardOverview } from "@/lib/neuroforge";

export default async function DashboardPage() {
  const session = await requirePageSession();
  const overview = await getDashboardOverview(session);

  return (
    <PageShell
      title={`Operations grid: ${session.displayName}`}
      description="Monitor model sessions, benchmark throughput, agent readiness, and infrastructure activity from the NeuroForge command deck."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Models" value={overview.totals.models} />
        <Metric label="Configs" value={overview.totals.configurations} />
        <Metric label="Benchmarks" value={overview.totals.benchmarks} />
        <Metric label="Agents" value={overview.totals.agents} />
        <Metric label="Active" value={overview.totals.activeSessions} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">Performance Center</h2>
            <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-xs text-cyan-300">
              LIVE
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Metric
              label="Avg tokens/sec"
              value={Math.round(Number(overview.performance.avgTokensPerSecond))}
            />
            <Metric
              label="Avg latency"
              value={`${Math.round(Number(overview.performance.avgLatencyMs))}ms`}
            />
          </div>
          <div className="mt-5">
            <Link href="/benchmarks" className="text-sm font-semibold text-cyan-800 hover:text-cyan-900">
              Open benchmark center
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Active Sessions</h2>
          <div className="mt-4 space-y-3">
            {overview.activeSessions.length ? (
              overview.activeSessions.map((item) => (
                <div key={item.session.id} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {item.session.sessionName}
                  </p>
                  <p className="text-xs text-slate-500">{item.model.name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No running model sessions.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Operations Log</h2>
        <div className="mt-4 grid gap-3">
          {overview.latestLogs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0">
              <p className="text-sm font-semibold text-slate-950">{log.title}</p>
              <p className="text-xs text-slate-500">{log.eventType} / {log.level}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
