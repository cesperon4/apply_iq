"use client";
import React, { useState, useEffect } from "react";

import { FileUpload } from "@/components/FileUpload";
import { Header } from "@/components/Header";
import { LinkDisplay } from "@/components/LinkDisplay";
import { GeneratedResponseDisplay } from "@/components/GeneratedResponseDisplay";
import { DescriptionInput } from "@/components/DescriptionInput";
import { InputModal } from "@/components/InputModal";
import { Records } from "@/components/Records";
import { TechStack } from "@/components/TechStack";

// import { useGenerate } from "@/hooks/useGenerate";
import { useCoverLetter } from "@/hooks/useCoverLetter";

import { useDataContext } from "@/context/DataContext";
import { getMyApplications } from "@/lib/api/notion";

import { toast } from "react-toastify";
import { type ApiResponse } from "@/types/api.types";
import { type CountRecord } from "@/types/notion.types";

import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getAppliedJobs } from "@/lib/api/notion";

import {
  type DateFilter,
  todayFilter,
  weekFilter,
  monthFilter,
  totalFilter,
} from "@/helpers/dateRange";

import { type JobRecord } from "@/types/notion.types";

import { type RecordCounts, JobCounts } from "@/types/notion.types";

export default function Home() {
  //hooks
  const {
    coverLetter,
    setCoverLetter,
    handleGenerateCoverLetter,
    isGenerating,
  } = useCoverLetter();

  // Job question + generated answer flow (disabled for now)
  // const {
  //   generatedAnswer,
  //   setGeneratedAnswer,
  //   handleGenerateAnswer,
  //   isAnswerGenerating,
  //   question,
  //   setQuestion,
  // } = useGenerate();

  //contexts
  const {
    setResume,
    jobData,
    setJobData,
    jobCounts,
    setJobCounts,
    recordsCount,
    setRecordsCount,
    setTechStackCount,
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
    key: keyof RecordCounts,
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
      console.log("data: ", data);
      if (!data.success || data.data === undefined) {
        throw new Error("Failed to update max count in Notion.");
      }

      console.log("Count Record", updateMax);
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
        if (newCounts[jobCountsKey] > recordsCount[jobCountsKey].count) {
          updatedMax[jobCountsKey] = {
            ...recordsCount[jobCountsKey],
            count: newCounts[jobCountsKey],
          };
        }
      });

      await Promise.all(
        Object.entries(updatedMax).map(([key, value]) =>
          updateMax(value.id, value.count, key as keyof RecordCounts),
        ),
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

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      if (!data.success)
        throw new Error("Failed to fetch applications from Notion.");
      setTechStackCount(data.data.tech_counts);
    } catch (err) {
      console.log("An unexpected error occurred fetching applications.", err);
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
    await fetchApplications(); //?
  };

  useEffect(() => {
    fetchInitialCounts();
  }, []);

  const addToNotion = async () => {
    try {
      if (
        !jobData.job_description ||
        !coverLetter ||
        !jobData.company ||
        !jobData.position ||
        // !jobData.yoe ||
        !jobData.compensation ||
        !jobData.tech_stack
      ) {
        console.log("missing required data to add to Notion", jobData);
        return;
      }

      const response = await fetch("/api/notion/jobs", {
        method: "POST",
        body: JSON.stringify({
          coverLetter,
          job_description: jobData.job_description,
          company: jobData.company,
          yoe: jobData.yoe,
          compensation: jobData.compensation,
          position: jobData.position,
          tech_stack: jobData.tech_stack,
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
    } catch (err) {
      toast.error("An unexpected error occurred adding job to Notion.");
      console.log(err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] font-[family-name:var(--font-inter)]">
      <div
        className="pointer-events-none fixed inset-0 opacity-80"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(74, 222, 128, 0.09), transparent 55%)",
        }}
      />
      {openInputModal && (
        <InputModal
          inputValues={inputValues}
          setInputValues={setInputValues}
          setOpenInputModal={setOpenInputModal}
        />
      )}
      <Header />

      <main className="relative z-10 container mx-auto max-w-6xl px-4 py-8 pb-16">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Cover letter assistant
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-500">
            Upload your resume, paste a job description, and let AI create a
            personalized cover letter that highlights your relevant experience
            and skills.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8">
            <TechStack />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <Records />
            <LinkDisplay />
          </div>
          {/* <button
            className="text-green-400 bg-blue-200"
            onClick={() => {
              getAppliedJobs({
                limit: 5,
                sort_property: "date_applied",
                sort_direction: "desc",
              });
            }}
          >
            Get Applied Jobs
          </button> */}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-6">
            <FileUpload onResumeExtracted={setResume} />
            <DescriptionInput<JobRecord>
              value={jobData.job_description}
              onChange={setJobData}
              title="Job Description"
              field="job_description"
            />
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !jobData.job_description}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 px-6 font-semibold text-zinc-950 shadow-[0_0_28px_-6px_rgba(74,222,128,0.45)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  Generating cover letter…
                </>
              ) : (
                "Generate cover letter"
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

          {/* Job question + answer response (disabled for now)
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
                isAnswerGenerating || !resume || !jobData.job_description
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
          */}
        </div>
      </main>
    </div>
  );
}
