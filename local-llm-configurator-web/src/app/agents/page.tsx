import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { listAgents } from "@/lib/neuroforge";

export default async function AgentsPage() {
  const session = await requirePageSession();
  const agents = await listAgents(session, { limit: 60 });

  return (
    <PageShell
      title="AI Agent Templates"
      description="Reusable agent presets for research, pentesting, crypto analysis, coding, coaching, and RAG."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map(({ agent, model, configuration }) => (
          <article key={agent.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{agent.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{agent.category} / {agent.visibility}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{agent.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
              {model.name} {configuration ? `/ ${configuration.configName}` : ""}
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
