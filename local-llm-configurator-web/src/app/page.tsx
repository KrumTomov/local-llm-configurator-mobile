import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-1 items-center bg-slate-50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-800">
            Local AI operations
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Welcome to Local LLM Configurator
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Plan, compare, and prepare infrastructure for private local and
            hybrid LLM deployments from one focused workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <dt className="text-sm font-medium text-slate-500">Scope</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-950">
                Local
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Mode</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-950">
                Hybrid
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Focus</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-950">
                LLM Ops
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
