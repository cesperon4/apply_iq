"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, Menu, Share2 } from "lucide-react";
import type { CategoryId, ChatMessage, QuickActionId } from "./types";
import { ChatWelcomeCard } from "./ChatWelcomeCard";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputBar } from "./ChatInputBar";

type ChatMainPanelProps = {
  chatTitle: string;
  modelBadge: string;
  messages: ChatMessage[];
  category: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  onQuickAction: (id: QuickActionId) => void;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
  onOpenMobileSidebar?: () => void;
};

export function ChatMainPanel({
  chatTitle,
  modelBadge,
  messages,
  category,
  onCategoryChange,
  onQuickAction,
  inputValue,
  onInputChange,
  onSend,
  isSending,
  onOpenMobileSidebar,
}: ChatMainPanelProps) {
  const showWelcome = messages.length === 0;

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(74, 222, 128, 0.12), transparent 55%)",
        }}
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800/60 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onOpenMobileSidebar && (
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300 md:hidden"
              aria-label="Open chat list"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/"
            className="inline-flex rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="truncate text-sm font-semibold text-zinc-100 sm:text-base">
            {chatTitle}
          </h1>
          <span className="hidden shrink-0 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400 sm:inline">
            {modelBadge}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300"
            aria-label="Bookmark"
          >
            <Bookmark className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-8 sm:px-8">
          {showWelcome ? (
            <ChatWelcomeCard
              category={category}
              onCategoryChange={onCategoryChange}
              onQuickAction={onQuickAction}
            />
          ) : (
            <div className="w-full max-w-3xl">
              <ChatMessageList messages={messages} />
            </div>
          )}
        </div>

        <div className="relative z-10 flex shrink-0 flex-col items-center gap-3 border-t border-zinc-800/50 bg-[#0a0a0a]/80 px-4 pb-6 pt-4 backdrop-blur-md sm:px-8">
          <ChatInputBar
            value={inputValue}
            onChange={onInputChange}
            onSend={onSend}
            disabled={isSending}
          />
          <p className="text-center text-[11px] text-zinc-600">
            AI can make mistakes. Verify important details before you apply.
          </p>
        </div>
      </div>
    </div>
  );
}
