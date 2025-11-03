"use client";

import { DataProvider } from "@/context/DataContext";
import { ToastContainer } from "react-toastify";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ✅ Wrap everything in SessionProvider so useSession() works everywhere
    <DataProvider>
      <ToastContainer />
      {children}
    </DataProvider>
  );
}
