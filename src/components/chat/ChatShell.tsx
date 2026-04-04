"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMainPanel } from "./ChatMainPanel";
import { SIDEBAR_FOLDERS, INITIAL_THREADS } from "./constants";
import type {
  CategoryId,
  ChatMessage,
  ChatThread,
  QuickActionId,
} from "./types";

const CHAT_MODEL = "qwen3:latest";

function newId() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type ChatShellProps = {
  /** Shown next to the chat title (e.g. model name). */
  modelBadge?: string;
};

export function ChatShell({ modelBadge = "Tools ready" }: ChatShellProps) {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | null>("t1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");
  const [isSending, setIsSending] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSidebarOpen]);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q),
    );
  }, [threads, searchQuery]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const messages = activeThreadId
    ? (messagesByThread[activeThreadId] ?? [])
    : [];

  const chatTitle = activeThread?.title ?? "Name chat";

  const onNewChat = useCallback(() => {
    const id = `t_${Date.now()}`;
    const thread: ChatThread = {
      id,
      title: "New chat",
      preview: "Start the conversation…",
      updatedAt: Date.now(),
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(id);
    setMessagesByThread((prev) => ({ ...prev, [id]: [] }));
    setInput("");
    setMobileSidebarOpen(false);
  }, []);

  const onSelectThread = useCallback((id: string) => {
    setActiveThreadId(id);
    setInput("");
    setMobileSidebarOpen(false);
  }, []);

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !activeThreadId || isSending) return;

    const threadId = activeThreadId;
    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const prior = messagesByThread[threadId] ?? [];
    const historyForApi = [...prior, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessagesByThread((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), userMsg],
    }));
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              preview: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
              updatedAt: Date.now(),
            }
          : t,
      ),
    );
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages: historyForApi,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const assistantMsg: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: data.reply ?? "",
        createdAt: Date.now(),
      };
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] ?? []), assistantMsg],
      }));
    } catch (e) {
      const errText =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      const assistantMsg: ChatMessage = {
        id: newId(),
        role: "assistant",
        content: `Error: ${errText}`,
        createdAt: Date.now(),
      };
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] ?? []), assistantMsg],
      }));
    } finally {
      setIsSending(false);
    }
  }, [input, activeThreadId, isSending, messagesByThread]);

  const onQuickAction = useCallback((id: QuickActionId) => {
    const hints: Record<QuickActionId, string> = {
      templates: "Use a saved prompt: ",
      media: "Adjust context: ",
      language: "Translate or write in: ",
    };
    setInput((prev) => (prev ? `${prev} ` : "") + hints[id]);
  }, []);

  return (
    <div className="flex h-[100dvh] min-h-0 w-full font-[family-name:var(--font-inter)]">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(100%,20rem)] shadow-2xl">
            <ChatSidebar
              folders={SIDEBAR_FOLDERS}
              threads={filteredThreads}
              activeThreadId={activeThreadId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectThread={onSelectThread}
              onNewChat={onNewChat}
            />
          </div>
        </div>
      )}
      <div className="hidden w-[min(100%,20rem)] shrink-0 md:flex md:w-[min(100%,22rem)] lg:w-[min(100%,24rem)]">
        <ChatSidebar
          folders={SIDEBAR_FOLDERS}
          threads={filteredThreads}
          activeThreadId={activeThreadId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectThread={onSelectThread}
          onNewChat={onNewChat}
        />
      </div>
      <ChatMainPanel
        chatTitle={chatTitle}
        modelBadge={modelBadge}
        messages={messages}
        category={category}
        onCategoryChange={setCategory}
        onQuickAction={onQuickAction}
        inputValue={input}
        onInputChange={setInput}
        onSend={onSend}
        isSending={isSending}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />
    </div>
  );
}
