import { notion } from "@/lib/clients/notion";
import { formatPage } from "@/helpers/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { type JobRecord } from "@/types/job.types";
import {
  type AppliedJobsArgs,
  type GetTechCountArgs,
} from "@/types/notion.types";
import { getJobsApplied } from "./store";

function isJobData(item: unknown): item is JobRecord {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    "tech_stack" in item
  );
}

function getTechStackCounts(jobs: JobRecord[]) {
  // console.log("jobs: ", jobs);
  const techCounts: Record<string, number> = {};

  if (!jobs) return techCounts;

  for (const job of jobs) {
    for (const tech of job.tech_stack ?? []) {
      techCounts[tech.name] = !techCounts[tech.name]
        ? 1
        : techCounts[tech.name] + 1;
    }
  }

  return techCounts;
}

/** Loads applied jobs from Notion (used by tool handlers and any server code). */
export async function queryAppliedJobs(
  args: AppliedJobsArgs,
): Promise<JobRecord[]> {
  const databaseId = process.env.NOTION_DATABASE_ID; //move to server
  console.log("databaseId: ", databaseId);
  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID");
  }

  let cursor: string | undefined = undefined;
  const pages: PageObjectResponse[] = [];

  const rawDir = (args.sort_direction || "descending").toLowerCase();
  const direction =
    rawDir === "asc" || rawDir === "ascending" ? "ascending" : "descending";

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: args.limit > 0 ? args.limit : undefined,
      sorts: [
        {
          property: args.sort_property || "date_applied",
          direction,
        },
      ],
    });

    const next_cursor = response.next_cursor ? response.next_cursor : undefined;

    pages.push(...(response.results as PageObjectResponse[]));
    cursor = response.has_more ? next_cursor : undefined;
  } while (cursor);

  const formattedResults: unknown[] = pages.map((result) =>
    formatPage(result as PageObjectResponse),
  );
  return formattedResults.filter(isJobData);
}

export async function searchJobs(args: AppliedJobsArgs): Promise<string> {
  const pages: PageObjectResponse[] = [];

  const rawDir = (args.sort_direction || "descending").toLowerCase();
  const direction =
    rawDir === "asc" || rawDir === "ascending" ? "ascending" : "descending";
  const company = args.company || undefined;
  const sort_property = args.sort_property || undefined;
  const limit = args.limit > 0 ? args.limit : undefined;

  const results = await getJobsApplied({
    limit,
    direction: direction,
    sort_property,
    company,
  });

  pages.push(...(results as PageObjectResponse[]));

  const formattedResults: unknown[] = pages.map((result) =>
    formatPage(result as PageObjectResponse),
  );

  console.log("[searchJobs] returned results: ", formattedResults);
  return JSON.stringify(formattedResults.filter(isJobData));
}

export async function getTechCounts(args: GetTechCountArgs): Promise<string> {
  const pages: PageObjectResponse[] = [];
  const rawDir = (args.sort_direction || "descending").toLowerCase();
  const direction =
    rawDir === "asc" || rawDir === "ascending" ? "ascending" : "descending";
  const company = args.company || undefined;
  const sort_property = args.sort_property || undefined;
  const limit = args.limit > 0 ? args.limit : undefined;

  const results = await getJobsApplied({
    limit,
    direction: direction,
    sort_property,
    company,
  });

  pages.push(...(results as PageObjectResponse[]));

  const formattedResults: unknown[] = pages.map((result) =>
    formatPage(result as PageObjectResponse),
  );

  const job_results: JobRecord[] = formattedResults.filter(isJobData);
  const tech_counts = getTechStackCounts(job_results);

  console.log("[searchJobs] returned results: ", formattedResults);
  return JSON.stringify(tech_counts);
}
