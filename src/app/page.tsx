"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { JobQuestionInput } from "@/components/JobQuestionInput";
import { CoverLetterDisplay } from "@/components/CoverLetterDisplay";
import { Header } from "@/components/Header";
import { AnswerDisplay } from "@/components/AnswerDisplay";

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobAnswer, setJobAnswer] = useState<string>("");
  const [jobQuestion, setJobQuestion] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isJobAnswerGenerating, setIsJobAnswerGenerating] =
    useState<boolean>(false);

  const handleGenerateCoverLetter = async () => {
    if (!resumeFile || !jobDescription) {
      alert("Please upload your resume and enter a job description.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
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

  const handleGenerateAnswer = async () => {
    if (!resumeFile || !jobDescription || !jobQuestion) {
      alert(
        "Please upload your resume and enter a job description along with your question"
      );
      return;
    }

    setIsJobAnswerGenerating(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);
      formData.append("jobQuestion", jobQuestion);

      const response = await fetch("/api/generate-answer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = await response.json();

      setJobAnswer(data.message);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsJobAnswerGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ApplyIQ Cover Letter Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume, paste a job description, and let AI create a
            personalized cover letter that highlights your relevant experience
            and skills.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <FileUpload onResumeExtracted={setResumeFile} />
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !resumeFile || !jobDescription}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Cover Letter...
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </button>
          </div>

          <div>
            <CoverLetterDisplay
              coverLetter={coverLetter}
              setCoverLetter={setCoverLetter}
              isGenerating={isGenerating}
            />
          </div>

          <div className="flex flex-col  gap-6">
            <JobQuestionInput value={jobQuestion} onChange={setJobQuestion} />
            <button
              onClick={() => {
                handleGenerateAnswer();
              }}
              disabled={isGenerating || !resumeFile || !jobDescription}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Answer...
                </>
              ) : (
                "Generate Answer"
              )}
            </button>
          </div>
          <div className="bg-white">
            <AnswerDisplay
              jobAnswer={jobAnswer}
              setJobAnswer={setJobAnswer}
              isJobAnswerGenerating={isJobAnswerGenerating}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
