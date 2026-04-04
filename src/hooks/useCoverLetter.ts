"use client";

import React, { useState } from "react";
import { useDataContext } from "@/context/DataContext";
import { searchVectors } from "@/lib/api/milvus";
import { type CoverLetterResponse } from "@/types/notion.types";
import { type ApiResponse } from "@/types/api.types";
import { embedTextChunks } from "@/lib/api/milvus";
import { coverLetterBodyToHtml } from "@/lib/cover-letter-sanitize";

interface CoverLetterHookReturn {
  handleGenerateCoverLetter: () => Promise<void>;
  coverLetter: string;
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
}

export function useCoverLetter(): CoverLetterHookReturn {
  const { jobData } = useDataContext();

  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function formatMilvusContext(
    hits: { text: string; score: number }[],
  ): string {
    return hits
      .map(
        (h, i) =>
          `--- Excerpt ${i + 1} (relevance ${h.score.toFixed(3)}) ---\n${h.text}`,
      )
      .join("\n\n");
  }

  const handleGenerateCoverLetter = async () => {
    if (!jobData.job_description) {
      alert("Please upload your resume and enter a job description.");
      return;
    }

    setIsGenerating(true);
    try {
      // const formData = new FormData();
      // formData.append("resume", resume);
      // formData.append("job_description", jobData.job_description);
      // const response = await fetch("/api/generate-cover-letter", {
      //   method: "POST",
      //   body: formData,
      // });
      // if (!response.ok) {
      //   throw new Error("Failed to generate cover letter");
      // }
      // const res = (await response.json()) as ApiResponse<CoverLetterResponse>;
      // const coverLetterData = res.data;
      // const tech_stack = coverLetterData.job_tech_stack.map((tech) => ({
      //   name: tech,
      // }));
      // setCoverLetter(coverLetterData.body);
      // setJobData((prev) => ({
      //   ...prev,
      //   compensation: coverLetterData.job_compensation,
      //   company: coverLetterData.job_description_company,
      //   yoe: coverLetterData.job_description_years_of_experience,
      //   position: coverLetterData.job_description_position,
      //   tech_stack: tech_stack,
      // }));
      const jobDescriptionArray = [jobData.job_description];
      const embedded = await embedTextChunks(jobDescriptionArray);
      const searchResults = await searchVectors(
        embedded.embeddings,
        "document_v5",
      );
      console.log("search results: ", searchResults);

      const formattedResults = formatMilvusContext(searchResults.data.results);

      const formData = new FormData();
      formData.append("job_description", jobData.job_description);
      formData.append("excerpts", formattedResults);
      const signName =
        typeof process.env.NEXT_PUBLIC_APPLICANT_NAME === "string"
          ? process.env.NEXT_PUBLIC_APPLICANT_NAME.trim()
          : "";
      if (signName) formData.append("candidate_name", signName);
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }
      const res = (await response.json()) as ApiResponse<CoverLetterResponse>;
      const coverLetterData = res.data;
      setCoverLetter(coverLetterBodyToHtml(coverLetterData.body));

      console.log("formatted results: ", formattedResults);
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
