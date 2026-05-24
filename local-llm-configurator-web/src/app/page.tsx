import Link from "next/link";

const capabilities = [
  ["Models", "Registry for Ollama, llama.cpp, vLLM and cloud providers"],
  ["Configs", "Hardware-aware inference profiles for real devices"],
  ["Benchmarks", "Tokens/sec, latency, VRAM and context performance"],
  ["Agents", "Reusable operators for research, code, RAG and security"],
];

export default function Home() {
  return (
    <section className="flex flex-1 items-center bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-800">
            AI Infrastructure Control Center
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            NeuroForge
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-600">
            Configure, monitor, benchmark, and orchestrate local and hybrid
            LLM infrastructure from one operational dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Open Control Center
            </Link>
            <Link
              href="/models"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Explore Models
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Runtime Grid</p>
              <p className="text-xs text-slate-500">Local + hybrid providers</p>
            </div>
            <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-xs text-cyan-300">
              ONLINE
            </span>
          </div>
          <div className="grid gap-3">
            {capabilities.map(([title, description]) => (
              <div
                key={title}
                className="rounded-md border border-slate-200 bg-slate-100 p-4"
              >
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
