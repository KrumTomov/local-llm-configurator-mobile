import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { listModels } from "@/lib/neuroforge";

export default async function ModelsPage() {
  await requirePageSession();
  const models = await listModels({ limit: 60 });

  return (
    <PageShell
      title="Model Registry"
      description="Manage local, cloud, and hybrid model metadata, hardware requirements, and availability."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => (
          <article key={model.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{model.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{model.provider} / {model.family}</p>
              </div>
              <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">
                {model.availability}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{model.description}</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div><dt className="text-slate-500">VRAM</dt><dd className="font-semibold text-slate-950">{model.recommendedVramMb ?? "-"} MB</dd></div>
              <div><dt className="text-slate-500">Context</dt><dd className="font-semibold text-slate-950">{model.contextWindow ?? "-"}</dd></div>
              <div><dt className="text-slate-500">Quant</dt><dd className="font-semibold text-slate-950">{model.quantization ?? "-"}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
