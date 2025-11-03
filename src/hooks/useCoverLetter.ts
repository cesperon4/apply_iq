"use client";

import React, { useState } from "react";
import { useDataContext } from "@/context/DataContext";

import { type CoverLetterResponse } from "@/types/notion.types";
import { type ApiResponse } from "@/types/api.types";

interface CoverLetterHookReturn {
  handleGenerateCoverLetter: () => Promise<void>;
  coverLetter: string;
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
}

export function useCoverLetter(): CoverLetterHookReturn {
  const { resume, jobData, setJobData } = useDataContext();

  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCoverLetter = async () => {
    if (!resume || !jobData.jobDescription) {
      alert("Please upload your resume and enter a job description.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDescription", jobData.jobDescription);
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const res = (await response.json()) as ApiResponse<CoverLetterResponse>;

      const coverLetterData = res.data;

      setCoverLetter(coverLetterData.body);

      setJobData((prev) => ({
        ...prev,
        compensation: coverLetterData.job_compensation,
        company: coverLetterData.job_description_company,
        yoe: coverLetterData.job_description_years_of_experience,
        position: coverLetterData.job_description_position,
      }));
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    handleGenerateCoverLetter,
    isGenerating,
    coverLetter,
    setCoverLetter,
  };
}
