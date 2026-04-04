"use client";

import {
  Folder,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import type { ChatThread } from "./types";
import type { ChatFolder } from "./types";

type ChatSidebarProps = {
  folders: ChatFolder[];
  threads: ChatThread[];
  activeThreadId: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
};

export function ChatSidebar({
  folders,
  threads,
  activeThreadId,
  searchQuery,
  onSearchChange,
  onSelectThread,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full w-full min-w-0 flex-col border-r border-zinc-800/80 bg-[#141414]">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800/90 ring-1 ring-zinc-700/80">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden />
          </div>
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-100">
            My Chats
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300"
          aria-label="Chat settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-xl border border-zinc-800/90 bg-[#1c1c1c] py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none ring-emerald-500/0 transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="px-3 pb-2">
        <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Folders
        </p>
        <ul className="space-y-1">
          {folders.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 rounded-xl border border-transparent bg-zinc-900/40 px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-800/60 ${f.borderClass} border-l-2 pl-2.5`}
              >
                <Folder className="h-4 w-4 shrink-0 text-zinc-500" />
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-zinc-600" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Recent
        </p>
        <ul className="space-y-0.5">
          {threads.map((t) => {
            const active = t.id === activeThreadId;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelectThread(t.id)}
                  className={`flex w-full gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-zinc-800/90 ring-1 ring-emerald-500/25"
                      : "hover:bg-zinc-800/50"
                  }`}
                >
                  <MessageSquare
                    className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-emerald-400" : "text-zinc-500"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-medium ${active ? "text-zinc-50" : "text-zinc-200"}`}
                    >
                      {t.title}
                    </span>
                    <span className="line-clamp-1 text-xs text-zinc-500">
                      {t.preview}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-zinc-800/80 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_-4px_rgba(74,222,128,0.45)] transition hover:bg-emerald-400"
        >
          <MessageSquarePlus className="h-4 w-4 opacity-90" />
          New chat
        </button>
      </div>
    </aside>
  );
}
