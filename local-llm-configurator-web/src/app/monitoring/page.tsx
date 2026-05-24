import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { SessionStarter } from "@/app/components/platform-actions";
import { getSystemHealth, listConfigurations, listLogs, listModels, listSessions } from "@/lib/neuroforge";

export default async function MonitoringPage() {
  const session = await requirePageSession();
  const [health, sessions, logs, models, configurations] = await Promise.all([
    getSystemHealth(session),
    listSessions(session, { limit: 20 }),
    listLogs(session, { limit: 30 }),
    listModels({ limit: 100 }),
    listConfigurations(session, { limit: 100 }),
  ]);

  return (
    <PageShell
      title="Monitoring & Orchestration"
      description="Track running models, session status, system health, and operational logs."
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">System Health</h2>
            <p className="mt-3 text-3xl font-semibold text-cyan-800">{health.status}</p>
            <p className="mt-2 text-sm text-slate-600">Active sessions: {health.activeSessions}</p>
            <p className="mt-1 text-sm text-slate-600">Last check: {health.lastCheckedAt}</p>
          </div>
          <SessionStarter
            models={models.map((model) => ({ id: model.id, name: model.name }))}
            configurations={configurations.map(({ configuration }) => ({
              id: configuration.id,
              name: configuration.configName,
              modelId: configuration.modelId,
            }))}
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Sessions</h2>
            <div className="mt-4 space-y-3">
              {sessions.map(({ session: modelSession, model }) => (
                <div key={modelSession.id} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-950">{modelSession.sessionName}</p>
                  <p className="text-xs text-slate-500">{model.name} / {modelSession.status}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Logs</h2>
            <div className="mt-4 space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="text-sm font-semibold text-slate-950">{log.title}</p>
                  <p className="text-xs text-slate-500">{log.eventType} / {log.level}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
