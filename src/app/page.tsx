"use client";
import React from "react";

import { FileUpload } from "@/components/FileUpload";
// import { JobDescriptionInput } from "@/components/JobDescriptionInput";
// import { JobQuestionInput } from "@/components/JobQuestionInput";
import { Header } from "@/components/Header";
import { LinkDisplay } from "@/components/LinkDisplay";
import { GeneratedResponseDisplay } from "@/components/GeneratedResponseDisplay";
import { DescriptionInput } from "@/components/DescriptionInput";

import { useGenerate } from "@/hooks/useGenerate";
import { useCoverLetter } from "@/hooks/useCoverLetter";

import { useDataContext } from "@/context/DataContext";
export default function Home() {
  //hooks
  const {
    coverLetter,
    setCoverLetter,
    handleGenerateCoverLetter,
    isGenerating,
  } = useCoverLetter();

  const {
    generatedAnswer,
    setGeneratedAnswer,
    handleGenerateAnswer,
    isAnswerGenerating,
    question,
    setQuestion,
  } = useGenerate();

  //contexts
  const {
    resume,
    jobDescription,
    setResume,
    setJobDescription,
    projectsDescription,
    setProjectsDescription,
  } = useDataContext();

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

          <div className="grid grid-cols-1 gap-8 mt-8">
            <LinkDisplay />
            <DescriptionInput
              value={projectsDescription}
              onChange={setProjectsDescription}
              title={"Projects Description"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <FileUpload onResumeExtracted={setResume} />
            <DescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
              title={"Job Description"}
            />
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !resume || !jobDescription}
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
            <GeneratedResponseDisplay
              generatedResponse={coverLetter}
              setGeneratedResponse={setCoverLetter}
              isResponseGenerating={isGenerating}
              type={"Cover Letter"}
            />
          </div>

          <div className="flex flex-col  gap-6">
            <DescriptionInput
              value={question}
              onChange={setQuestion}
              title={"Job Question"}
            />
            <button
              onClick={() => {
                handleGenerateAnswer();
              }}
              disabled={isAnswerGenerating || !resume || !jobDescription}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnswerGenerating ? (
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
            <GeneratedResponseDisplay
              generatedResponse={generatedAnswer}
              setGeneratedResponse={setGeneratedAnswer}
              isResponseGenerating={isAnswerGenerating}
              type={"Response"}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
