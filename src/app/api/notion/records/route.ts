import { NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { formatPage } from "@/helpers/notion";
import { type CountRecord } from "@/types/notion.types";

export async function GET() {
  try {
    const databaseId = process.env.NOTION_RECORDS_DATABASE_ID;
    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: "Missing NOTION_RECORDS_DATABASE_ID" },
        { status: 400 }
      );
    }

    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const formattedResults = response.results.map((result) =>
      formatPage(result as PageObjectResponse)
    ) as CountRecord[];

    return NextResponse.json({
      success: true,
      data: formattedResults,
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
