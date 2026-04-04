import React from "react";
import { GiDiamondTrophy } from "react-icons/gi";
import { useDataContext } from "@/context/DataContext";

export function Records() {
  const { jobCounts, recordsCount } = useDataContext();

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-zinc-300 shadow-[0_0_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <header className="flex items-center justify-center gap-2">
        <span className="font-semibold text-zinc-100">Records</span>
        <GiDiamondTrophy className="text-amber-400" size={22} aria-hidden />
      </header>

      <div className="flex justify-between gap-2 rounded-xl border border-zinc-800/90 bg-zinc-950/40 p-4">
        {Object.entries(recordsCount).map(([key, record]) => (
          <div className="flex min-w-0 flex-col text-center" key={key}>
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {key === "Total" ? "Annual" : key} best
            </span>
            <span className="text-lg font-semibold tabular-nums text-emerald-400">
              {record.count}
            </span>
          </div>
        ))}
      </div>
      <section className="grid grid-cols-2 gap-2 text-center">
        {Object.entries(jobCounts).map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-800/90 bg-zinc-950/40 p-3"
          >
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {key}
            </h2>
            <span className="mt-1 block text-xl font-semibold tabular-nums text-zinc-100">
              {value}
            </span>
          </div>
        ))}
      </section>
    </section>
  );
}
