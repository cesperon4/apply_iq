import { NextRequest, NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { stripHtml } from "@/helpers/notion";
import { formatPage } from "@/helpers/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { type JobRecord } from "@/types/job.types";

// Utility to split a long string into Notion-safe rich_text chunks

function toRichText(content: string) {
  const maxLength = 2000;
  const chunks = [];
  let start = 0;

  while (start < content.length) {
    chunks.push({
      text: {
        content: content.slice(start, start + maxLength),
      },
    });
    start += maxLength;
  }

  return chunks;
}

function isJobData(item: unknown): item is JobRecord {
  // must have id and tech_stack must be an array if present

  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    "tech_stack" in item
  );
}

/**
 *
 * @param jobs array of JobData types
 * @returns a Map with technology names as keys and their counts as values
 */
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

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: "Missing NOTION_DATABASE_ID" },
        { status: 400 }
      );
    }

    let cursor: string | undefined = undefined;
    const pages: PageObjectResponse[] = [];

    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        sorts: [
          {
            property: "date_applied",
            direction: "descending", // or "ascending"
          },
        ],
        //   page_size: 10,
      });

      const next_cursor = response.next_cursor
        ? response.next_cursor
        : undefined;

      pages.push(...(response.results as PageObjectResponse[]));
      cursor = response.has_more ? next_cursor : undefined;
    } while (cursor);

    const formattedResults: unknown[] = pages.map((result) =>
      formatPage(result as PageObjectResponse)
    );

    const job_results: JobRecord[] = formattedResults.filter(isJobData);

    const tech_counts = getTechStackCounts(job_results);

    return NextResponse.json({
      success: true,
      data: { job_results, tech_counts: tech_counts },
      message: `Fetched applications successfully.`,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      company,
      position,
      job_description,
      coverLetter,
      yoe,
      compensation,
      tech_stack,
    } = await req.json();

    const cleanedCoverLetter = stripHtml(coverLetter);

    const newPage = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID!,
      },
      properties: {
        company: {
          title: [
            {
              text: { content: company },
            },
          ],
        },
        position: {
          rich_text: toRichText(position),
        },
        status: {
          status: { name: "applied" },
        },
        date_applied: {
          date: { start: new Date().toISOString() },
        },
        cover_letter: {
          rich_text: toRichText(cleanedCoverLetter),
        },
        job_description: {
          rich_text: toRichText(job_description),
        },
        yoe: {
          rich_text: toRichText(yoe.toString()),
        },
        compensation: {
          rich_text: toRichText(compensation),
        },
        tech_stack: {
          multi_select: tech_stack.map((tech: { name: string }) => ({
            name: tech.name.toLowerCase(),
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: newPage,
      message: "Data posted to Notion successfully.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
