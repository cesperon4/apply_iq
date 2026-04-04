export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

export type ChatFolder = {
  id: string;
  name: string;
  borderClass: string;
};

export type QuickActionId = "templates" | "media" | "language";

export type CategoryId =
  | "all"
  | "text"
  | "image"
  | "video"
  | "music"
  | "analytics";
