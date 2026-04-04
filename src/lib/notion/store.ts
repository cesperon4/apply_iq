import { notion } from "@/lib/clients/notion";
import { type AppliedJobsArgs } from "@/types/notion.types";

type getJobsAppliedArgs = {
  limit?: number;
  direction: "ascending" | "descending";
  sort_property?: string;
  company?: string;
};

export async function getJobsApplied(args: getJobsAppliedArgs) {
  const databaseId = process.env.NOTION_DATABASE_ID; //move to server
  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID");
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: args.limit ? args.limit : undefined,
    sorts: [
      {
        property: args.sort_property || "date_applied",
        direction: args.direction,
      },
    ],
    ...(args.company
      ? {
          filter: {
            property: "company",
            title: { contains: args.company },
          },
        }
      : undefined),
  });

  return response.results;
}
