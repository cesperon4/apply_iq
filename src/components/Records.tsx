import React from "react";
import { GiDiamondTrophy } from "react-icons/gi";
import { useDataContext } from "@/context/DataContext";

export function Records() {
  const { jobCounts, recordsCount } = useDataContext();

  return (
    <section className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md text-gray-700">
      <header className="flex items-center justify-center">
        <span>Records</span>
        <GiDiamondTrophy className="text-yellow-500" size="24" />
      </header>

      <div className="flex justify-between p-4 rounded border-1 border-gray-300">
        {Object.entries(recordsCount).map(([key, record]) => (
          <div className="flex flex-col" key={key}>
            <span className="text-gray-900">{`${
              key === "Total" ? "Annual" : key
            } Best`}</span>
            <span className="text-gray-900">{record.count}</span>
          </div>
        ))}
      </div>
      <section className="text-center grid grid-cols-2 gap-2">
        {Object.entries(jobCounts).map(([key, value]) => (
          <div
            key={key}
            className="border-gray-300 border-1 h-full w-full rounded p-2"
          >
            <h2>{key}</h2>
            <span>{value}</span>
          </div>
        ))}
      </section>
    </section>
  );
}
