import { milvusClient } from "@/lib/clients/milvus";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection_name, embeddings } = body;

    const res = await milvusClient.search({
      collection_name: collection_name,
      data: embeddings,
      limit: 10,
      output_fields: ["text"],
    });

    console.log("milvus client search response; ", res);

    if (res.status.code !== 0)
      throw new Error(res.status.reason || "milvus search failed");

    return NextResponse.json({
      data: res,
      success: true,
      message: "success",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "milvus search failed" },
      { status: 500 },
    );
  }
}
