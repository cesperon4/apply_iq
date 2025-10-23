"use client";

import React, { useState } from "react";
import { useDataContext } from "@/context/DataContext";

interface CoverLetterHookReturn {
  handleGenerateCoverLetter: () => Promise<void>;
  coverLetter: string;
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
}
export function useCoverLetter(): CoverLetterHookReturn {
  const { resume, jobDescription } = useDataContext();

  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateCoverLetter = async () => {
    if (!resume || !jobDescription) {
      alert("Please upload your resume and enter a job description.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDescription", jobDescription);
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.message);
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
