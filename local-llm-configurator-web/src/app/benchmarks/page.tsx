import { BenchmarkForm } from "@/app/components/platform-actions";
import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { listBenchmarks, listConfigurations, listModels } from "@/lib/neuroforge";

export default async function BenchmarksPage() {
  const session = await requirePageSession();
  const [models, configurations, benchmarks] = await Promise.all([
    listModels({ limit: 100 }),
    listConfigurations(session, { limit: 100 }),
    listBenchmarks(session, { limit: 40 }),
  ]);

  return (
    <PageShell
      title="Benchmark Center"
      description="Run synthetic or adapter-backed performance tests and compare tokens/sec, latency, VRAM, and context behavior."
    >
      <BenchmarkForm
        models={models.map((model) => ({ id: model.id, name: model.name }))}
        configurations={configurations.map(({ configuration }) => ({
          id: configuration.id,
          name: configuration.configName,
          modelId: configuration.modelId,
        }))}
      />
      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Benchmark</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Tok/s</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">VRAM</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map(({ benchmark, model }) => (
              <tr key={benchmark.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-950">{benchmark.benchmarkName}</td>
                <td className="px-4 py-3 text-slate-600">{model.name}</td>
                <td className="px-4 py-3 text-slate-600">{benchmark.tokensPerSecond}</td>
                <td className="px-4 py-3 text-slate-600">{benchmark.latencyMs}ms</td>
                <td className="px-4 py-3 text-slate-600">{benchmark.vramUsedMb}MB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
