"use client"; // required in next.js 13+ which uses server side rendering

import React, { createContext, useContext, useState, ReactNode } from "react";

import { type RecordCounts, type JobCounts } from "@/types/notion.types";
import { type JobRecord } from "@/types/notion.types";

interface DataContextType {
  resume: File | null;
  setResume: React.Dispatch<React.SetStateAction<File | null>>;
  jobData: JobRecord;
  setJobData: React.Dispatch<React.SetStateAction<JobRecord>>;
  jobCounts: JobCounts;
  setJobCounts: React.Dispatch<React.SetStateAction<JobCounts>>;
  recordsCount: RecordCounts;
  setRecordsCount: React.Dispatch<React.SetStateAction<RecordCounts>>;
  setTechStackCount: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  techStackCount: Record<string, number>;
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
  const [jobData, setJobData] = useState<JobRecord>({
    id: "",
    job_description: "",
    company: "",
    position: "",
    yoe: 0,
    compensation: "",
    tech_stack: [],
    status: "",
    date_applied: "",
    cover_letter: "",
  });

  const [jobCounts, setJobCounts] = useState<JobCounts>({
    Daily: 0,
    Weekly: 0,
    Monthly: 0,
    Total: 0,
  });

  const [recordsCount, setRecordsCount] = useState<RecordCounts>({
    Daily: { count: 0, id: "" },
    Weekly: { count: 0, id: "" },
    Monthly: { count: 0, id: "" },
    Total: { count: 0, id: "" },
  });

  const [techStackCount, setTechStackCount] = useState<Record<string, number>>(
    {}
  );

  return (
    <DataContext.Provider
      value={{
        resume: resume,
        setResume: setResume,
        jobData: jobData,
        setJobData: setJobData,
        jobCounts: jobCounts,
        setJobCounts: setJobCounts,
        recordsCount: recordsCount,
        setRecordsCount: setRecordsCount,
        techStackCount,
        setTechStackCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
