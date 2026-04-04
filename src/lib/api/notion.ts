import { type ApiResponse } from "@/types/api.types";
import { type GetJobs } from "@/types/api.types";
import { queryAppliedJobs } from "@/lib/notion/query-applied-jobs";
import { type AppliedJobsArgs } from "@/types/notion.types";

export async function getMyApplications(): Promise<ApiResponse<GetJobs>> {
  const res = await fetch("/api/notion/jobs", { method: "GET" });

  if (!res.ok)
    throw new Error(`HTTP error in getMyApplications! Status: ${res.status}`);
  const data: ApiResponse<GetJobs> = await res.json();
  return data;
}

/**
 * Used by server-side tool handlers (e.g. `runWithTools`). Uses the Notion
 * client directly so it does not rely on relative `fetch`, which fails in Node.
 */
export async function getAppliedJobs(args: AppliedJobsArgs): Promise<string> {
  const job_results = await queryAppliedJobs(args);
  console.log("job results: ", job_results);
  return JSON.stringify({ job_results });
}
