import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { SmartConfigForm } from "@/app/components/platform-actions";
import { listConfigurations, listModels } from "@/lib/neuroforge";

export default async function ConfigurationsPage() {
  const session = await requirePageSession();
  const [models, configurations] = await Promise.all([
    listModels({ limit: 100 }),
    listConfigurations(session, { limit: 30 }),
  ]);

  return (
    <PageShell
      title="Smart Configurations"
      description="Generate and manage hardware-aware inference profiles for coding, RAG, agents, creative work, and security workflows."
    >
      <SmartConfigForm models={models.map((model) => ({ id: model.id, name: model.name }))} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {configurations.map(({ configuration, model }) => (
          <article key={configuration.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{configuration.configName}</h2>
            <p className="mt-1 text-sm text-slate-500">{model.name} / {configuration.useCaseCategory}</p>
            <dl className="mt-4 grid grid-cols-4 gap-3 text-sm">
              <div><dt className="text-slate-500">Temp</dt><dd className="font-semibold">{configuration.temperature}</dd></div>
              <div><dt className="text-slate-500">Ctx</dt><dd className="font-semibold">{configuration.contextSize}</dd></div>
              <div><dt className="text-slate-500">GPU</dt><dd className="font-semibold">{configuration.gpuLayers}</dd></div>
              <div><dt className="text-slate-500">Batch</dt><dd className="font-semibold">{configuration.batchSize}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
