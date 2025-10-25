"use client"; // required in next.js 13+ which uses server side rendering

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DataContextType {
  resume: File | null;
  jobDescription: string;
  projectsDescription: string;
  setResume: React.Dispatch<React.SetStateAction<File | null>>;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  setProjectsDescription: React.Dispatch<React.SetStateAction<string>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [projectsDescription, setProjectsDescription] = useState<string>("");

  return (
    <DataContext.Provider
      value={{
        resume: resume,
        setResume: setResume,
        jobDescription: jobDescription,
        setJobDescription: setJobDescription,
        projectsDescription: projectsDescription,
        setProjectsDescription: setProjectsDescription,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
