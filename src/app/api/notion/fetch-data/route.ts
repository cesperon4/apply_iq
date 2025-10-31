import { NextResponse } from "next/server";
import { notion } from "@/lib/clients/notion";
import { formatPage } from "@/helpers/notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      return NextResponse.json(
        { success: false, error: "Missing NOTION_DATABASE_ID" },
        { status: 400 }
      );
    }

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 1);

    const startDate = oneWeekAgo.toISOString();
    const endDate = today.toISOString();

    const response = await notion.databases.query({
      database_id: databaseId,
      //   page_size: 10,

      filter: {
        property: "date_applied", // your date property
        date: {
          on_or_after: startDate,
          on_or_before: endDate,
        },
      },
    });

    const results = response.results;

    const formattedResults = results.map((result) =>
      formatPage(result as PageObjectResponse)
    );

    return NextResponse.json({
      success: true,
      data: formattedResults,
      message: `Fetched applications from ${startDate} to ${endDate}`,
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
