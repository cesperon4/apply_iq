"use client";

import { DataProvider } from "@/context/DataContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ✅ Wrap everything in SessionProvider so useSession() works everywhere
    <DataProvider>{children}</DataProvider>
  );
}
