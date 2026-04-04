import type { CategoryId, ChatFolder, ChatThread } from "./types";

export const SIDEBAR_FOLDERS: ChatFolder[] = [
  { id: "work", name: "Work chats", borderClass: "border-l-amber-400" },
  { id: "life", name: "Life chats", borderClass: "border-l-violet-400" },
  { id: "projects", name: "Projects chats", borderClass: "border-l-orange-400" },
  { id: "clients", name: "Clients chats", borderClass: "border-l-sky-400" },
];

export const CATEGORY_TABS: { id: CategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "music", label: "Music" },
  { id: "analytics", label: "Analytics" },
];

export const INITIAL_THREADS: ChatThread[] = [
  {
    id: "t1",
    title: "Plan a 3-day trip",
    preview: "Here are some ideas for your itinerary...",
    updatedAt: Date.now() - 3600_000,
  },
  {
    id: "t2",
    title: "Resume bullet refinement",
    preview: "Try quantifying that impact with a metric.",
    updatedAt: Date.now() - 86_400_000,
  },
  {
    id: "t3",
    title: "Job search — senior frontend",
    preview: "I'll search your applied jobs for matches.",
    updatedAt: Date.now() - 172_800_000,
  },
];
