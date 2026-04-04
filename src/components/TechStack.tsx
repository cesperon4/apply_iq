import React from "react";
import { useDataContext } from "@/context/DataContext";
import Image from "next/image";
import { techLogos } from "@/lib/constants";

export function TechStack() {
  const { techStackCount } = useDataContext();
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-zinc-100 shadow-[0_0_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <h2 className="text-center text-lg font-semibold text-zinc-100">
        Tech stack frequency
      </h2>
      <div className="mt-6 flex flex-wrap justify-center gap-6 sm:justify-between">
        {Object.entries(techStackCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([key, value]) => (
            <div
              key={key}
              className="flex min-w-[4.5rem] flex-col items-center gap-1 rounded-xl border border-zinc-800/60 bg-zinc-950/30 px-2 py-3"
            >
              <Image
                src={techLogos[key] || "/default.png"}
                alt={key}
                width={56}
                height={56}
                className="rounded-lg opacity-95"
              />
              <span className="max-w-[5rem] truncate text-center text-xs font-medium text-zinc-300">
                {key}
              </span>
              <span className="text-sm font-semibold tabular-nums text-emerald-400">
                {value}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}
