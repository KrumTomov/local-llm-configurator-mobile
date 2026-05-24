import { PromptTestForm } from "@/app/components/platform-actions";
import { PageShell, requirePageSession } from "@/app/components/page-shell";
import { listModels, listPrompts } from "@/lib/neuroforge";

export default async function PromptsPage() {
  const session = await requirePageSession();
  const [models, prompts] = await Promise.all([
    listModels({ limit: 100 }),
    listPrompts(session, { limit: 80 }),
  ]);

  return (
    <PageShell
      title="Prompt Workspace"
      description="Save, version, organize, and test prompt templates across the available model registry."
    >
      <PromptTestForm
        models={models.map((model) => ({ id: model.id, name: model.name }))}
        prompts={prompts.map((prompt) => ({ id: prompt.id, title: prompt.title }))}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {prompts.map((prompt) => (
          <article key={prompt.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-950">{prompt.title}</h2>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                v{prompt.version}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{prompt.category} / {prompt.visibility}</p>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{prompt.content}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
