"use client";

import { DataProvider } from "@/context/DataContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReactQueryProvider } from "./ReactQueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <ToastContainer
        theme="dark"
        position="bottom-right"
        toastClassName="!rounded-xl !border !border-zinc-700/80 !bg-zinc-900 !text-sm !text-zinc-100"
      />
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </DataProvider>
  );
}
