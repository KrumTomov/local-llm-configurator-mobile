"use client";

import { FormEvent, useState } from "react";

type PlatformActionsProps = {
  models: Array<{ id: number; name: string }>;
  configurations?: Array<{ id: number; name: string; modelId: number }>;
  prompts?: Array<{ id: number; title: string }>;
};

export function SmartConfigForm({ models }: PlatformActionsProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Generating configuration...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/configurations/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    setMessage(response.ok ? "Configuration generated." : "Generation failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Smart Configuration Generator</h2>
      <select name="modelId" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <select name="useCaseCategory" className="h-10 rounded-md border border-slate-300 px-3 text-sm">
        <option value="coding">Coding</option>
        <option value="rag">RAG</option>
        <option value="agents">Agents</option>
        <option value="creative_writing">Creative writing</option>
        <option value="cybersecurity">Cybersecurity</option>
      </select>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="gpuModel" placeholder="GPU model" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
        <input name="gpuVramMb" type="number" placeholder="VRAM MB" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
        <input name="totalRamMb" type="number" placeholder="RAM MB" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
      </div>
      <button className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800">
        Generate
      </button>
      {message ? <p className="text-sm font-medium text-cyan-800">{message}</p> : null}
    </form>
  );
}

export function BenchmarkForm({ models, configurations = [] }: PlatformActionsProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Running benchmark...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/benchmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    setMessage(response.ok ? "Benchmark completed." : "Benchmark failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Benchmark Runner</h2>
      <select name="modelId" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <select name="configurationId" className="h-10 rounded-md border border-slate-300 px-3 text-sm">
        <option value="">No configuration</option>
        {configurations.map((configuration) => (
          <option key={configuration.id} value={configuration.id}>
            {configuration.name}
          </option>
        ))}
      </select>
      <textarea
        name="benchmarkPrompt"
        rows={4}
        placeholder="Benchmark prompt"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        defaultValue="Explain how to operate a local LLM deployment safely."
      />
      <button className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800">
        Run benchmark
      </button>
      {message ? <p className="text-sm font-medium text-cyan-800">{message}</p> : null}
    </form>
  );
}

export function PromptTestForm({ models, prompts = [] }: PlatformActionsProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Testing prompt...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/prompts/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json().catch(() => null);

    setMessage(response.ok ? payload.data.output : "Prompt test failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Prompt Test Console</h2>
      <select name="promptId" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required>
        {prompts.map((prompt) => (
          <option key={prompt.id} value={prompt.id}>
            {prompt.title}
          </option>
        ))}
      </select>
      <select name="modelId" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <button className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800">
        Test prompt
      </button>
      {message ? <p className="text-sm leading-6 text-slate-700">{message}</p> : null}
    </form>
  );
}

export function SessionStarter({ models, configurations = [] }: PlatformActionsProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Starting session...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    setMessage(response.ok ? "Session started." : "Session failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Model Orchestrator</h2>
      <input name="sessionName" placeholder="Session name" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
      <select name="modelId" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <select name="configurationId" className="h-10 rounded-md border border-slate-300 px-3 text-sm" required>
        {configurations.map((configuration) => (
          <option key={configuration.id} value={configuration.id}>
            {configuration.name}
          </option>
        ))}
      </select>
      <button className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white hover:bg-cyan-800">
        Start session
      </button>
      {message ? <p className="text-sm font-medium text-cyan-800">{message}</p> : null}
    </form>
  );
}
