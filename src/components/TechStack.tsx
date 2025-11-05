import React from "react";
import { useDataContext } from "@/context/DataContext";
import Image from "next/image";
const techLogos: Record<string, string> = {
  react: "/react.svg",
  Go: "/logos/go.svg",
  ["node.js"]: "/node.svg",
  typescript: "/typescript.svg",
  Python: "/logos/python.svg",
  kubernetes: "/kubernetes.svg",
  nestjs: "/nestjs.svg",
  aws: "/aws.svg",
  graphql: "/graphql.svg",
  ["react native"]: "/react.svg",
  docker: "/docker.svg",
  postgresql: "/postgresql.svg",
};

export function TechStack() {
  const { techStackCount } = useDataContext();
  return (
    <section className="bg-white text-gray-900 p-4 rounded shadow">
      <h2 className="font-semibold">Tech Stack Frequency</h2>
      <div className="flex justify-between mt-8">
        {Object.entries(techStackCount)
          .sort((a, b) => b[1] - a[1])
          .map(([key, value]) => (
            <div key={key} className="grid grid-cols-1">
              <Image
                src={techLogos[key] || "/default.png"}
                alt={key}
                width={70}
                height={70}
              />
              <span className="font-medium">{key}</span>
              <span>{value}</span>
            </div>
          ))}
      </div>
    </section>
  );
}
