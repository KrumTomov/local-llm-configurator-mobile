import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";

export async function requirePageSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-1 bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
              NeuroForge
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <Link href="/configurations" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100">
              Configs
            </Link>
            <Link href="/agents" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100">
              Agents
            </Link>
            <Link href="/prompts" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100">
              Prompts
            </Link>
            <Link href="/monitoring" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100">
              Monitoring
            </Link>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
