import { NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { formatPage } from "@/helpers/notion";
import { type CountRecord } from "@/types/notion.types";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } } // pageId
) {
  try {
    const { id } = await params;
    const databaseId = process.env.NOTION_RECORDS_DATABASE_ID;
    const { count } = await req.json();

    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: "Missing NOTION_RECORDS_DATABASE_ID" },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing page ID" },
        { status: 400 }
      );
    }

    // Update properties on the Notion page
    const response = await notion.pages.update({
      page_id: id,
      properties: {
        count: { number: count },
      },
    });

    const formattedResult = formatPage(
      response as PageObjectResponse
    ) as CountRecord;

    return NextResponse.json({
      success: true,
      data: formattedResult,
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
