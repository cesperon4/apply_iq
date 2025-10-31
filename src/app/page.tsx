"use client";
import React, { useState } from "react";

import { FileUpload } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { LinkDisplay } from "@/components/LinkDisplay";
import { GeneratedResponseDisplay } from "@/components/GeneratedResponseDisplay";
import { DescriptionInput } from "@/components/DescriptionInput";
import { InputModal } from "@/components/InputModal";

import { useGenerate } from "@/hooks/useGenerate";
import { useCoverLetter } from "@/hooks/useCoverLetter";

import { useDataContext } from "@/context/DataContext";

import { type JobData } from "@/types/job";
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
  const { resume, setResume, jobData, setJobData } = useDataContext();

  const [openInputModal, setOpenInputModal] = useState(false);

  const [inputValues, setInputValues] = useState({
    yoe: "",
    position: "",
    company: "",
  });

  const addJobRow = async () => {
    try {
      if (!jobData) {
        console.log("missing required data to add to Notion");
        return;
      }

      const response = await fetch("/api/notion/post-data", {
        method: "POST",
        body: JSON.stringify({
          coverLetter,
          jobDescription: jobData.jobDescription,
          company: jobData.company,
          yoe: jobData.yoe,
          compensation: jobData.compensation,
          position: jobData.position,
        }),
      });

      const data = await response.json();

      console.log("add row response: ", data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {openInputModal && (
        <InputModal
          inputValues={inputValues}
          setInputValues={setInputValues}
          setOpenInputModal={setOpenInputModal}
        />
      )}
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ApplyIQ Cover Letter Assistant{" "}
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume, paste a job description, and let AI create a
            personalized cover letter that highlights your relevant experience
            and skills.
          </p>

          <div className="grid grid-cols-1 gap-8 mt-8">
            <LinkDisplay />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <FileUpload onResumeExtracted={setResume} />
            {/* <DescriptionInput
              value={jobData.jobDescription}
              onChange={setJobData<string>}
              title={"Job Description"}
            /> */}
            <DescriptionInput<JobData>
              value={jobData.jobDescription}
              onChange={setJobData}
              title="Job Description"
              field="jobDescription"
            />
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !resume || !jobData.jobDescription}
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
              addToNotion={addJobRow}
            />
          </div>

          <div className="flex flex-col  gap-6">
            <DescriptionInput<string>
              value={question}
              onChange={setQuestion}
              title={"Job Question"}
            />
            <button
              onClick={() => {
                handleGenerateAnswer();
              }}
              disabled={
                isAnswerGenerating || !resume || !jobData.jobDescription
              }
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
              addToNotion={null}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
