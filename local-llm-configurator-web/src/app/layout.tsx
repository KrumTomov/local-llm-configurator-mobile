import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroForge",
  description: "AI infrastructure control center for local and hybrid LLMs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <Link
                href="/"
                className="flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-950"
              >
                <span className="grid size-9 place-items-center rounded-md border border-cyan-400/30 bg-cyan-400/10 font-mono text-sm text-cyan-300">
                  NF
                </span>
                <span>
                  NeuroForge
                  <span className="block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                    AI Control Center
                  </span>
                </span>
              </Link>
              <nav
                aria-label="Primary navigation"
                className="grid grid-cols-3 gap-2 text-sm font-medium sm:flex sm:flex-wrap sm:items-center"
              >
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-center text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-center text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Dashboard
                </Link>
                <Link
                  href="/models"
                  className="rounded-md px-3 py-2 text-center text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Models
                </Link>
                <Link
                  href="/benchmarks"
                  className="rounded-md px-3 py-2 text-center text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Benchmarks
                </Link>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-center text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-cyan-700 px-3 py-2 text-center text-white transition hover:bg-cyan-800"
                >
                  Register
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t border-slate-200 bg-white/90">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between">
              <p>NeuroForge AI infrastructure control center.</p>
              <p>Local, hybrid, benchmarked, orchestrated.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
