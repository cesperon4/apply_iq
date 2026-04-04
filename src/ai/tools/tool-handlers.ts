// import { getAppliedJobs } from "@/lib/api/notion";
import { parseAppliedJobsArgs } from "@/ai/tools/parse-tool-args";
import { searchJobs } from "@/lib/notion/query-applied-jobs";
import { getTechCounts } from "@/lib/notion/query-applied-jobs";

/**
 * Every handler receives raw JSON from the model (`unknown`) and returns a string for the
 * `tool` message. Add one entry per tool name; each function parses args to its own type.
 */
export type ToolHandler = (args: unknown) => Promise<string>;

export const toolHandlers: Record<string, ToolHandler> = {
  search_jobs: async (args) => searchJobs(parseAppliedJobsArgs(args)),
  search_tech_occurrences: async (args) =>
    getTechCounts(parseAppliedJobsArgs(args)),

  // Example for a future tool:
  // lookup_company: async (args) => {
  //   const parsed = parseLookupCompanyArgs(args); // zod or manual
  //   return fetchCompanySummary(parsed);
  // },
};
