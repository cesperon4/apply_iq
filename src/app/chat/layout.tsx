import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ApplyIQ · AI Chat",
  description:
    "Chat with tools powered by your runWithTools flow—jobs, resume context, and more.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
