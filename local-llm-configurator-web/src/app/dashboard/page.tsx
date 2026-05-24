import { cookies } from "next/headers";
import Link from "next/link";

import { readSessionToken, sessionCookieName } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(sessionCookieName)?.value);

  if (!session) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Login required
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in to access your infrastructure planning workspace.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-cyan-700 px-5 text-sm font-semibold text-white transition hover:bg-cyan-800"
          >
            Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-800">
            Workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome, {session.displayName}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Your Local LLM Configurator dashboard is ready. From here the app can
            grow into model planning, device profiles, benchmarks, and deployment
            workflows.
          </p>
        </div>
      </div>
    </section>
  );
}
