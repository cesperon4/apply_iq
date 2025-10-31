"use client"; // required in next.js 13+ which uses server side rendering

import React, { createContext, useContext, useState, ReactNode } from "react";

type JobData = {
  jobDescription: string;
  company: string;
  position: string;
  compensation: string;
  yoe: number;
};

interface DataContextType {
  resume: File | null;
  setResume: React.Dispatch<React.SetStateAction<File | null>>;
  jobData: JobData;
  setJobData: React.Dispatch<React.SetStateAction<JobData>>;
  // jobDescription: string;
  // setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  // company: string;
  // setCompany: React.Dispatch<React.SetStateAction<string>>;
  // position: string;
  // setPosition: React.Dispatch<React.SetStateAction<string>>;
  // yoe: number;
  // setYoe: React.Dispatch<React.SetStateAction<number>>;
  // compensation: string;
  // setCompensation: React.Dispatch<React.SetStateAction<string>>;
  // setProjectsDescription: React.Dispatch<React.SetStateAction<string>>;
  // projectsDescription: string;
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
  // const [projectsDescription, setProjectsDescription] = useState("");
  // const [jobDescription, setJobDescription] = useState("");
  // const [company, setCompany] = useState("");
  // const [position, setPosition] = useState("");
  // const [yoe, setYoe] = useState(0);
  // const [compensation, setCompensation] = useState("");

  const [jobData, setJobData] = useState<JobData>({
    jobDescription: "",
    company: "",
    position: "",
    yoe: 0,
    compensation: "",
  });

  return (
    <DataContext.Provider
      value={{
        resume: resume,
        setResume: setResume,
        // jobDescription: jobDescription,
        // setJobDescription: setJobDescription,
        // company: company,
        // setCompany: setCompany,
        // position: position,
        // setPosition: setPosition,
        // yoe: yoe,
        // setYoe: setYoe,
        // compensation: compensation,
        // setCompensation: setCompensation,
        jobData: jobData,
        setJobData: setJobData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
