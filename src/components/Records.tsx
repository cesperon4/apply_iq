import React from "react";
import { GiDiamondTrophy } from "react-icons/gi";
import { useDataContext } from "@/context/DataContext";

export function Records() {
  const { jobCounts } = useDataContext();

  return (
    <section className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md text-gray-700">
      <header className="flex items-center justify-center">
        <span>Records</span>
        <GiDiamondTrophy className="text-yellow-500" size="24" />
      </header>

      <div className="flex justify-between p-4 rounded border-1 border-gray-300">
        <div className="flex flex-col">
          <span className="text-gray-900">Daily Best</span>
          <span className="text-gray-900">1</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-900">Weekly Best</span>
          <span className="text-gray-900">37</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-900">Monthly Best</span>
          <span className="text-gray-900">54</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-900">Annual Best</span>
          <span className="text-gray-900">54</span>
        </div>
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
