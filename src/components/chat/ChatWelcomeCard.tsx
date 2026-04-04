"use client";

import { Languages, MonitorSmartphone, Bookmark } from "lucide-react";
import type { CategoryId, QuickActionId } from "./types";
import { CATEGORY_TABS } from "./constants";

const QUICK_ACTIONS: {
  id: QuickActionId;
  title: string;
  description: string;
  icon: typeof Bookmark;
}[] = [
  {
    id: "templates",
    title: "Saved templates",
    description: "Reuse prompts and cover-letter snippets.",
    icon: Bookmark,
  },
  {
    id: "media",
    title: "Context mode",
    description: "Tune how much resume & job context to send.",
    icon: MonitorSmartphone,
  },
  {
    id: "language",
    title: "Multilingual",
    description: "Draft or translate in another language.",
    icon: Languages,
  },
];

type ChatWelcomeCardProps = {
  category: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  onQuickAction: (id: QuickActionId) => void;
};

export function ChatWelcomeCard({
  category,
  onCategoryChange,
  onQuickAction,
}: ChatWelcomeCardProps) {
  return (
    <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-[0_0_80px_-20px_rgba(74,222,128,0.15)] backdrop-blur-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <span className="text-xl font-bold text-emerald-400">A</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          How can I help you today?
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
          Pair this workspace with your <code className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-xs text-emerald-400/90">runWithTools</code>{" "}
          flow—tools appear as quick actions below. You wire the model and
          handlers.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onQuickAction(a.id)}
              className="group flex flex-col rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-4 text-left transition hover:border-emerald-500/35 hover:bg-zinc-900/80"
            >
              <Icon className="mb-3 h-5 w-5 text-emerald-400/90 transition group-hover:scale-105" />
              <span className="text-sm font-medium text-zinc-200">{a.title}</span>
              <span className="mt-1 text-xs leading-snug text-zinc-500">
                {a.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 border-t border-zinc-800/80 pt-6">
        {CATEGORY_TABS.map((tab) => {
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryChange(tab.id)}
              className={`relative px-4 py-2 text-sm font-medium transition ${
                active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
