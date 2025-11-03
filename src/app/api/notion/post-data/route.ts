import { NextRequest, NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { stripHtml } from "@/helpers/notion";

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

export async function POST(req: NextRequest) {
  try {
    const {
      company,
      position,
      jobDescription,
      coverLetter,
      yoe,
      compensation,
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
          rich_text: toRichText(jobDescription),
        },
        yoe: {
          rich_text: toRichText(yoe.toString()),
        },
        compensation: {
          rich_text: toRichText(compensation),
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
