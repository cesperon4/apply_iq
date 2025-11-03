import { NextRequest, NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function POST(req: NextRequest) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: "Missing NOTION_DATABASE_ID" },
        { status: 400 }
      );
    }

    const { filter } = await req.json();
    let results: PageObjectResponse[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter,
        start_cursor: cursor,
        page_size: 100, // max allowed by Notion
      });

      results = results.concat(response.results as PageObjectResponse[]);
      cursor = response.has_more ? response.next_cursor! : undefined;
    } while (cursor);

    return NextResponse.json({
      success: true,
      data: results.length,
      message: "Fetched count successfully.",
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
