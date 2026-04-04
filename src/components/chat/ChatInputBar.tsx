"use client";

import { ArrowRight, Mic } from "lucide-react";

type ChatInputBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInputBar({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "Type your prompt here...",
}: ChatInputBarProps) {
  return (
    <div className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-zinc-700/80 bg-white pl-3 pr-1.5 py-1.5 shadow-lg shadow-black/20">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900">
        <span className="text-xs font-bold text-emerald-400">AI</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) onSend();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none disabled:opacity-50"
      />
      <button
        type="button"
        className="rounded-full p-2.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
        aria-label="Voice input"
      >
        <Mic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send message"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
