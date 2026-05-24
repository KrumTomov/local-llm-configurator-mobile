"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus(isRegister ? "Creating your account..." : "Signing you in...");
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        setStatus("");
        setError(payload?.message ?? "Something went wrong. Please try again.");
        setIsPending(false);
        return;
      }

      setStatus(isRegister ? "Account created." : "Login successful.");
      window.location.assign("/dashboard");
    } catch {
      setStatus("");
      setError("Unable to connect to the auth service. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {isRegister ? "Create account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isRegister
            ? "Register to start planning your LLM deployment environment."
            : "Sign in to continue configuring your LLM infrastructure."}
        </p>
      </div>

      <div className="space-y-4">
        {isRegister ? (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-800"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
            />
          </div>
        ) : null}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-800"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-800"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={8}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 h-11 w-full rounded-md bg-cyan-700 px-4 text-sm font-semibold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700/30"
      >
        {isPending
          ? isRegister
            ? "Creating account..."
            : "Signing in..."
          : isRegister
            ? "Register"
            : "Login"}
      </button>

      {status ? (
        <p className="mt-4 text-sm font-medium text-cyan-800">{status}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <p className="mt-6 text-sm text-slate-600">
        {isRegister ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-cyan-800 hover:text-cyan-900"
        >
          {isRegister ? "Login" : "Register"}
        </Link>
      </p>
    </form>
  );
}
