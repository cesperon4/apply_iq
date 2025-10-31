import { NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { formatPage } from "@/helpers/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function GET() {
  try {
    const databaseId = process.env.NOTION_LINKS_DATABASE_ID;
    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: "Missing NOTION_LINKS_DATABASE_ID" },
        { status: 400 }
      );
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      //   page_size: 10,
    });

    const results = response.results;

    const formattedResults = results.map((result) =>
      formatPage(result as PageObjectResponse)
    );

    // console.log("formattedResults: ", formattedResults);

    return NextResponse.json({
      success: true,
      data: formattedResults,
      message: "Fetched links successfully",
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
