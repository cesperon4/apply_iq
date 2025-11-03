"use client";

import React, { useState } from "react";
import { useDataContext } from "@/context/DataContext";

import { type ApiResponse } from "@/types/api.types";
import { type GeneratedAnswerResponse } from "@/types/chat.types";

interface useGenerateReturn {
  generatedAnswer: string;
  setGeneratedAnswer: React.Dispatch<React.SetStateAction<string>>;
  question: string;
  isAnswerGenerating: boolean;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  handleGenerateAnswer: () => Promise<void>;
}

export function useGenerate(): useGenerateReturn {
  const { resume, jobData } = useDataContext();
  const [generatedAnswer, setGeneratedAnswer] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [isAnswerGenerating, setIsAnswerGenerating] = useState<boolean>(false);

  const handleGenerateAnswer = async () => {
    if (!resume || !jobData.jobDescription || !question) {
      alert(
        "Please upload your resume and enter a job description along with your question"
      );
      return;
    }

    setIsAnswerGenerating(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDescription", jobData.jobDescription);
      formData.append("jobQuestion", question);

      const response = await fetch("/api/generate-answer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data =
        (await response.json()) as ApiResponse<GeneratedAnswerResponse>;

      setGeneratedAnswer(data.data.body);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsAnswerGenerating(false);
    }
  };

  return {
    generatedAnswer,
    setGeneratedAnswer,
    question,
    setQuestion,
    isAnswerGenerating,
    handleGenerateAnswer,
  };
}
