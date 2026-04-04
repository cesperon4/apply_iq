import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-700/80">
              <span className="text-lg font-bold text-emerald-400">A</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
                ApplyIQ
              </h1>
              <p className="text-xs leading-snug text-zinc-500 sm:text-[13px]">
                Running locally with Ollama — Hugging Face quota reached for this
                month.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/"
              className="text-zinc-400 transition hover:text-emerald-400"
            >
              Cover letter
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-emerald-400 transition hover:border-emerald-400/50 hover:bg-emerald-500/15"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI Chat
            </Link>
            <a
              href="#"
              className="text-zinc-500 transition hover:text-zinc-300"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-zinc-500 transition hover:text-zinc-300"
            >
              Examples
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
