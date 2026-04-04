"use client";

import type { ChatMessage } from "./types";

type ChatMessageListProps = {
  messages: ChatMessage[];
};

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div className="flex flex-col gap-4 px-1 py-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[min(100%,42rem)] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-emerald-500/15 text-zinc-100 ring-1 ring-emerald-500/25"
                : "bg-zinc-800/80 text-zinc-200 ring-1 ring-zinc-700/60"
            }`}
          >
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}
