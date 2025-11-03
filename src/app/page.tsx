"use client";
import React, { useState, useEffect } from "react";

import { FileUpload } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { LinkDisplay } from "@/components/LinkDisplay";
import { GeneratedResponseDisplay } from "@/components/GeneratedResponseDisplay";
import { DescriptionInput } from "@/components/DescriptionInput";
import { InputModal } from "@/components/InputModal";
import { Records } from "@/components/Records";

import { useGenerate } from "@/hooks/useGenerate";
import { useCoverLetter } from "@/hooks/useCoverLetter";

import { useDataContext } from "@/context/DataContext";

import { toast } from "react-toastify";
import { type ApiResponse } from "@/types/api.types";
import { type CountRecord } from "@/types/notion.types";

import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import {
  type DateFilter,
  todayFilter,
  weekFilter,
  monthFilter,
  totalFilter,
} from "@/helpers/dateRange";

import { type JobData } from "@/types/job.types";

import { type RecordCounts, JobCounts } from "@/types/notion.types";
import { record } from "zod";
import { count } from "console";

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
    setResume,
    jobData,
    setJobData,
    jobCounts,
    setJobCounts,
    recordsCount,
    setRecordsCount,
  } = useDataContext();

  const [openInputModal, setOpenInputModal] = useState(false);

  const [inputValues, setInputValues] = useState({
    yoe: "",
    position: "",
    company: "",
  });

  const getCount = async (filter: DateFilter) => {
    const response = await fetch("/api/notion/counts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filter }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = (await response.json()) as ApiResponse<number>;

    if (data.success && data.data !== undefined) {
      return data.data;
    } else {
      throw new Error("Failed to fetch application counts from Notion.");
    }
  };

  const updateMax = async (
    pageId: string,
    updateMax: number,
    key: keyof RecordCounts
  ) => {
    try {
      const response = await fetch(`/api/notion/records/${pageId}`, {
        method: "PUT",
        body: JSON.stringify({
          count: updateMax,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = (await response.json()) as ApiResponse<CountRecord>;
      if (!data.success || data.data === undefined) {
        throw new Error("Failed to update max count in Notion.");
      }
      setRecordsCount((prev) => ({
        ...prev,
        [key]: { ...prev[key], count: updateMax },
      }));

      // return data.data;
    } catch (err) {
      console.log(err);
    }
  };

  const refetchApplicationCounts = async () => {
    try {
      const [today, week, month, total] = await Promise.all([
        getCount(todayFilter),
        getCount(weekFilter),
        getCount(monthFilter),
        getCount(totalFilter), // total count
      ]);

      const newCounts = {
        Daily: today,
        Weekly: week,
        Monthly: month,
        Total: total,
      } as JobCounts;

      const updatedMax: Partial<RecordCounts> = {};

      Object.keys(jobCounts).forEach((key) => {
        const jobCountsKey = key as keyof JobCounts;
        if (newCounts[jobCountsKey] > jobCounts[jobCountsKey]) {
          updatedMax[jobCountsKey] = {
            ...recordsCount[jobCountsKey],
            count: newCounts[jobCountsKey],
          };
        }
      });

      await Promise.all(
        Object.entries(updatedMax).map(([key, value]) =>
          updateMax(value.id, value.count, key as keyof RecordCounts)
        )
      );

      setJobCounts((prev) => ({
        ...prev,
        Daily: today,
        Weekly: week,
        Monthly: month,
        Total: total,
      }));
    } catch (err) {
      console.log("An unexpected error occurred fetching application counts.");
      console.log(err);
    }
  };

  const fetchApplicationCounts = async () => {
    try {
      const [
        todayCountResponse,
        weekCountResponse,
        monthCountResponse,
        totalCountResponse,
      ] = await Promise.all([
        getCount(todayFilter),
        getCount(weekFilter),
        getCount(monthFilter),
        getCount(totalFilter), // total count
      ]);

      setJobCounts((prev) => ({
        ...prev,
        Daily: todayCountResponse,
        Weekly: weekCountResponse,
        Monthly: monthCountResponse,
        Total: totalCountResponse,
      }));
    } catch (err) {
      console.log("An unexpected error occurred fetching application counts.");
      console.log(err);
    }
  };

  const fetchRecordsCount = async () => {
    try {
      const response = await fetch("/api/notion/records", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = (await response.json()) as ApiResponse<CountRecord[]>;

      if (data.success && data.data !== undefined) {
        setRecordsCount(() => {
          const result: RecordCounts = {
            Daily: { count: 0, id: "" },
            Weekly: { count: 0, id: "" },
            Monthly: { count: 0, id: "" },
            Total: { count: 0, id: "" },
          };

          data.data.forEach((record) => {
            result[record.record_name as keyof RecordCounts] = {
              count: record.count,
              id: record.id,
            };
          });

          return result;
        });
      } else {
        throw new Error("Failed to fetch records count from Notion.");
      }
    } catch (err) {
      console.log("An unexpected error occurred fetching records count.");
      console.log(err);
    }
  };

  const fetchInitialCounts = async () => {
    await fetchRecordsCount();
    await fetchApplicationCounts();
  };

  useEffect(() => {
    fetchInitialCounts();
  }, []);

  const addToNotion = async () => {
    try {
      if (
        !jobData.jobDescription ||
        !coverLetter ||
        !jobData.company ||
        !jobData.position ||
        // !jobData.yoe ||
        !jobData.compensation
      ) {
        console.log("missing required data to add to Notion", jobData);
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

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse<PageObjectResponse>;
      if (data.success && data.data) {
        toast.success("Job application added to Notion!");
        refetchApplicationCounts();
      } else {
        toast.error("Failed to add job application to Notion.");
      }
      // console.log("Notion response:", data);
    } catch (err) {
      toast.error("An unexpected error occurred adding job to Notion.");
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
          {/* 
          <button
            onClick={() => {
              updateMax("29d23368-5000-8091-a6c3-ea372bfe9e97", 54);
            }}
            className="text-black bg-white"
          >
            Update
          </button> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Records />
            <LinkDisplay />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <FileUpload onResumeExtracted={setResume} />
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
              addToNotion={addToNotion}
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
