import React from "react";
import { useDataContext } from "@/context/DataContext";
import Image from "next/image";
import { techLogos } from "@/lib/constants";
export function TechStack() {
  const { techStackCount } = useDataContext();
  return (
    <section className="bg-white text-gray-900 p-4 rounded shadow">
      <h2 className="font-semibold">Tech Stack Frequency</h2>
      <div className="flex justify-between mt-8">
        {Object.entries(techStackCount)
          .sort((a, b) => b[1] - a[1]) // sort by count descending
          .slice(0, 10) // take top 10
          .map(([key, value]) => (
            <div key={key} className="grid grid-cols-1">
              <Image
                src={techLogos[key] || "/default.png"}
                alt={key}
                width={70}
                height={70}
              />
              <span className="font-semibold">{key}</span>
              <span>{value}</span>
            </div>
          ))}
      </div>
    </section>
  );
}
